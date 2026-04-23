import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/blackListToken.model.js";
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token, unauthorized!" });
    }

    const blackListed = await BlacklistedToken.findOne({ token });
    if (blackListed) {
      return res.status(401).json({ message: "Token expired!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    //console.log(req.user);
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
