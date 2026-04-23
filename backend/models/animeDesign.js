import mongoose, { Schema, model } from "mongoose";

const animeDesignSchema = new Schema(
  {
    name: { type: String, required: true },
    image: {
      url: { type: String, required: true }, // Cloudinary URL
      public_id: String,
    },
    category: String, // e.g., "Naruto", "JJK"
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default model("AnimeDesign", animeDesignSchema);
