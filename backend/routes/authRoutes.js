import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import BlacklistedToken from "../models/blackListToken.model.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const jwt_key = process.env.JWT_SECRET;
const jwt_key_refresh = process.env.REFRESH_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
//Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //check is user already exist!
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with these email already exists!" });
    }

    //HAsh password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //console.log(salt);

    //create User
    const user = await User.insertOne({
      name,
      email,
      password: hashedPassword,
      role: "customer", //force becoz customer cant be a admin
    });

    const currentYear = new Date().getFullYear();
    await sendEmail({
      to: user.email,
      subject: "Welcome to Wearify",
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #ffffff; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1a1a1a;border: 1px solid #eee; border-radius: 20px;overflow: hidden;  }
        .header { background-color: #000000; padding: 30px; text-align: center; }
        .brand-name { color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .headline { font-size: 22px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; }
        
        /* Brand Points Section */
        .features { padding: 0; list-style: none; margin: 25px 0; }
        .feature-item { margin-bottom: 12px; display: flex; align-items: center; font-size: 15px; }
        .feature-icon { margin-right: 10px; color: #000000; font-weight: bold; }
        
        .cta-container { text-align: center; margin-top: 30px; }
        .cta-button { background-color: #000000; color: #ffffff; padding: 18px 35px; text-decoration: none; font-size: 14px; font-weight: bold; text-transform: uppercase; display: inline-block; border-radius: 2px; }
        .footer { text-align: center; padding: 30px; font-size: 11px; color: #888888; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main">
          <tr>
            <td class="header">
              <h1 class="brand-name">Wearify</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="headline">Hello ${user.name},</div>
              <p>Welcome to <strong>Wearify</strong>. We are thrilled to have you join our community of trendsetters and urban explorers.</p>
              
              <p>Our mission is to bring you the latest in high-end streetwear, blending comfort with unapologetic style.</p>
              
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>&copy; ${currentYear} Wearify | India</p>
              <p>Don't want to hear from us? <a href="#" style="color: #888888;">Unsubscribe here</a>.</p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `,
    });
    return res.status(201).json({
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

///Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "invalid credentials!" });
    }

    //compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "invalid credentials!" });
    }

    //check user is blocked or not!
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account is blocked. Please contact the administrator.",
      });
    }

    //Generate JWT
    const accessToken = jwt.sign({ id: user._id, role: user.role }, jwt_key, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ id: user._id }, jwt_key_refresh, {
      expiresIn: "7d",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd, // true in production (HTTPS)
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//for refresh token
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, jwt_key_refresh);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, jwt_key, {
      expiresIn: "15m",
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "invalid refresh token" });
  }
});

//logout
router.post("/logout", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  await BlacklistedToken.create({ token });
  res.json({ message: "Logged Out successfully!" });
});

//forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    //generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; //10 min

    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    console.log("Reset URL:", resetUrl);

    const currentYear = new Date().getFullYear();

    await sendEmail({
      to: user.email,
      subject: "Secure Access | Password Reset Request",
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff; }
        .main { margin: 0 auto; width: 100%; max-width: 600px; color: #1a1a1a; border: 1px solid #eeeeee; }
        .header { background-color: #000000; padding: 30px; text-align: center; }
        .brand-name { color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0; }
        .content { padding: 40px 30px; line-height: 1.6; text-align: center; }
        .headline { font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; }
        
        /* Reset Button */
        .cta-container { margin: 30px 0; }
        .cta-button { background-color: #000000; color: #ffffff; padding: 18px 35px; text-decoration: none; font-size: 14px; font-weight: bold; text-transform: uppercase; display: inline-block; border-radius: 2px; }
        
        .expiry-note { font-size: 13px; color: #ff3e11; font-weight: bold; margin-top: 20px; text-transform: uppercase; }
        .security-text { font-size: 12px; color: #888888; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px; }
        .footer { text-align: center; padding: 30px; font-size: 11px; color: #888888; background-color: #fafafa; }
      </style>
    </head>
    <body>
      <div class="main">
        <div class="header">
          <h1 class="brand-name">Wearify</h1>
        </div>
        <div class="content">
          <div class="headline">Password Reset</div>
          <p>We received a request to reset the password for your account associated with <strong>${user.email}</strong>.</p>
          
          <div class="cta-container">
            <a href="${resetUrl}" class="cta-button">Reset My Password</a>
          </div>

          <p class="expiry-note">Security Alert: This link will expire in 10 minutes.</p>
          
          <div class="security-text">
            If you did not request this change, please ignore this email or contact support if you have concerns about your account security.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} Wearify | India</p>
        </div>
      </div>
    </body>
    </html>
  `,
    });

    res.json({ message: "Reset link generated (check console for now)" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

//reset-password
router.put("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const currentYear = new Date().getFullYear();
    await sendEmail({
      to: user.email,
      subject: "Security Alert | Password Updated Successfully",
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff; }
        .main { margin: 0 auto; width: 100%; max-width: 600px; color: #1a1a1a; border: 1px solid #eeeeee; }
        .header { background-color: #000000; padding: 30px; text-align: center; }
        .brand-name { color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0; }
        .content { padding: 40px 30px; line-height: 1.6; text-align: center; }
        .headline { font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; }
        
        /* Success Icon or Status */
        .status-badge { color: #2ecc71; font-weight: bold; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; display: block; }
        
        .cta-container { margin: 30px 0; }
        .cta-button { background-color: #000000; color: #ffffff; padding: 18px 35px; text-decoration: none; font-size: 14px; font-weight: bold; text-transform: uppercase; display: inline-block; border-radius: 2px; }
        
        .security-text { font-size: 12px; color: #888888; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px; }
        .footer { text-align: center; padding: 30px; font-size: 11px; color: #888888; background-color: #fafafa; }
      </style>
    </head>
    <body>
      <div class="main">
        <div class="header">
          <h1 class="brand-name">Wearify</h1>
        </div>
        <div class="content">
          <span class="status-badge">Confirmed</span>
          <div class="headline">Password Updated</div>
          <p>Hello,</p>
          <p>This is a confirmation that the password for your account <strong>${user.email}</strong> has been successfully changed.</p>

          <div class="security-text">
            <strong>If you did not make this change,</strong> please contact our security team immediately or reset your password again to secure your account.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} Wearify | India</p>
        </div>
      </div>
    </body>
    </html>
  `,
    });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

//Get current logged in user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // req.user is populated by your authMiddleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
export default router;
