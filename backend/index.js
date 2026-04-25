import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectMongoDB } from "./config/db.js";
import userRouter from "./routes/authRoutes.js";
import testRouter from "./routes/testRoutes.js";
import adminRouter from "./routes/admin.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import userProfileRouter from "./routes/user.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import cookieParser from "cookie-parser";
import animeRouter from "./routes/animeRoutes.js";
import reviewRouter from "./routes/review.routes.js";
import contactRouter from "./routes/contact.routes.js";
import refundRouter from "./routes/refund.routes.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://wearify-ten.vercel.app"], //"http://localhost:5173", //for fontend URL
    credentials: true,
  }),
);

//middleware
app.use(cookieParser());
app.use(express.json()); //body parser

//routes
app.use("/api/auth", userRouter);
app.use("/api/test", testRouter);
app.use("/api/admin", adminRouter);

app.use("/api/products", productRouter);

//for cart
app.use("/api/cart", cartRouter);

//for wishlist
app.use("/api/wishlist", wishlistRouter);
//order api
app.use("/api/orders", orderRouter);

//user profile
app.use("/api/users", userProfileRouter);

//coupon
app.use("/api/coupons", couponRouter);

//anime
app.use("/api/anime-designs", animeRouter);

//review
app.use("/api/reviews", reviewRouter);

//contact-us
app.use("/api/contact", contactRouter);

//refund routes
app.use("/api/refunds", refundRouter);
// Testing routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

//connect DB
connectMongoDB(process.env.MONGODB_URI).then(() => {
  console.log(`MongoDB connected!`);
});

//start Server
app.listen(PORT, () => {
  console.log(`Server running on PORT:${PORT}`);
});
