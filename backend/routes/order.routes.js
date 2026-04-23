import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Coupon from "../models/coupon.model.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import { getPaginatedData } from "../utils/paginate.js";
import {
  generateOrderEmailHTML,
  generateCancelEmailHTML,
  generateStatusUpdateEmailHTML,
} from "../utils/orderEmail.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  // Start the Mongoose Session for ACID compliance
  const session = await Order.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user missing" });
    }

    const user = await User.findById(req.user.id).session(session);
    if (!user) throw new Error("User not found");

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      couponCode,
      paymentResult,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    let finalDiscount = 0;
    let appliedCoupon = null;

    // 1. ATOMIC COUPON VALIDATION & UPDATE
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        code: couponCode,
        isActive: true,
      }).session(session);

      if (appliedCoupon) {
        if (appliedCoupon.usedBy.includes(req.user.id)) {
          return res
            .status(400)
            .json({ message: "Coupon already used by you" });
        }
        if (new Date(appliedCoupon.expiresAt) < new Date()) {
          return res.status(400).json({ message: "This coupon has expired" });
        }
        if (appliedCoupon.usedCount >= appliedCoupon.usageLimit) {
          return res.status(400).json({ message: "Coupon limit reached" });
        }

        appliedCoupon.usedBy.push(req.user.id);
        appliedCoupon.usedCount += 1;
        await appliedCoupon.save({ session });

        finalDiscount =
          appliedCoupon.discountType === "percentage"
            ? (Number(totalPrice) * appliedCoupon.discountValue) / 100
            : appliedCoupon.discountValue;
      }
    }

    // 2. ATOMIC INVENTORY REDUCTION
    for (let item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error(`Product ${item.name} not found`);

      const sizeObj = product.sizes.find((s) => s.size === item.size);
      if (!sizeObj)
        throw new Error(`Size ${item.size} not found for ${product.name}`);

      if (sizeObj.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name} (Size: ${item.size})`,
        );
      }

      sizeObj.stock -= item.quantity;
      await product.save({ session });
    }

    // 3. ATOMIC ORDER CREATION
    const order = await Order.create(
      [
        {
          user: req.user.id,
          orderItems: orderItems.map((item) => ({
            product: item.product,
            name: item.name,
            image: item.image,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            customization: item.customization || null,
          })),
          shippingAddress,
          paymentMethod,
          totalPrice: Number((Number(totalPrice) - finalDiscount).toFixed(2)),
          couponUsed: appliedCoupon
            ? {
                coupon: appliedCoupon._id,
                code: appliedCoupon.code,
                discount: finalDiscount,
              }
            : null,
          // If it's ONLINE and we have a SUCCESS status from frontend, mark as paid
          isPaid:
            paymentMethod === "ONLINE" && paymentResult?.status === "SUCCESS",
          paidAt:
            paymentMethod === "ONLINE" && paymentResult?.status === "SUCCESS"
              ? Date.now()
              : null,
          paymentResult: paymentResult || null,
        },
      ],
      { session },
    );

    // IF WE REACH HERE, COMMIT THE TRANSACTION
    await session.commitTransaction();
    session.endSession();

    // --- SEND EMAIL ---
    try {
      const populatedOrder = await Order.findById(order[0]._id).populate({
        path: "orderItems.customization.designId",
        model: "AnimeDesign",
      });

      const subtotal = orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      const paymentStatus =
        order[0].paymentMethod === "COD"
          ? `<span style="color: #e67e22;">PENDING (CASH ON DELIVERY)</span>`
          : `<span style="color: #27ae60;">PAID (ONLINE)</span>`;

      await sendEmail({
        to: user.email,
        subject: `Order Confirmed: #${order[0]._id.toString().slice(-8)}`,
        html: generateOrderEmailHTML(
          populatedOrder,
          user.name,
          subtotal,
          paymentStatus,
        ),
      });
    } catch (emailError) {
      console.error("Email failed:", emailError);
    }

    res.status(201).json(order[0]);
  } catch (error) {
    // IF ANYTHING FAILS, ROLLBACK ALL CHANGES
    await session.abortTransaction();
    session.endSession();
    console.error("TRANSACTION ABORTED - CRASH REPORT:", error);
    res
      .status(400)
      .json({ message: error.message || "Order placement failed" });
  }
});

router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate("orderItems.product")
      .populate({
        path: "orderItems.customization.designId",
        model: "AnimeDesign",
        select: "name image",
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

//for successfull payment
router.put("/:id/pay", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Payment update failed" });
  }
});

