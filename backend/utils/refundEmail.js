export const getRefundEmail = (order, refundId) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
      <div style="background-color: #000; color: #fff; padding: 40px; text-align: center;">
        <h1 style="margin: 0; letter-spacing: 4px; text-transform: uppercase;">Wearify</h1>
        <p style="font-size: 12px; opacity: 0.7; text-transform: uppercase; margin-top: 10px;">Refund Confirmation</p>
      </div>

      <div style="padding: 40px;">
        <h2 style="font-size: 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px;">Your refund is processed!</h2>
        <p>Hi <strong>${order.user.name}</strong>,</p>
        <p>Good news! We've successfully processed the refund for your order. The amount will be credited back to your original payment method shortly.</p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 30px 0;">
          <p style="margin: 5px 0; font-size: 13px;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Refund ID:</strong> ${refundId}</p>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Amount Refunded:</strong> ₹${order.totalPrice.toLocaleString()}</p>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: #15803d; font-weight: bold;">SUCCESS</span></p>
        </div>

        <p style="font-size: 13px; color: #666; line-height: 1.6;">
          Please note that depending on your bank, it may take <strong>5-7 business days</strong> for the funds to reflect in your account.
        </p>

        <div style="margin-top: 40px; border-top: 1px solid #eee; pt-20px; text-align: center;">
          <p style="font-size: 11px; color: #999; text-transform: uppercase; margin-top: 20px;">Thank you for your patience!</p>
          <p style="font-size: 11px; font-weight: bold;">WEARIFY | INDIA</p>
        </div>
      </div>
    </div>
  `;
};
