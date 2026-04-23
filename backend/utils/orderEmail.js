export const generateOrderEmailHTML = (
  order,
  userName,
  subtotal,
  paymentStatus,
) => {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff; color: #1a1a1a;}
        .wrapper { width: 100%; table-layout: fixed; background-color: #ffffff; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; border: 1px solid #eee; border-radius: 20px;overflow: hidden;  }
        .header { background-color: #000000; padding: 30px; text-align: center; }
        .brand-name { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0; }
        .content { padding: 40px 20px; line-height: 1.6; }
        .headline-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .headline { font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0; }
        .headline { font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; }
        

        .status-badge { 
          display: inline-block; 
          background-color: #ff5900; 
          color: #ffffff; 
          padding: 4px 12px; 
          border-radius: 50px; 
          font-weight: 900; 
          text-transform: uppercase; 
          font-size: 11px; 
          letter-spacing: 1px;
          margin-top: 5px;
        }

        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { text-align: left; font-size: 12px; text-transform: uppercase; color: #888; border-bottom: 1px solid #eee; padding: 10px 5px; }
        .order-table td { padding: 15px 5px; border-bottom: 1px solid #eee; font-size: 14px; }
        
        .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
        .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-size: 18px; font-weight: 900; border-top: 2px solid #000; margin-top: 10px; }
        
        .status-box { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-top: 20px; font-size: 13px; font-weight: bold; text-align: center; border: 1px solid #eee; }
        .footer { text-align: center; padding: 30px; font-size: 11px; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main">
          <tr><td class="header"><h1 class="brand-name">Wearify</h1></td></tr>
          <tr>
            <td class="content">
              <div class="headline-container">
                <div>
                  <div class="headline">Order Confirmed.</div>
                  <div class="status-badge">${order.status}</div>
                </div>
              </div>
              <p>Hello ${userName}, your order is being processed. Here is your order summary:</p>
              
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Size</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.orderItems
                    .map(
                      (item) => `
                        <tr>
                          <td>
                            <div style="font-weight: bold;">${item.name} (x${item.quantity})</div>
                            
                            ${
                              item.customization && item.customization.designId
                                ? `<div style="font-size: 11px; color: #6366f1; font-style: italic; margin-top: 4px;">
                                    Print: ${item.customization.designId.name} (${item.customization.printSize})
                                    <br/>Location: ${item.customization.printPosition || "Front"} Side
                                  </div>`
                                : ""
                            }
                          </td>
                          <td style="text-align: center;">${item.size}</td>
                          <td style="text-align: right;">₹${item.price.toLocaleString()}</td>
                        </tr>
                      `,
                    )
                    .join("")}
                </tbody>
              </table>

              <div style="max-width: 300px; margin-left: auto;">
                    <div class="summary-row">
                      <span>Subtotal:</span> 
                      <span>₹${subtotal.toLocaleString()}</span>
                    </div>

                    ${
                      order.couponUsed && order.couponUsed.code
                        ? `
                      <div class="summary-row" style="color: #27ae60; font-weight: bold;">
                        <span>Discount (${order.couponUsed.code}):</span> 
                        <span>-₹${order.couponUsed.discount.toLocaleString()}</span>
                      </div>
                    `
                        : ""
                    }

                    <div class="summary-row">
                      <span>Shipping:</span> 
                      <span style="color: #27ae60; font-weight: bold;">FREE</span>
                    </div>

                    <div class="total-row">
                      <span>Total:</span> 
                      <span>₹${order.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

              <div class="status-box">
                PAYMENT STATUS: ${paymentStatus}
              </div>

              <p style="font-size: 12px; margin-top: 30px; color: #666;">
                <strong>Shipping to:</strong><br>
                ${order.shippingAddress.fullName}<br>
                ${order.shippingAddress.street}, ${order.shippingAddress.city}<br>
                ${order.shippingAddress.state}, ${order.shippingAddress.postalCode}<br>
                Phone: ${order.shippingAddress.phone}
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>&copy; ${currentYear} Wearify | India</p>
              <p>Keep it bold. Keep it real.</p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
};

export const generateCancelEmailHTML = (order, userName) => {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff; color: #1a1a1a; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #ffffff; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; border: 1px solid #eee; border-radius: 20px;overflow: hidden;  }
        .header { background-color: #000000; padding: 30px; text-align: center; }
        .brand-name { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0; }
        .content { padding: 40px 20px; line-height: 1.6; }
        .headline { font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; color: #d93025; }
        
        .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 4px; border: 1px solid #eee; margin: 20px 0; }
        .item-list { font-size: 14px; color: #666; }
        
        .footer { text-align: center; padding: 30px; font-size: 11px; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main">
          <tr><td class="header"><h1 class="brand-name">Wearify</h1></td></tr>
          <tr>
            <td class="content">
              <div class="headline">Order Cancelled.</div>
              <p>Hello ${userName},</p>
              <p>As requested, your order <strong>#${order._id.toString().slice(-8)}</strong> has been cancelled. If any payment was made online, it will be refunded to your original payment method within 5-7 business days.</p>
              
              <div class="order-info">
                <p style="margin: 0; font-weight: bold; font-size: 12px; color: #888; text-transform: uppercase;">Cancelled Items:</p>
                <ul class="item-list">
                  ${order.orderItems
                    .map(
                      (item) => `
                    <li style="margin-bottom: 10px;">
                      <strong>${item.name}</strong> - Size: ${item.size} (x${item.quantity})
                      ${
                        item.customization && item.customization.designId
                          ? `<div class="print-info">Print: ${item.customization.designId.name} (${item.customization.printSize}) - ${item.customization.printPosition || "Front"} Side</div>`
                          : ""
                      }
                    </li>
                  `,
                    )
                    .join("")}
                </ul>
                <p style="margin: 10px 0 0 0; font-weight: bold;">Total Refund Amount: ₹${order.totalPrice}</p>
              </div>

              <p>We're sorry to see this gear go! If this was a mistake, you can always head back to our store to place a new order.</p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>&copy; ${currentYear} Wearify | India</p>
              <p>Keep it bold. Keep it real.</p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
};

export const generateStatusUpdateEmailHTML = (order, userName, status) => {
  const currentYear = new Date().getFullYear();

  // Define dynamic background colors for the status badge
  const statusColors = {
    Shipped: "#28a745", // Green
    Delivered: "#28a745", // Green
    Processing: "#ff5900", // Orange
    Cancelled: "#d93025", // Red (Optional addition for safety)
    default: "#007bff", // Standard Blue for others
  };

  const badgeColor = statusColors[status] || statusColors.default;

  // Custom messages based on status
  const statusMessages = {
    Shipped:
      "Great news! Your package is on its way. You'll be rocking your new gear in no time.",
    Processing:
      "Your order is currently being prepared by our team. We're making sure everything is perfect.",
    Delivered:
      "Your Wearify package has arrived! We hope you love your new fit.",
    default: `The status of your order #${order._id.toString().slice(-8)} has been updated to: ${status}.`,
  };

  const message = statusMessages[status] || statusMessages.default;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff; color: #1a1a1a; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #ffffff; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; border: 1px solid #eee; border-radius: 20px;overflow: hidden; }
        .header { background-color: #000000; padding: 30px; text-align: center; }
        .brand-name { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0; }
        .content { padding: 40px 20px; line-height: 1.6; }
        .headline { font-size: 22px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; color: #000; }
        .status-badge { display: inline-block; background-color: ${badgeColor}; color: #ffffff; padding: 8px 16px; border-radius: 50px; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; margin-bottom: 20px; }
        .footer { text-align: center; padding: 30px; font-size: 11px; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main">
          <tr><td class="header"><h1 class="brand-name">Wearify</h1></td></tr>
          <tr>
            <td class="content">
              <div class="headline">Order Update.</div>
              <div class="status-badge">${status}</div>
              <p>Hello ${userName},</p>
              <p>${message}</p>
              <p>Order ID: <strong>#${order._id}</strong></p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
              <p style="font-size: 13px;">You can track your order status in your profile dashboard.</p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>&copy; ${currentYear} Wearify | India</p>
              <p>Keep it bold. Keep it real.</p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
};
