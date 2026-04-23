import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();

// --- ADMIN ROUTES ---

// Get all coupons for admin dashboard
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  },
);

//  Create a new coupon
router.post(
  "/admin/create",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const {
        code,
        discountType,
        discountValue,
        minOrderAmount,
        expiresAt,
        usageLimit,
        firstOrderOnly,
      } = req.body;

      const exists = await Coupon.findOne({ code: code.toUpperCase() });
      if (exists)
        return res.status(400).json({ message: "Coupon code already exists" });

      const coupon = await Coupon.create({
        code,
        discountType,
        discountValue,
        minOrderAmount,
        expiresAt,
        usageLimit,
        firstOrderOnly: firstOrderOnly || false,
      });

      res.status(201).json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Error creating coupon" });
    }
  },
);

// Delete a coupon
router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      await Coupon.findByIdAndDelete(req.params.id);
      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Delete failed" });
    }
  },
);

// --- USER ROUTES ---

// Validate a coupon code (For Cart/Checkout)
router.post("/validate", optionalAuth, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ message: "Invalid or inactive coupon code" });
    }

    // First Order Check
    if (coupon.firstOrderOnly) {
      if (!req.user) {
        return res.status(400).json({
          message: "Please login to use this first-order discount",
        });
      }
      // Check if user has any orders that are NOT cancelled
      const previousOrders = await Order.findOne({
        user: req.user.id,
        status: { $ne: "Cancelled" },
      });

      if (previousOrders) {
        return res.status(400).json({
          message: "This coupon is only valid for your first order!",
        });
      }
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (req.user && coupon.usedBy.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You have already used this coupon" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order of ₹${coupon.minOrderAmount} required`,
      });
    }

    res.json({
      message: "Coupon applied successfully",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      code: coupon.code,
    });
  } catch (error) {
    res.status(500).json({ message: "Validation failed" });
  }
});

//  Get all active coupons for users
router.get("/available", async (req, res) => {
  try {
    // Find coupons that are active AND have an expiry date greater than "now"
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available offers" });
  }
});
export default router;
