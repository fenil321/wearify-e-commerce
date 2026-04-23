import mongoose, { model, Schema } from "mongoose";

const imageSchema = new Schema({
  url: String,
  public_id: String,
});

const sizeSchema = new Schema({
  size: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
});

// costs for different print sizes
const customizationOptionsSchema = new Schema({
  isCustomizable: {
    type: Boolean,
    default: false, // Only true for plain shirts/t-shirts
  },
  printPriceMap: {
    small: { type: Number, default: 100 }, // Extra cost for small print
    medium: { type: Number, default: 200 }, // Extra cost for medium print
    large: { type: Number, default: 350 }, // Extra cost for large print
  },
});

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    sizes: [sizeSchema],
    images: [imageSchema],

    // For the Custom Print Feature
    customization: customizationOptionsSchema,

    // FOR REVIEWS
    ratings: {
      type: Number,
      default: 0, // rating (e.g., 4.5)
    },
    numOfReviews: {
      type: Number,
      default: 0, // Total number of people who reviewed
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true },
);

const Product = model("Product", productSchema);
export default Product;
