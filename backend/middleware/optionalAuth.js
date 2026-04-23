import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/blackListToken.model.js";

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If there is no header or no token, just move to the next function
    // req.user will remain undefined, which is what we want for Guests
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    // Check blacklisted tokens
    const blackListed = await BlacklistedToken.findOne({ token });
    if (blackListed) {
      return next(); // Just continue as a guest if token is blacklisted
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Populate user for logged-in accounts
    next();
  } catch (error) {
    // If token is invalid (expired/fake), we still treat them as a Guest
    // instead of crashing or blocking the request
    next();
  }
};

export default optionalAuth;
