import express from "express";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.middleware.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import User from "../models/user.model.js";

const router = express.Router();

//Create a review (Verified Buyers Only)
router.post(
  "/",
  authMiddleware,
  upload.array("reviewImages", 5),
  async (req, res) => {
    try {
      const { rating, comment, productId } = req.body;
      const userId = req.user.id;

      // VALIDATION: Only allow if product was purchased and delivered
      const hasOrdered = await Order.findOne({
        user: userId,
        "orderItems.product": productId,
        status: "Delivered",
      });

      if (!hasOrdered) {
        return res.status(403).json({
          message:
            "Only customers who have received this product can leave a review.",
        });
      }

      // Prevent duplicate reviews from the same user
      const alreadyReviewed = await Review.findOne({
        user: userId,
        product: productId,
      });
      if (alreadyReviewed) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this product." });
      }

      // Handle Image Uploads to Cloudinary
      let imagesLinks = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "street_fashion/reviews",
          });

          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });

          // Delete local file after upload to keep 'uploads/' folder clean
          fs.unlinkSync(file.path);
        }
      }

      const userDetails = await User.findById(userId);
      // Create Review
      const review = await Review.create({
        user: userId,
        name: userDetails.name || "Anonymous Buyer",
        rating: Number(rating),
        comment,
        product: productId,
        reviewImages: imagesLinks,
      });

      const reviews = await Review.find({ product: productId });
      const numOfReviews = reviews.length;
      const avgRating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

      await Product.findByIdAndUpdate(productId, {
        ratings: avgRating,
        numOfReviews: numOfReviews,
      });

      res.status(201).json({ success: true, review });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },
);

// Get all reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar");

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a review (Owner or Admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this review" });
    }

    if (review.reviewImages && review.reviewImages.length > 0) {
      for (const image of review.reviewImages) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    const productId = review.product;

    await Review.findByIdAndDelete(req.params.id);

    const remainingReviews = await Review.find({ product: productId });
    const numOfReviews = remainingReviews.length;

    const avgRating =
      numOfReviews === 0
        ? 0
        : remainingReviews.reduce((acc, item) => item.rating + acc, 0) /
          numOfReviews;

    await Product.findByIdAndUpdate(productId, {
      ratings: avgRating,
      numOfReviews: numOfReviews,
    });

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
