import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const adminAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ make sure this token belongs to an Admin
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(403).json({ success: false, message: "Forbidden: Not an admin" });
    }

    req.admin = admin; // 👈 attach admin to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuthMiddleware;
