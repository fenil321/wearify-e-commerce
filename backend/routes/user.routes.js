import express from "express";
import User from "../models/user.model.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
   GET USER PROFILE
   Protected Route
*/
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
   UPDATE USER PROFILE
*/
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, gender } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD NEW ADDRESS
router.post("/address", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.address.push(req.body);

    await user.save();

    res.json(user.address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL ADDRESSES
router.get("/address", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json(user.address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE ADDRESS
router.delete("/address/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.address = user.address.filter(
      (addr) => addr._id.toString() !== req.params.id,
    );

    await user.save();

    res.json(user.address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SET DEFAULT ADDRESS
router.put("/address/default/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.address.forEach((addr) => {
      addr.isDefault = addr._id.toString() === req.params.id;
    });

    await user.save();

    res.json(user.address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL USERS (Admin)
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

//Block user (Admin)
router.put(
  "/admin/:id/block",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.isBlocked = !user.isBlocked;

      await user.save();

      res.json({
        message: user.isBlocked ? "User blocked" : "User unblocked",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
