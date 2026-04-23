import express from "express";
import upload from "../middleware/upload.middleware.js";
import cloudinary from "../config/cloudinary.js";
import AnimeDesign from "../models/animeDesign.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import fs from "fs";

const router = express.Router();

// Get all available anime designs for the frontend
router.get("/", async (req, res) => {
  try {
    const designs = await AnimeDesign.find({ isAvailable: true });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch designs" });
  }
});

// Securely Upload to Cloudinary and Save to MongoDB
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, category } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Use your existing Cloudinary config to upload
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "wearify/anime_prints",
        // Important for custom prints: Ensure PNG transparency is kept
        format: "png",
      });

      //Save to your MongoDB model
      const newDesign = new AnimeDesign({
        name,
        category,
        image: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });

      await newDesign.save();

      // CLEANUP: Delete the local file from /uploads so your server stays clean
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(201).json(newDesign);
    } catch (error) {
      // Cleanup even on error to prevent storage leaks
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: error.message });
    }
  },
);

// Delete design from DB and Cloudinary
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const design = await AnimeDesign.findById(req.params.id);
      if (!design) return res.status(404).json({ message: "Design not found" });

      // Optional: Delete from Cloudinary as well
      await cloudinary.uploader.destroy(design.image.public_id);

      await AnimeDesign.findByIdAndDelete(req.params.id);
      res.json({ message: "Design deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
