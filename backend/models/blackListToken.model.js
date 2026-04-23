import { model, Schema } from "mongoose";

const blacklistSchema = new Schema({
  token: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24, //auto delete after 1 day
  },
});

const blacklistToken = model("blackListToken", blacklistSchema);

export default blacklistToken;
