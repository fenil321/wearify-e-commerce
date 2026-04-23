import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Wishlist from "../models/wishlist.model.js";

const router = express.Router();
//add
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: [],
      });
    }

    const alreadyExists = wishlist.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!alreadyExists) {
      wishlist.items.push({ product: productId });
    }

    await wishlist.save();

    const updatedWishlist = await Wishlist.findOne({
      user: req.user.id,
    }).populate("items.product");

    res.json(updatedWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET USER WISHLIST
router.get("/", authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      "items.product",
    );

    if (!wishlist) return res.json({ items: [] });

    // Filter out items where the product was deleted by Admin
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter((item) => item.product !== null);

    // Only save if items were actually removed to save database performance
    if (wishlist.items.length !== initialLength) {
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//remove
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findOne({
      user: req.user.id,
    }).populate("items.product");

    res.json(updatedWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
