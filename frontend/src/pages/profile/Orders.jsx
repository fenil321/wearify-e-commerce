import React from "react";
import { useOrder } from "../../context/OrderContext";
import { Download } from "lucide-react";

const Orders = () => {
  const { orders, cancelOrder } = useOrder();

  if (!orders)
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500 animate-pulse">Loading your orders...</p>
      </div>
    );

  const handleDownloadReceipt = (order) => {
    const printWindow = window.open("", "_blank");

    const transactionDetails =
      order.paymentMethod === "ONLINE" || order.isPaid
        ? `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
        <h4 style="margin: 0 0 10px 0; text-transform: uppercase; font-size: 12px; color: #666;">Transaction Details</h4>
        <p style="margin: 4px 0;"><strong>Method:</strong> Online Payment</p>
        <p style="margin: 4px 0;"><strong>Transaction ID:</strong> ${order.paymentResult?.id || "N/A"}</p>
        <p style="margin: 4px 0;"><strong>Payment Status:</strong> <span style="color: green;">${order.paymentResult?.status || "COMPLETED"}</span></p>
        <p style="margin: 4px 0;"><strong>Paid On:</strong> ${order.paidAt ? new Date(order.paidAt).toLocaleString() : new Date(order.createdAt).toLocaleString()}</p>
      </div>
    `
        : `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
        <h4 style="margin: 0 0 10px 0; text-transform: uppercase; font-size: 12px; color: #666;">Transaction Details</h4>
        <p style="margin: 4px 0;"><strong>Method:</strong> Cash on Delivery (COD)</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> Payment Pending</p>
      </div>
    `;

    const discountBlock = order.couponUsed
      ? `<div style="display: flex; justify-content: space-between; color: #15803d; font-size: 14px; margin-top: 10px;">
        <span>Discount (${order.couponUsed.code}):</span>
        <span>- ₹${order.couponUsed.discount.toLocaleString()}</span>
     </div>`
      : "";
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order #${order._id.slice(-8)}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #f0f0f0; padding-bottom: 5px; }
            .total { font-weight: bold; font-size: 20px; border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0;">WEARIFY</h1>
            <p style="color: #888; font-size: 12px;">Order ID: ${order._id}</p>
          </div>
          ${transactionDetails}
          <h3>Items Purchased:</h3>
          ${order.orderItems
            .map(
              (item) => `
            <div class="item">
              <span>
                <strong>${item.name}</strong><br>
                <small style="color: #666;">Size: ${item.size} | Qty: ${item.quantity}</small>
                ${
                  item.customization && item.customization.designId
                    ? `<div style="font-size: 11px; color: #15803d; text-transform: uppercase; font-weight: 900; margin-top: 4px;">
                Print: ${item.customization.designId?.name || "Anime Print"} 
                (${item.customization.printSize})
                <br/>Location: ${item.customization.printPosition || "Front"} Side
              </div>`
                    : ""
                }
                </span>
              <span>₹${item.price.toLocaleString()}</span>
            </div>
          `,
            )
            .join("")}
          ${discountBlock} 
          <div class="total">
            <span>Final Amount Paid</span>
            <span>₹${order.totalPrice.toLocaleString()}</span>
          </div>
          <footer style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
            <p>Thank you for shopping with Wearify!</p>
          </footer>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-8">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
          <p className="text-gray-500 font-medium">
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-100 p-4 md:p-6 rounded-2xl shadow-sm bg-white"
            >
              {/* Card Header: ID and Amount */}
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Order ID:{" "}
                    <span className="text-gray-900">{order._id.slice(-8)}</span>
                  </p>
                  <p
                    className={`text-xs md:text-sm font-black uppercase ${
                      order.status === "Delivered"
                        ? "text-green-600"
                        : order.status === "Cancelled"
                          ? "text-red-500"
                          : "text-amber-500"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Total Amount
                  </p>
                  <p className="text-lg md:text-xl font-black text-gray-900">
                    ₹{order.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-6 border-t border-b border-gray-50 py-4 mb-4">
                {order.orderItems?.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-xl bg-gray-50 border border-gray-100"
                    />
                    <div className="flex-1 w-full">
                      <p className="font-black text-gray-900 uppercase tracking-tight text-base md:text-lg leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mt-1">
                        Size: <span className="text-black">{item.size}</span> |
                        Qty: {item.quantity}
                      </p>

                      {/* Customization Box (Responsive) */}
                      {item.customization &&
                        (item.customization.designId ||
                          item.customization.designName) && (
                          <div className="mt-2 flex items-center gap-2 bg-indigo-50 p-2 rounded-lg border border-indigo-100 w-fit">
                            <img
                              src={
                                item.customization.designId?.image?.url ||
                                item.customization?.designImage ||
                                "/placeholder-icon.png"
                              }
                              className="w-10 h-10 object-contain"
                              alt="Anime Print"
                              onError={(e) => {
                                e.target.src = "/placeholder-icon.png";
                              }}
                            />
                            <div>
                              <p className="text-[9px] font-black uppercase text-gray-600 leading-none">
                                {item.customization.designId?.name ||
                                  item.customization.designName ||
                                  "Custom Print"}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <p className="text-[8px] text-gray-500 font-bold uppercase">
                                  {item.customization.printSize} Print
                                </p>
                                <span className="text-[8px] text-gray-500 font-black uppercase">
                                  •{" "}
                                  {item.customization.printPosition || "Front"}{" "}
                                  side
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                      <p className="text-sm md:text-base font-black text-gray-900 mt-3">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions: Payment & Cancel */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Payment Status
                  </p>
                  <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-2">
                    <span
                      className={`text-[10px] md:text-[12px] font-black uppercase px-2 py-0.5 rounded ${
                        order.isPaid
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {order.isPaid ? "Paid Online" : "Cash on Delivery"}
                    </span>

                    {order.isPaid && (
                      <button
                        onClick={() => handleDownloadReceipt(order)}
                        className="flex items-center gap-1 text-[10px] md:text-[12px] font-black uppercase text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Receipt <Download size={14} className="md:size-4" />
                      </button>
                    )}
                  </div>
                </div>

                {order.status !== "Delivered" &&
                  order.status !== "Cancelled" && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="w-full sm:w-auto bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                    >
                      Cancel Order
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
