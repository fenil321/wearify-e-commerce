import mongoose, { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        size: String,
        // Customization object for Anime Prints
        customization: {
          designId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AnimeDesign", // Link to your new AnimeDesign model
          },
          printSize: {
            type: String,
            enum: ["small", "medium", "large"],
          },
          printPosition: { type: String, default: "front" },
        },
      },
    ],
  },
  { timestamps: true },
);

const Cart = model("Cart", cartSchema);
export default Cart;
