import { createContext, useContext, useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper to get Guest Cart from LocalStorage ---
  const getGuestCart = () => {
    const saved = localStorage.getItem("guest_cart");
    return saved ? JSON.parse(saved) : { items: [] };
  };

  const fetchCart = async () => {
    if (!user) {
      setCart(getGuestCart());
      return;
    }

    try {
      if (!user) return;
      setLoading(true);
      const res = await API.get("/api/cart");
      setCart(res.data);
    } catch (error) {
      console.log("Fetch Cart Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // addToCart now handles both logged-in and guest users
  const addToCart = async (
    productId,
    quantity = 1,
    size,
    customization = null,
    productData = null,
  ) => {
    try {
      if (!size) return toast.error("Size is required");

      if (!user) {
        // GUEST LOGIC
        let guestCart = getGuestCart();
        const existingItemIndex = guestCart.items.findIndex((item) => {
          const isSameProduct =
            (item.product._id || item.product) === productId;
          const isSameSize = item.size === size;
          const isSameDesign =
            item.customization?.designId === customization?.designId;
          return isSameProduct && isSameSize && isSameDesign;
        });

        if (existingItemIndex > -1) {
          guestCart.items[existingItemIndex].quantity += quantity;
        } else {
          guestCart.items.push({
            product: productData,
            quantity,
            size,
            customization,
            _id: Date.now().toString(),
          });
        }

        localStorage.setItem("guest_cart", JSON.stringify(guestCart));
        setCart(guestCart);
        toast.success("Added to Bag (Guest)");
        return;
      }

      const res = await API.post("/api/cart/add", {
        productId,
        quantity,
        size,
        customization,
      });

      setCart(res.data);
      toast.success("Added to Bag");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const removeFromCart = async (
    productId,
    size,
    designId = null,
    printPosition = "front",
  ) => {
    if (!user) {
      // GUEST REMOVE LOGIC
      let guestCart = getGuestCart();
      guestCart.items = guestCart.items.filter(
        (item) => !(item.product._id === productId && item.size === size),
      );
      localStorage.setItem("guest_cart", JSON.stringify(guestCart));
      setCart(guestCart);
      toast.success("Item removed");
      return;
    }

    try {
      let url;
      const idString = designId?._id || designId;
      if (idString) {
        // Call the custom removal route
        url = `/api/cart/remove-custom/${productId}/${size}/${idString}/${printPosition}`;
      } else {
        // Call the plain removal route
        url = `/api/cart/remove-plain/${productId}/${size}`;
      }

      const res = await API.delete(url);
      setCart(res.data);
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const updateQuantity = async (
    productId,
    size,
    quantity,
    customization = null,
  ) => {
    if (!user) {
      // GUEST UPDATE LOGIC
      let guestCart = getGuestCart();
      const item = guestCart.items.find(
        (i) => i.product._id === productId && i.size === size,
      );
      if (item) {
        item.quantity = quantity;
        localStorage.setItem("guest_cart", JSON.stringify(guestCart));
        setCart(guestCart);
      }
      return;
    }

    try {
      const designId =
        customization?.designId?._id || customization?.designId || null;

      const printPosition = customization?.printPosition || "front";

      const res = await API.put("/api/cart/update", {
        productId,
        size,
        quantity,
        designId,
        printPosition,
      });
      setCart(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  // 1. Calculate the total quantity of items
  const cartCount = useMemo(() => {
    return cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  }, [cart]);

  const totalAmount = useMemo(() => {
    return (
      cart?.items?.reduce((acc, item) => {
        const product = item.product;
        if (!product || !product.sizes) return acc;

        // 1. Get Base Price for the shirt size
        const sizeData = product.sizes.find((s) => s.size === item.size);
        const basePrice = sizeData ? sizeData.price : 0;

        // 2. NEW: Add Printing Cost if customization exists
        let printingCost = 0;
        if (item.customization && product.customization?.isCustomizable) {
          const pSize = item.customization.printSize; // 'small', 'medium', or 'large'
          printingCost = product.customization.printPriceMap[pSize] || 0;
        }

        return acc + (basePrice + printingCost) * item.quantity;
      }, 0) || 0
    );
  }, [cart]);

  //  Clear cart locally and on server
  const clearCart = async () => {
    try {
      // You should have a DELETE /api/cart/clear route in your backend
      await API.delete("/api/cart/clear");
      setCart(null); // Reset local state
    } catch (error) {
      console.error("Clear Cart Error:", error);
      // Even if API fails, we often reset local state for UX
      setCart(null);
    }
  };

  useEffect(() => {
    const syncCart = async () => {
      if (user) {
        const guestCart = getGuestCart();
        if (guestCart.items.length > 0) {
          try {
            // Send guest items to a new "merge" endpoint or loop addToCart
            for (const item of guestCart.items) {
              await API.post("/api/cart/add", {
                productId: item.product._id,
                quantity: item.quantity,
                size: item.size,
                customization: item.customization,
              });
            }
            localStorage.removeItem("guest_cart");
          } catch (e) {
            console.error("Sync error", e);
          }
        }
        fetchCart();
      } else {
        setCart(getGuestCart());
      }
    };
    syncCart();
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        clearCart,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
