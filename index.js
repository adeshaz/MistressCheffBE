import express from "express";
import dotenv from "dotenv";
dotenv.config(); // ✅ Must come before using process.env
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";



const app = express(); // ✅ Initialize first

// ✅ CORS setup
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174 ","https://misstresschef-dl3i.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json());
app.use(bodyParser.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ TEMP: Check if .env variables are loading correctly
app.get("/check-env", (req, res) => {
  res.json({
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌",
  });
});

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5900;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));










// MongoDB connect
// mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ MongoDB connected")).catch(err => console.error(err));








// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const axios = require("axios");
// require("dotenv").config();
// const app = express();
// app.use(cors());
// app.use(bodyParser.json());
// const nodemailer = require("nodemailer");

// // ✅ Setup email transporter (use Gmail or other SMTP)
// const transporter = nodemailer.createTransport({
//   service: "gmail", // or "hotmail", "yahoo"
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });


// // ✅ Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("✅ MongoDB Connected"))
// .catch((err) => console.error("❌ MongoDB Error:", err));

// // 🔹 Order Schema
// const orderSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
//   address: String,
//   cart: [
//     {
//       productId: String,
//       name: String,
//       price: Number,
//       qty: Number,
//     },
//   ],
//   total: Number,
//   paymentRef: String,
//   status: { type: String, default: "Pending" }, // "Pending" → "Shipped" → "Delivered"
//   createdAt: { type: Date, default: Date.now },
// });
// const Order = mongoose.model("Order", orderSchema);

// // 🔹 Admin Schema
// const adminSchema = new mongoose.Schema({
//   email: String,
//   password: String, // hashed
// });
// const Admin = mongoose.model("Admin", adminSchema);


// // ✅ Get single order by ID
// app.get("/api/orders/:id", async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// // ✅ Middleware to protect routes
// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) return res.status(403).json({ message: "No token provided" });

//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ message: "Unauthorized" });
//     req.admin = decoded;
//     next();
//   });
// };

// // ✅ Protected routes
// app.get("/api/orders", authMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.put("/api/orders/:id/status", authMiddleware, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // ✅ Send Email Notification to Customer
//     // const mailOptions = {
//     //   from: process.env.EMAIL_USER,
//     //   to: order.email,
//     //   subject: `Your Order Status has been Updated`,
//     //   html: `
//     //     <h3>Hi ${order.name},</h3>
//     //     <p>Your order with reference <b>${order.paymentRef}</b> has been updated.</p>
//     //     <p><b>New Status:</b> ${status}</p>
//     //     <p>Thank you for shopping with MisstressChef! 💚</p>
//     //   `,
//     // };


// const mailOptions = {
//   from: `"MisstressChef Skincare" <${process.env.EMAIL_USER}>`,
//   to: order.email,
//   subject: `Your Order Status Update - MisstressChef`,
//   html: `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background: #f9f9f9; color: #333;">
      
//       <!-- Header -->
//       <div style="text-align: center; margin-bottom: 20px;">
//         <img src="https://yourdomain.com/logo.png" alt="MisstressChef Logo" style="width: 120px;"/>
//         <h2 style="color: #0f5132;">MisstressChef Skincare</h2>
//       </div>

//       <!-- Body -->
//       <p>Hi <b>${order.name}</b>,</p>
//       <p>We’re happy to update you about your order <b>${order.paymentRef}</b>.</p>
//       <p><b>Current Status:</b> <span style="color:#0f5132; font-weight:bold;">${status}</span></p>

//       <!-- Track Button -->
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="http://localhost:5173/track/${order._id}" 
//            style="padding: 12px 20px; background: #0f5132; color: white; text-decoration: none; border-radius: 6px; font-size: 16px;">
//            Track My Order
//         </a>
//       </div>

//       <p>Thank you for shopping with <b>MisstressChef Skincare</b>. We appreciate your trust in us 💚</p>

//       <!-- Footer -->
//       <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
//       <p style="font-size: 12px; text-align: center; color: #777;">
//         © ${new Date().getFullYear()} MisstressChef Skincare. All rights reserved.
//       </p>
//     </div>
//   `,
// };




//     transporter.sendMail(mailOptions, (err, info) => {
//       if (err) {
//         console.error("❌ Email error:", err);
//       } else {
//         console.log("📧 Email sent:", info.response);
//       }
//     });

//     res.json({ success: true, order });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });


// // app.put("/api/orders/:id/status", authMiddleware, async (req, res) => {
// //   try {
// //     const { status } = req.body;
// //     const order = await Order.findByIdAndUpdate(
// //       req.params.id,
// //       { status },
// //       { new: true }
// //     );
// //     res.json({ success: true, order });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // ✅ Public Route: Track Order by Email + Payment Ref
// app.post("/api/track-order", async (req, res) => {
//   try {
//     const { email, paymentRef } = req.body;
//     if (!email || !paymentRef) {
//       return res.status(400).json({ success: false, message: "Email and Payment Reference are required" });
//     }

