import express from "express";
import sendEmail from "../utils/sendEmail.js";
const router = express.Router();

router.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Use your existing utility
    await sendEmail({
      to: process.env.EMAIL_USER, // Sent to your business email
      subject: `New Support Inquiry from ${name}`,
      // Add 'replyTo' so you can reply directly to the customer
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; color: #333;">
          <h2 style="border-bottom: 2px solid #000; padding-bottom: 10px;">New Contact Form Message</h2>
          <p><strong>Customer Name:</strong> ${name}</p>
          <p><strong>Customer Email:</strong> ${email}</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 10px; color: #888; margin-top: 30px;">This email was sent from the Wearify Contact Us form.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

export default router;
