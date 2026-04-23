import express from "express";
import roleMiddleware from "../middleware/roleMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

const router = express.Router();

//for admin
router.get(
  "/admin-dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin!" });
  },
);

router.post(
  "/create-user",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.insertOne({
        name,
        email,
        password: hashedPassword,
        role,
      });

      res.json({
        message: "User created by admin",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