//     const order = await Order.findOne({ email, paymentRef });

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     res.json({
//       success: true,
//       order: {
//         id: order._id,
//         email: order.email,
//         total: order.total,
//         status: order.status,
//         createdAt: order.createdAt,
//         items: order.cart,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });


// // console.log("Paystack Secret:", process.env.PAYSTACK_SECRET_KEY);

// // // ✅ Save Order Only After Paystack Verification
// // app.post("/api/orders", async (req, res) => {
// //   try {
// //     const { name, email, phone, address, cart, total, paymentRef } = req.body;

// // console.log("🔍 Verifying ref:", paymentRef);
// //     console.log("🔑 Using Paystack key:", process.env.PAYSTACK_SECRET_KEY);
// //     // Verify payment with Paystack
// //     const verifyResponse = await axios.get(
// //       `https://api.paystack.co/transaction/verify/${paymentRef}`,
// //       {
// //         headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
// //       }
// //     );

// //     if (
// //       verifyResponse.data.status &&
// //       verifyResponse.data.data.status === "success"
// //     ) {
// //       // ✅ Payment verified → save order
// //       const newOrder = new Order({
// //         name,
// //         email,
// //         phone,
// //         address,
// //         cart,
// //         total,
// //         paymentRef,
// //         status: "Pending",
// //       });

// //       await newOrder.save();
// //       return res.json({ success: true, message: "✅ Order saved successfully!" });
// //     } else {
// //       return res
// //         .status(400)
// //         .json({ success: false, message: "❌ Payment not verified" });
// //     }
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });



// // ✅ Save Order Only After Paystack Verification
// app.post("/api/orders", async (req, res) => {
//   try {
//     const { name, email, phone, address, cart, total, paymentRef } = req.body;

//     console.log("🔍 Payment Ref received:", paymentRef);
//     console.log("🔑 Paystack Secret Key (last 6 chars):", process.env.PAYSTACK_SECRET_KEY?.slice(-6));

//     if (!paymentRef) {
//       return res.status(400).json({ success: false, message: "❌ Payment reference is required" });
//     }

//     // Verify payment with Paystack
//     const verifyResponse = await axios.get(
//       `https://api.paystack.co/transaction/verify/${paymentRef}`,
//       {
//         headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
//       }
//     );

//     console.log("✅ Paystack Response:", verifyResponse.data);

//     if (
//       verifyResponse.data.status &&
//       verifyResponse.data.data.status === "success"
//     ) {
//       // ✅ Payment verified → save order
//       const newOrder = new Order({
//         name,
//         email,
//         phone,
//         address,
//         cart,
//         total,
//         paymentRef,
//         status: "Pending",
//       });

//       await newOrder.save();
//       return res.json({ success: true, message: "✅ Order saved successfully!" });
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, message: "❌ Payment not verified by Paystack" });
//     }
//   } catch (err) {
//     console.error("❌ Error verifying Paystack payment:", err.response?.data || err.message);

//     if (err.response?.status === 401) {
//       return res.status(401).json({
//         success: false,
//         message: "❌ Unauthorized: Check your Paystack SECRET KEY",
//         details: err.response?.data,
//       });
//     }

//     res.status(500).json({ success: false, message: err.message });
//   }
// });







// // ✅ Create Admin (only for setup, remove later in production!)
// app.get("/api/create-admin", async (req, res) => {
//   try {
//     const existingAdmin = await Admin.findOne({ email: "admin@shop.com" });
//     if (existingAdmin) {
//       return res.json({ message: "⚠️ Admin already exists" });
//     }

//     const hashedPassword = await bcrypt.hash("admin123", 10);
//     const newAdmin = new Admin({
//       email: "admin@shop.com",
//       password: hashedPassword,
//     });

//     await newAdmin.save();
//     res.json({
//       message: "✅ Admin created",
//       email: "admin@shop.com",
//       password: "admin123",
//     });
//   } catch (err) {
//     res.status(500).json({ message: "❌ Error creating admin", error: err.message });
//   }
// });
// // ✅ Admin Login
// app.post("/api/admin/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(400).json({ message: "❌ Admin not found" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "❌ Invalid credentials" });
//     }

//     const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.json({ success: true, token });
//   } catch (err) {
//     res.status(500).json({ message: "❌ Error logging in", error: err.message });
//   }
// });



// // ✅ Start Server
// const port = process.env.PORT || 5900;
// app.listen(port, () => {
//   console.log(`🚀 Server running on port ${port}`);
// });







