import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

import {
  Loader2,
  Package,
  User,
  Calendar,
  CreditCard,
  ShoppingBag,
  MapPin,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Download,
  Lock,
} from "lucide-react";
import AdminPagination from "../../components/admin/AdminPagination";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAddress, setExpandedAddress] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  // --- NEW STATE FOR BULK ACTIONS ---
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/api/orders/admin/all?page=${page}`);
      setOrders(data.data);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
      });
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    // KEEP a backup of current orders for "Rollback" if the API fails
    const previousOrders = [...orders];

    // Update the UI immediately (Optimistic Update)
    // This makes the dropdown flip status the millisecond you click it
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === id ? { ...order, status: status } : order,
      ),
    );

    try {
      // The API call
      const { data } = await API.put(`/api/orders/admin/${id}/status`, {
        status,
      });

      //  Sync the specific order with the latest data from the server
      // (This automatically handles 'isPaid' or 'deliveredAt' flags sent back by the backend)
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === id ? data : order)),
      );

      toast.success(`Order marked as ${status}`);
    } catch (error) {
      //  If the network fails, undo the change (Rollback)
      setOrders(previousOrders);
      toast.error("Failed to update status. Please try again.");
      console.error(error);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus) return toast.error("Please select a status");

    try {
      setLoading(true);

      await API.put(`/api/orders/admin/bulk-status`, {
        orderIds: selectedOrders,
        status: bulkStatus,
      });

      toast.success(`Updated ${selectedOrders.length} orders to ${bulkStatus}`);
      setSelectedOrders([]);
      setBulkStatus("");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk update failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectOrder = (order) => {
    if (order.status === "Delivered" || order.status === "Cancelled") {
      return toast.error("Finalized orders cannot be bulk updated");
    }

    setSelectedOrders((prev) =>
      prev.includes(order._id)
        ? prev.filter((item) => item !== order._id)
        : [...prev, order._id],
    );
  };

  const handleSelectAll = () => {
    //  Get only the orders that are actually editable
    const editableOrders = orders.filter(
      (order) => order.status !== "Delivered" && order.status !== "Cancelled",
    );

    //  Check if we have already selected all the editable ones
    if (
      selectedOrders.length === editableOrders.length &&
      editableOrders.length > 0
    ) {
      // If all editable ones are selected, clear selection
      setSelectedOrders([]);
    } else {
      // Otherwise, select ONLY the IDs of the editable orders
      const editableOrderIds = editableOrders.map((order) => order._id);
      setSelectedOrders(editableOrderIds);

      // Optional: show a toast if some orders were skipped
      if (editableOrders.length < orders.length) {
        toast(
          `${orders.length - editableOrders.length} finalized orders were skipped.`,
          {
            icon: "ℹ️",
          },
        );
      }
    }
  };

  const exportToCSV = () => {
    if (orders.length === 0) return toast.error("No orders to export");

    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Email",
      "Total Price",
      "Status",
      "Is Paid",
      "Items",
      "Customization Details",
      "Shipping Address",
    ];

    const csvRows = orders.map((order) => {
      //  Safe Items Mapping
      const itemsList =
        order.orderItems
          ?.map((i) => `${i.name}(${i.size} x${i.quantity})`)
          .join("; ") || "No Items";

      const customizationDetails =
        order.orderItems
          ?.map((i) => {
            if (i.customization?.designId) {
              return `${i.name}: ${i.customization.designId.name || "Custom"} (${i.customization.printSize}) at ${i.customization.printPosition || "Front"}`;
            }
            return null;
          })
          .filter(Boolean) // Remove nulls (plain items)
          .join("; ") || "None"; // Default to "None" if no custom items in order

      //  Safe Address Mapping (This is where your error was!)
      const address = order.shippingAddress
        ? `${order.shippingAddress.street || ""}, ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} ${order.shippingAddress.postalCode || ""}`.replace(
            /,/g,
            " ",
          ) // Remove commas to avoid breaking CSV columns
        : "No Address Provided";

      return [
        order._id,
        new Date(order.createdAt).toLocaleDateString(),
        `"${order.user?.name || "Guest"}"`,
        order.user?.email || "N/A",
        order.totalPrice || 0,
        order.status || "Unknown",
        order.isPaid ? "Yes" : "No",
        `"${itemsList}"`,
        `"${customizationDetails}"`,
        `"${address}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Wearify_Orders_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV Exported successfully");
    } catch (err) {
      toast.error("Export failed");
      console.error(err);
    }
  };
  const handlePrintInvoice = (order) => {
    const printWindow = window.open("", "_blank");

    // Calculate subtotal for the invoice display
    const subtotal = order.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const discount = order.couponUsed?.discount || 0;

    printWindow.document.write(`
      <html>
        <head><title>Invoice - ${order._id.slice(-8)}</title></head>
        <body style="font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1 style="text-transform: uppercase; letter-spacing: 2px; margin: 0;">Wearify</h1>
            <h2 style="margin: 0; color: #666;">INVOICE</h2>
          </div>
          <p style="margin-top: 10px;"><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;"/>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="flex: 1;">
              <h3 style="text-transform: uppercase; font-size: 14px; color: #888;">Customer</h3>
              <p><strong>${order.user?.name || "Guest"}</strong><br/>${order.user?.email || ""}</p>
            </div>
            <div style="flex: 1; text-align: right;">
              <h3 style="text-transform: uppercase; font-size: 14px; color: #888;">Shipping Address</h3>
              <p>${order.shippingAddress.fullName}<br/>
                 ${order.shippingAddress.street}<br/>
                 ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br/>
                 Phone: ${order.shippingAddress.phone}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #000; color: #fff; text-align: left;">
                <th style="padding: 12px;">Item</th>
                <th style="padding: 12px;">Size</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Price</th>
                <th style="padding: 12px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
             
              ${order.orderItems
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    <div style="font-weight: bold;">${item.name}</div>
                    ${
                      item.customization?.designId
                        ? `<div style="font-size: 11px; color: #15803d; text-transform: uppercase; font-weight: 900; margin-top: 4px;">
                            Print: ${item.customization.designId?.name || "Anime Print"} (${item.customization.printSize})
                            <br/>Location: ${item.customization.printPosition || "Front"} Side
                          </div>`
                        : ""
                    }
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.size}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div style="width: 100%; display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="width: 250px;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Subtotal:</span>
                <span>₹${subtotal.toLocaleString()}</span>
              </div>
              ${
                order.couponUsed
                  ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #15803d; font-weight: bold;">
                <span>Discount (${order.couponUsed.code}):</span>
                <span>- ₹${discount.toLocaleString()}</span>
              </div>
              `
                  : ""
              }
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 2px solid #eee;">
                <span>Shipping:</span>
                <span style="color: #15803d;">FREE</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 20px; font-weight: 900;">
                <span>Grand Total:</span>
                <span>₹${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 50px; text-align: center; color: #888; font-size: 12px;">
            <p>Thank you for shopping with Wearify!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Manage Orders
          </h1>

          <div className="flex items-center gap-2">
            {/* --- NEW: SELECT ALL BUTTON --- */}
            {orders.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-indigo-50 hover:border-gray-300 transition-all bg-indigo-50 shadow-sm active:scale-95"
              >
                {selectedOrders.length === orders.length ? (
                  <CheckSquare size={18} className="fill-black text-white" />
                ) : (
                  <Square size={18} className="text-gray-300" />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                  {selectedOrders.length === orders.length
                    ? "Deselect All"
                    : "Select All"}
                </span>
              </button>
            )}

            {/* --- NEW: EXPORT CSV BUTTON --- */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-emerald-50 hover:border-emerald-300 transition-all bg-emerald-50 text-emerald-700 shadow-sm active:scale-95"
            >
              <Download size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                Export CSV
              </span>
            </button>
          </div>
        </div>
        {/* --- BULK ACTION BAR --- */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100 animate-in slide-in-from-top duration-300">
            <span className="text-xs font-black uppercase text-black ml-2">
              {selectedOrders.length} Selected
            </span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="p-2 text-xs font-bold rounded-lg border-2 border-indigo-200 outline-none"
            >
              <option value="">Update Status...</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              onClick={handleBulkUpdate}
              className="bg-black text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98] shadow-2xl disabled:bg-gray-200 disabled:text-gray-400"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-gray-400 hover:text-gray-600 px-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className={`bg-white rounded-xl border transition-all overflow-hidden ${
                selectedOrders.includes(order._id)
                  ? "border-black ring-1 ring-black shadow-md"
                  : "border-gray-100 shadow-sm"
              }`}
            >
              {/* Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {/* --- CHECKBOX FOR SELECTION --- */}
                  <button
                    onClick={() => toggleSelectOrder(order)}
                    className="text-indigo-600"
                  >
                    {selectedOrders.includes(order._id) ? (
                      <CheckSquare
                        size={20}
                        className="fill-black text-white"
                      />
                    ) : (
                      <Square size={20} className="text-gray-300" />
                    )}
                  </button>

                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Order ID: {order._id.slice(-8)}
                  </span>
                  <button
                    onClick={() => handlePrintInvoice(order)}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase hover:text-indigo-800 transition"
                  >
                    <Printer size={12} /> Print Invoice
                  </button>
                </div>
                <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar size={14} />{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* 1. Customer Details */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-tighter">
                    Customer
                  </p>
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-gray-400" />
                    <span className="font-semibold text-gray-900 leading-tight">
                      {order.user?.name || "Guest"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 break-all">
                    {order.user?.email}
                  </p>
                </div>

                {/* 2. Order Items */}
                <div className="space-y-2 md:col-span-1">
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-tighter">
                    Items
                  </p>
                  <div className="space-y-3">
                    {order.orderItems?.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded border"
                          />
                          {item.customization?.designId && (
                            <div className="absolute -bottom-1 -right-1 bg-indigo-400 rounded-full border-2 border-white p-0.5">
                              <img
                                src={item.customization.designId?.image?.url}
                                className="w-4 h-4 object-contain"
                                alt="print-icon"
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">
                            Size:{" "}
                            <span className="text-black">{item.size}</span> |
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Address */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-tighter">
                    Shipping Address
                  </p>
                  <button
                    onClick={() =>
                      setExpandedAddress(
                        expandedAddress === order._id ? null : order._id,
                      )
                    }
                    className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-800 transition"
                  >
                    <MapPin size={16} />
                    {expandedAddress === order._id
                      ? "Hide Address"
                      : "View Address"}
                    {expandedAddress === order._id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                  {expandedAddress === order._id && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 animate-in fade-in duration-300">
                      <p className="font-bold text-gray-900 mb-1">
                        {order.shippingAddress.fullName}
                      </p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} -{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className="mt-2 font-bold text-black uppercase tracking-widest">
                        📞 {order.shippingAddress.phone}
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Financials */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-tighter">
                    Payment
                  </p>
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-gray-400" />
                    <span className="font-bold text-gray-900">
                      ₹{order.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                  <p
                    className={`text-[10px] font-black uppercase inline-block px-2 py-0.5 rounded ${order.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {order.isPaid ? "Paid" : "Pending"}
                  </p>
                </div>

                {/* 5. Status Update */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-tighter flex items-center gap-1">
                    Manage Status
                    {(order.status === "Delivered" ||
                      order.status === "Cancelled") && (
                      <span className="text-[9px] text-gray-400 font-normal">
                        {" "}
                        <Lock size={12} />
                      </span>
                    )}
                  </p>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    disabled={
                      order.status === "Delivered" ||
                      order.status === "Cancelled"
                    }
                    className={`w-full p-2 border-2 rounded-lg font-bold outline-none transition-colors text-sm ${
                      order.status === "Delivered"
                        ? "border-green-100 bg-green-50 text-green-700 opacity-70 cursor-not-allowed"
                        : order.status === "Cancelled"
                          ? "border-red-100 bg-red-50 text-red-700 opacity-70 cursor-not-allowed"
                          : "border-gray-100"
                    }`}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        setPage={fetchOrders} // Pass fetchOrders directly as the setter
      />
    </div>
  );
};

export default AdminOrders;
