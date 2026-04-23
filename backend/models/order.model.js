import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    orderItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        size: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },

        customization: {
          designId: {
            type: Schema.Types.ObjectId,
            ref: "AnimeDesign",
          },
          printSize: {
            type: String,
            enum: ["small", "medium", "large"],
          },
          printPosition: {
            type: String,
            enum: ["front", "back"],
            default: "front",
          },
        },
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    isRefunded: {
      type: Boolean,
      default: false,
    },
    refundedAt: {
      type: Date,
    },
    refundResult: {
      status: { type: String, default: "Not Initiated" }, // Pending, Success, Failed
      refundId: { type: String },
      updatedAt: { type: Date },
    },

    couponUsed: {
      coupon: {
        type: Schema.Types.ObjectId,
        ref: "coupon",
      },
      code: String,
      discount: Number,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: Date,

    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true },
);

const Order = model("order", orderSchema);
export default Order;
