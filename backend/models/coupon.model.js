import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    usageLimit: {
      type: Number,
      default: 100, // only the first 100 people get the discount
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Coupon = model("coupon", couponSchema);
export default Coupon;
