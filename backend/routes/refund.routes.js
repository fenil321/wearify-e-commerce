import express from "express";
import Order from "../models/order.model.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import { getRefundEmail } from "../utils/refundEmail.js";

const router = express.Router();

// Get all orders that need a refund
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const pendingRefunds = await Order.find({
        paymentMethod: "ONLINE",
        isPaid: true,
        status: "Cancelled",
        isRefunded: false,
      }).populate("user", "name email");

      res.json(pendingRefunds);
    } catch (error) {
      res.status(500).json({ message: "Error fetching refund queue" });
    }
  },
);

// Process a refund
router.put(
  "/:id/process",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate(
        "user",
        "name email",
      );

      if (!order) return res.status(404).json({ message: "Order not found" });

      const generatedRefundId = `REF-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

      order.isRefunded = true;
      order.refundedAt = new Date();
      order.refundResult = {
        status: "SUCCESS",
        refundId: generatedRefundId,
        updatedAt: new Date(),
      };

      await order.save();

      // TRIGGER EMAIL
      try {
        await sendEmail({
          to: order.user.email,
          subject: `Wearify: Refund Processed for Order #${order._id.toString().slice(-8).toUpperCase()}`,
          html: getRefundEmail(order, generatedRefundId),
        });
      } catch (emailError) {
        console.error(
          "Email failed to send, but database was updated:",
          emailError,
        );
      }

      res.json({ message: "Refund processed successfully!", order });
    } catch (error) {
      res.status(500).json({ message: "Refund processing failed" });
    }
  },
);

export default router;
