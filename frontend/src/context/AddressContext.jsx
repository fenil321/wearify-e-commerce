import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await API.get("/api/users/address");
      setAddresses(data);
    } catch (error) {
      console.error("Fetch Address Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address) => {
    try {
      const { data } = await API.post("/api/users/address", address);
      setAddresses(data);
      toast.success("Address added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  const deleteAddress = async (id) => {
    try {
      const { data } = await API.delete(`/api/users/address/${id}`);
      setAddresses(data);
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const setDefault = async (id) => {
    try {
      const { data } = await API.put(`/api/users/address/default/${id}`);
      setAddresses(data);
      toast.success("Default address updated");
    } catch (error) {
      toast.error("Could not set default address");
    }
  };

  // Only fetch when user logs in, clear when they log out
  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
    }
  }, [user]);

  return (
    <AddressContext.Provider
      value={{ addresses, loading, addAddress, deleteAddress, setDefault }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
