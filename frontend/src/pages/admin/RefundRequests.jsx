import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  Loader2,
  Banknote,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const RefundRequests = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Fetch pending refunds from your new backend route
  const fetchPendingRefunds = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/refunds/pending");
      setRefunds(data);
    } catch (error) {
      toast.error("Failed to load refund queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRefunds();
  }, []);

  // Handle the refund processing
  const handleProcessRefund = async (orderId) => {
    try {
      setProcessingId(orderId);
      const { data } = await API.put(`/api/refunds/${orderId}/process`);

      toast.success(data.message);

      // Remove the refunded order from the list immediately (Optimistic UI)
      setRefunds((prev) => prev.filter((order) => order._id !== orderId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Refund failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="animate-spin text-gray-600 mb-2" size={40} />
        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
          Scanning for refund requests...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Refund Queue
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Manage pending returns for cancelled online orders
          </p>
        </div>
        <div className="bg-red-100 text-red-500 px-4 py-2 rounded-2xl font-black text-sm uppercase">
          {refunds.length} Pending
        </div>
      </div>

      {refunds.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
          <CheckCircle className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">
            All caught up! No pending refunds.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Order Details
                </th>
                <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Customer
                </th>
                <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Amount
                </th>
                <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Reason
                </th>
                <th className="p-5 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {refunds.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-5">
                    <p className="font-black text-gray-900 text-sm uppercase mb-1">
                      #{order._id.slice(-8)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      Placed: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-sm text-gray-800">
                      {order.user?.name}
                    </p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="p-5">
                    <p className="font-black text-gray-900 text-base">
                      ₹{order.totalPrice.toLocaleString()}
                    </p>
                  </td>
                  <td className="p-5">
                    <span className="bg-red-50 text-red-500 text-[10px] font-black uppercase px-2 py-1 rounded-lg">
                      Cancelled
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => handleProcessRefund(order._id)}
                      disabled={processingId === order._id}
                      className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {processingId === order._id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <>
                          <Banknote size={14} /> Process Refund
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RefundRequests;
