// routes/adminRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js"; // 👈 make sure you have an Admin model
import dotenv from "dotenv";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

import OrderModel from "../models/order.js";


dotenv.config();

const router = express.Router();

// ✅ Create Admin (for setup only — remove later in production)
router.get("/create-admin", async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@shop.com" });
    if (existingAdmin) {
      return res.json({ message: "⚠️ Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const newAdmin = new Admin({
      email: "admin@shop.com",
      password: hashedPassword,
    });
    await newAdmin.save();

    res.json({
      message: "✅ Admin created",
      email: "admin@shop.com",
      password: "admin123",
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Error creating admin", error: err.message });
  }
});

// ✅ Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "❌ Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "❌ Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" }, // 👈 store role
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ message: "❌ Error logging in", error: err.message });
  }
});

// ✅ Get all orders (Admin only)
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Update order status (Admin only)
router.put("/orders/:id/status", adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // e.g. { status: "Processing" }
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: "✅ Order status updated", order });

  } catch (err) {
    console.error("❌ Update order status error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});



export default router;



























// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import Admin from "../models/Admin.js";
// import dotenv, { config } from "dotenv" 

// dotenv.config()
// const router = express.Router();

// // ✅ Create Admin (temporary setup)
// router.get("/create-admin", async (req, res) => {
//   try {
//     const existingAdmin = await Admin.findOne({ email: "admin@shop.com" });
//     if (existingAdmin) return res.json({ message: "⚠️ Admin already exists" });

//     const hashedPassword = await bcrypt.hash("admin123", 10);
//     const newAdmin = new Admin({
//       email: "admin@shop.com",
//       password: hashedPassword,
//       isAdmin: true
//     });
//     await newAdmin.save();

//     res.json({
//       message: "✅ Admin created",
//       email: "admin@shop.com",
//       password: "admin123"
//     });
//   } catch (err) {
//     res.status(500).json({ message: "❌ Error creating admin", error: err.message });
//   }
// });

// // ✅ Admin Login
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(400).json({ message: "❌ Admin not found" });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(400).json({ message: "❌ Invalid credentials" });

//     const token = jwt.sign(
//       { id: admin._id, email: admin.email, isAdmin: admin.isAdmin },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ success: true, token });
//   } catch (err) {
//     res.status(500).json({ message: "❌ Error logging in", error: err.message });
//   }
// });

// export default router;
