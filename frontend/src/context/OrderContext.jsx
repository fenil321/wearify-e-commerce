import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";
import { CartContext } from "./CartContext";
import toast from "react-hot-toast";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  // Use useCallback to prevent unnecessary re-renders in components using this function
  const fetchOrders = useCallback(
    async (isSilent = false) => {
      if (!user?.id) return;

      try {
        if (!isSilent) setLoading(true);
        const { data } = await API.get("/api/orders/my-orders");
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (!isSilent) toast.error("Could not load your order history.");
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  const cancelOrder = async (id) => {
    try {
      // instantly set status to "Cancelled" in UI
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, status: "Cancelled" } : order,
        ),
      );

      // Backend now handles inventory restoration for specific sizes
      // and reverts coupon usage for the user
      await API.put(`/api/orders/${id}/cancel`);

      toast.success("Order cancelled. Items returned to stock.");

      // Re-fetch to ensure the UI has the absolute latest data from the DB
      fetchOrders(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancellation failed");
      // Revert the optimistic UI state by re-fetching
      fetchOrders(true);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const { data } = await API.post("/api/orders", orderData);

      await fetchOrders(true);

      await clearCart();
      return data;
    } catch (error) {
      console.error("Order Creation Error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    } else if (user === null) {
      setOrders([]);
    }
  }, [user?.id, fetchOrders]);

  return (
    <OrderContext.Provider
      value={{ orders, loading, fetchOrders, cancelOrder, createOrder }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