router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;

      const result = await getPaginatedData({
        model: Order,
        page,
        limit,
        // Passing your specific population logic here
        populate: [
          { path: "user", select: "name email" },
          {
            path: "orderItems.customization.designId",
            select: "name image",
          },
        ],
      });

      // result contains { data, pagination }
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.put(
  "/admin/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.id).populate(
        "user",
        "email name",
      );

      if (!order) return res.status(404).json({ message: "Order not found" });

      // 1. Handle marking as Paid/Delivered flags
      if (status === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.isPaid = true;
        if (!order.paidAt) order.paidAt = Date.now();
      }
      // 2. Handle moving BACK from Delivered (Undo flags)
      else if (order.status === "Delivered" && status !== "Delivered") {
        order.isDelivered = false;
        order.deliveredAt = undefined;
        if (order.paymentMethod === "COD") {
          order.isPaid = false;
          order.paidAt = undefined;
        }
      }

      // Update actual status
      order.status = status;
      await order.save();

      await order.populate({
        path: "orderItems.customization.designId",
        model: "AnimeDesign", // Ensure this matches your model name
      });
      // 🔥 KEEP THIS: The dynamic email logic
      // if (order.user && order.user.email) {
      //   try {
      //     await sendEmail({
      //       to: order.user.email,
      //       subject: `Update on your Wearify Order #${order._id.toString().slice(-8)}`,
      //       // This uses the dynamic helper we created earlier
      //       html: generateStatusUpdateEmailHTML(order, order.user.name, status),
      //     });
      //     console.log(`Status (${status}) email sent to: ${order.user.email}`);
      //   } catch (mailError) {
      //     console.error("Status update email failed:", mailError.message);
      //   }
      // }

      // 🔥 KEEP THIS: The dynamic email logic
      if (order.user && order.user.email) {
        // We wrap it in a block but REMOVE 'await' to send in background
        sendEmail({
          to: order.user.email,
          subject: `Update on your Wearify Order #${order._id.toString().slice(-8)}`,
          html: generateStatusUpdateEmailHTML(order, order.user.name, status),
        })
          .then(() => {
            console.log(
              `Status (${status}) email sent to: ${order.user.email}`,
            );
          })
          .catch((mailError) => {
            // This catches the error even in the background
            console.error(
              "Background Status update email failed:",
              mailError.message,
            );
          });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.put("/:id/cancel", authMiddleware, async (req, res) => {
  // Start Session for ACID compliance
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    const userId = req.user.id;

    if (!order) throw new Error("Order not found");

    // Pre-cancellation checks
    if (order.status === "Delivered")
      throw new Error("Delivered orders cannot be cancelled");
    if (order.status === "Cancelled")
      throw new Error("Order is already cancelled");

    // 1. ATOMIC INVENTORY RESTORATION
    for (let item of order.orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        const sizeObj = product.sizes.find((s) => s.size === item.size);
        if (sizeObj) {
          sizeObj.stock += item.quantity;
          await product.save({ session });
        }
      }
    }

    // 2. ATOMIC COUPON RESTORATION
    if (order.couponUsed && order.couponUsed.coupon) {
      const coupon = await Coupon.findById(order.couponUsed.coupon).session(
        session,
      );
      if (coupon) {
        // Restore eligibility for the user
        coupon.usedBy = coupon.usedBy.filter(
          (u) => u.toString() !== userId.toString(),
        );
        // Decrease global usage count safely
        coupon.usedCount = Math.max(0, coupon.usedCount - 1);
        await coupon.save({ session });
      }
    }

    // 3. ATOMIC STATUS UPDATE
    order.status = "Cancelled";
    await order.save({ session });

    // COMMIT ALL CHANGES
    await session.commitTransaction();
    session.endSession();

    // --- SEND CANCELLATION EMAIL (Outside transaction) ---
    // We fetch user details after the commit to ensure data durability
    const user = await User.findById(userId);
    const populatedOrder = await Order.findById(order._id).populate({
      path: "orderItems.customization.designId",
      model: "AnimeDesign",
    });
    if (user && populatedOrder) {
      try {
        await sendEmail({
          to: user.email,
          subject: `Order Cancelled: #${order._id.toString().slice(-8)}`,
          html: generateCancelEmailHTML(populatedOrder, user.name),
        });
      } catch (emailError) {
        console.error("Cancellation email failed:", emailError);
      }
    }

    res.json({
      message: "Order cancelled. Inventory and coupon restored successfully.",
    });
  } catch (error) {
    // ROLLBACK EVERYTHING if any step fails
    await session.abortTransaction();
    session.endSession();
    console.error("CANCELLATION TRANSACTION ABORTED:", error.message);
    res.status(400).json({ message: error.message || "Cancellation failed" });
  }
});
// for dashboard
router.get(
  "/admin/stats",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      // 1. Basic Counts
      const totalUsers = await User.countDocuments();
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();
      const refundedCount = await Order.countDocuments({ isRefunded: true });

      const pendingRefundCount = await Order.countDocuments({
        paymentMethod: "ONLINE",
        isPaid: true,
        status: "Cancelled",
        isRefunded: false,
      });

      const pendingOrders = await Order.countDocuments({
        status: "Processing",
      });

      const topProducts = await Order.aggregate([
        { $unwind: "$orderItems" }, // Break orders down into individual items
        {
          $group: {
            _id: "$orderItems.name",
            value: { $sum: "$orderItems.quantity" },
          },
        },
        { $sort: { value: -1 } }, // Sort by highest quantity
        { $limit: 3 }, // Take the top 5
      ]);
      // 1. LOW STOCK ALERT LOGIC
      // Finds products where ANY size variant has a stock level below 5
      const lowStockProducts = await Product.find({
        "sizes.stock": { $lt: 5 },
      })
        .select("name sizes")
        .limit(5);

      // 2. CUSTOMIZATION INSIGHTS (Optional but helpful)
      // Count how many orders actually included an anime print
      const customOrderCount = await Order.countDocuments({
        "orderItems.customization.designId": { $exists: true },
      });

      // 2. Safe Revenue Aggregation
      const revenue = await Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);

      // 3. Safe Coupon Query (Check if model exists)
      let activeCoupons = [];
      try {
        activeCoupons = await Coupon.find({ isActive: true })
          .select("code usedCount usageLimit")
          .limit(3);
      } catch (e) {
        console.log("Coupon model query failed");
      }

      // 4. Safe Activity Feed (Handles deleted users)
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("user", "name");

      const recentUsers = await User.find().sort({ createdAt: -1 }).limit(2);

      const activityFeed = [
        ...recentOrders.map((o) => ({
          type: "ORDER",
          msg: `Order #${o._id.toString().slice(-6)} by ${o.user?.name || "Guest"}`,
          time: o.createdAt,
        })),
        ...recentUsers.map((u) => ({
          type: "USER",
          msg: `New user ${u.name} joined`,
          time: u.createdAt,
        })),
      ].sort((a, b) => b.time - a.time);

      res.json({
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        activeCoupons,
        activityFeed,
        totalRevenue: revenue[0]?.total || 0,
        lowStockAlerts: lowStockProducts.map((p) => ({
          name: p.name,
          // Filter to only show the specific sizes that are low
          lowSizes: p.sizes.filter((s) => s.stock < 5),
        })),
        customOrderCount,
        refundedCount,
        pendingRefundCount,
        topProducts: topProducts.map((p) => ({ name: p._id, value: p.value })),
      });
    } catch (error) {
      console.error("STATS ROUTE CRASH:", error); // Check your terminal for this!
      res.status(500).json({ message: error.message });
    }
  },
);

