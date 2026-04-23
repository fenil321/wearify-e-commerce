import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState(null);

  const fetchWishlist = async () => {
    try {
      if (!user) return;
      const res = await API.get("/api/wishlist");
      setWishlist(res.data);
    } catch (error) {
      toast.error("Wishlist fetch failed", error);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const res = await API.post("/api/wishlist/add", { productId });
      setWishlist(res.data);
      toast.success("Added to wishlist");
    } catch (error) {
      toast.error("failed to add Wishlist", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    const res = await API.delete(`/api/wishlist/remove/${productId}`);
    setWishlist(res.data);
  };

  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlist(null);
  }, [user]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
