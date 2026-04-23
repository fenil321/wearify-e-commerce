import express from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import Wishlist from "../models/wishlist.model.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.middleware.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { getProductFilters } from "../utils/apiFeatures.js";

const router = express.Router();

//private
//create product (admin only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const uploadedImages = [];
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }

      const { name, description, category, subCategory, sizes, customization } =
        req.body;

      const product = await Product.create({
        name,
        description,
        category,
        subCategory,
        sizes: sizes ? JSON.parse(sizes) : [], // This now expects [{size: 'M', price: 100, stock: 5}]
        customization: customization
          ? JSON.parse(customization)
          : {
              isCustomizable: false,
              printPriceMap: { small: 0, medium: 0, large: 0 },
            },
        images: uploadedImages,
        createdBy: req.user.id,
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

//update product(admin)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      // 1. Handle Images (Keep your existing merge logic)
      let keptImages = req.body.existingImages
        ? JSON.parse(req.body.existingImages)
        : product.images;
      const imagesToDelete = product.images.filter(
        (oldImg) =>
          !keptImages.some((keep) => keep.public_id === oldImg.public_id),
      );

      for (let img of imagesToDelete) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      }

      const newUploadedImages = [];
      if (req.files && req.files.length > 0) {
        for (let file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });
          newUploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      }
      product.images = [...keptImages, ...newUploadedImages];

      // 2. Updated Field Assignments for New Schema
      const { name, description, category, subCategory, sizes, customization } =
        req.body;

      product.name = name || product.name;
      product.description = description || product.description;
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory; // Added

      //  Handle customization update
      if (customization) {
        product.customization =
          typeof customization === "string"
            ? JSON.parse(customization)
            : customization;
      }

      // Handle the new sizes structure
      if (sizes) {
        product.sizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      }

      await product.save();
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

//delete product (admin)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // 1. CLEANUP: Remove product from all Carts
      // $pull removes all instances of the productId from the items array
      await Cart.updateMany(
        { "items.product": productId },
        { $pull: { items: { product: productId } } },
      );

      // 2. CLEANUP: Remove product from all Wishlists
      await Wishlist.updateMany(
        { "items.product": productId },
        { $pull: { items: { product: productId } } },
      );

      // 3. CLOUDINARY: Delete images
      for (let img of product.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      // 4. DATABASE: Delete the actual product
      await product.deleteOne();

      res.status(200).json({
        message: "Product Deleted successfully",
      });
    } catch (error) {
      console.error("Delete Cleanup Error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const totalStock = product.sizes.reduce((acc, curr) => acc + curr.stock, 0);

    res.status(200).json({
      ...product._doc,
      totalStock,
      isLowStock: totalStock < 5,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    //  Get the base filters from your helper (without skip/limit yet)
    const { queryStr, sortOption } = getProductFilters(req.query);

    //  Count the total products matching these filters in the DB
    const totalProducts = await Product.countDocuments(queryStr);

    //  Handle pagination numbers
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 8;
    const skip = (page - 1) * limit;

    //  Fetch the actual products for the current page
    const products = await Product.find(queryStr)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    //  IMPORTANT: Return an object, not just an array!
    res.json({
      products,
      total: totalProducts,
      page,
      pages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET Related Products
router.get("/related/items", async (req, res) => {
  try {
    const { category, subCategory, productId } = req.query;

    // Build the filter
    const query = {
      _id: { $ne: productId },
      category: category,
      subCategory: subCategory,
    };

    // Fetch the data
    const related = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(4)
      .select("name price images category subCategory customization sizes");

    res.status(200).json(related);
  } catch (error) {
    res.status(500).json({ message: "Error fetching related products" });
  }
});

router.get("/upsell/items", async (req, res) => {
  try {
    const { category, subCategory, productId, price } = req.query;

    const currentPrice = Number(price) || 0;

    // Build the Upsell Filter
    const query = {
      _id: { $ne: productId }, // Exclude the current product
      category: category, // Stay within the same Gender (Men/Women)
      $or: [
        { subCategory: subCategory }, // Same style (e.g., another T-shirt)
        { price: { $gt: currentPrice } }, // OR any item that costs more (Upsell)
        { tags: { $in: [subCategory, "premium", "new-arrival"] } }, // Match by style tags
      ],
    };

    // Fetch data with Upsell Sorting
    const upsellItems = await Product.find(query)
      .sort({
        price: -1, //  Primary Sort: Higher price items first (Upsell)
        createdAt: -1, // Secondary Sort: Newest items
      })
      .limit(4)
      .select("name price images category subCategory customization sizes");

    res.status(200).json(upsellItems);
  } catch (error) {
    console.error("Upsell Fetch Error:", error);
    res.status(500).json({ message: "Error fetching upsell products" });
  }
});

// GET Distinct Subcategories
router.get("/subcategories/list", async (req, res) => {
  try {
    // .distinct("subCategory") returns [ "T-shirt", "Hoodie", "Shirt" ] etc.
    const subCategories = await Product.distinct("subCategory");

    // Sort them alphabetically for a better UI experience
    const sortedSubCategories = subCategories.sort((a, b) =>
      a.localeCompare(b),
    );

    res.status(200).json(sortedSubCategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subcategories" });
  }
});

export default router;