// Bulk update order statuses
router.put(
  "/admin/bulk-status",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    const { orderIds, status } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "No order IDs provided" });
    }

    try {
      // 1. Prepare Update Object
      const updateData = { status };

      // 2. Business Logic: If marking as Delivered, we must also mark as Paid (for COD)
      if (status === "Delivered") {
        updateData.isDelivered = true;
        updateData.deliveredAt = Date.now();
        updateData.isPaid = true;
        // We use $set to ensure these specific fields are updated
      }

      // 3. Perform the bulk update in one DB hit
      await Order.updateMany({ _id: { $in: orderIds } }, { $set: updateData });

      // 4. (Optional) Email Logic
      // Note: Sending 50 emails at once in a loop can slow down the response.
      // In a real production app, you'd use a Queue (like BullMQ).
      // For now, we'll just return the success message.

      // 3.  FETCH DATA FOR EMAILS
      // We need to populate the user to get their email and name
      const updatedOrders = await Order.find({
        _id: { $in: orderIds },
      }).populate("user", "email name");

      // 4. SEND EMAILS IN THE BACKGROUND (Don't use 'await' inside the loop)
      updatedOrders.forEach((order) => {
        if (order.user && order.user.email) {
          // Trigger email but don't wait for it to finish
          sendEmail({
            to: order.user.email,
            subject: `Update on your Wearify Order #${order._id.toString().slice(-8)}`,
            html: generateStatusUpdateEmailHTML(order, order.user.name, status),
          }).catch((err) =>
            console.error(`Bulk Email Error for ${order._id}:`, err),
          );
        }
      });

      res.json({
        message: `Successfully updated ${updatedOrders.length} orders to ${status}`,
        updatedCount: updatedOrders.length,
      });
    } catch (error) {
      console.error("BULK UPDATE ERROR:", error);
      res.status(500).json({ message: "Bulk update failed" });
    }
  },
);
export default router;
