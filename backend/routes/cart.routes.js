import express from "express";
import Cart from "../models/cart.model.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ADD TO CART
router.post("/add", authMiddleware, async (req, res) => {
  // Destructure the new customization object from the body
  const { productId, quantity, size, customization } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    const existingItem = cart.items.find((item) => {
      const isSameProduct = item.product.toString() === productId;
      const isSameSize = item.size === size;

      const itemCust = item.customization;
      const newCust = customization;

      // Check if both are plain items
      if (!itemCust && !newCust) return isSameProduct && isSameSize;

      // Check customization details
      const isSameDesign = itemCust?.designId?.toString() === newCust?.designId;
      const isSamePosition = itemCust?.printPosition === newCust?.printPosition; // 👈 New check
      const isSamePrintSize = itemCust?.printSize === newCust?.printSize;

      return (
        isSameProduct &&
        isSameSize &&
        isSameDesign &&
        isSamePosition &&
        isSamePrintSize
      );
    });

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem = {
        product: productId,
        quantity,
        size,
      };

      //  ONLY add customization if a designId exists (it's a custom product)
      if (customization && customization.designId) {
        newItem.customization = {
          designId: customization.designId,
          printSize: customization.printSize,
          printPosition: customization.printPosition || "front",
        };
      } else {
        // Ensure it is explicitly null for plain items
        newItem.customization = null;
      }

      cart.items.push(newItem);
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate("items.product")
      .populate({
        path: "items.customization.designId",
        model: "AnimeDesign",
        select: "name image",
      });

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET USER CART
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product")
      .populate({
        path: "items.customization.designId",
        model: "AnimeDesign",
        select: "name image",
      });

    if (!cart) return res.json({ items: [] });

    // Remove items where the product itself was deleted
    let filteredItems = cart.items.filter((item) => item.product !== null);

    // Remove items where the specific SIZE was removed by Admin
    filteredItems = filteredItems.filter((item) => {
      const product = item.product;
      // Check if the size in the cart still exists in the Product's sizes array
      return product.sizes.some((s) => s.size === item.size);
    });

    // Save the cleaned-up cart
    if (cart.items.length !== filteredItems.length) {
      cart.items = filteredItems;
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for removing CUSTOM items (with an anime design)
router.delete(
  "/remove-custom/:productId/:size/:designId/:printPosition",
  authMiddleware,
  async (req, res) => {
    try {
      const { productId, size, designId, printPosition } = req.params;
      const cart = await Cart.findOne({ user: req.user.id });

      cart.items = cart.items.filter((item) => {
        return !(
          item.product.toString() === productId &&
          item.size === size &&
          item.customization?.designId?.toString() === designId &&
          item.customization?.printPosition === printPosition
        );
      });

      await cart.save();
      const updatedCart = await Cart.findOne({ user: req.user.id })
        .populate("items.product")
        .populate({
          path: "items.customization.designId",
          model: "AnimeDesign",
          select: "name image",
        });

      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Route for removing PLAIN items (no anime design)
router.delete(
  "/remove-plain/:productId/:size",
  authMiddleware,
  async (req, res) => {
    try {
      const { productId, size } = req.params;
      const cart = await Cart.findOne({ user: req.user.id });

      cart.items = cart.items.filter((item) => {
        // Only remove if it's the right product/size AND has NO customization
        return !(
          item.product.toString() === productId &&
          item.size === size &&
          !item.customization?.designId
        );
      });

      await cart.save();

      const updatedCart = await Cart.findOne({ user: req.user.id })
        .populate("items.product")
        .populate({
          path: "items.customization.designId",
          model: "AnimeDesign",
          select: "name image",
        });

      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// UPDATE QUANTITY
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { productId, size, quantity, designId, printPosition } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    //  Match based on Product, Size, AND DesignId
    const item = cart.items.find((item) => {
      const isSameProduct = item.product.toString() === productId;
      const isSameSize = item.size === size;

      // Compare the IDs. If it's a normal product, both will be null/undefined.
      const itemDesignId = item.customization?.designId?.toString() || null;
      const targetDesignId = designId || null;

      const itemPosition = item.customization?.printPosition || "front";
      const targetPosition = printPosition || "front";

      return isSameProduct && isSameSize && itemDesignId === targetDesignId;
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;

    if (item.quantity <= 0) {
      cart.items = cart.items.filter((i) => {
        const isSameProduct = i.product.toString() === productId;
        const isSameSize = i.size === size;
        const itemDesignId = i.customization?.designId?.toString() || null;
        const targetDesignId = designId || null;

        const itemPosition = i.customization?.printPosition || "front";
        const targetPosition = printPosition || "front";

        // Keep the item if it's NOT the one we are looking for
        return !(
          isSameProduct &&
          isSameSize &&
          itemDesignId === targetDesignId &&
          itemPosition === targetPosition &&
          i.customization?.printSize === item.customization?.printSize
        );
      });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate("items.product")
      .populate({
        path: "items.customization.designId",
        model: "AnimeDesign",
        select: "name image",
      });

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//clear cart
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
