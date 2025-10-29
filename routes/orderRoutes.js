// routes/orderRoutes.js
import express from "express";
import OrderModel from "../models/order.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------
   Protected routes
----------------------- */

// 👉 Create new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const newOrder = new Order({
      user: req.user._id,
      ...req.body,
    });
    await newOrder.save();
    res.json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 👉 Get logged-in user’s orders
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const orders = await OrderModel.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 👉 Get all orders (admin)
router.get("/", async (req, res) => {
  try {
    const orders = await OrderModel.find().populate("user", "firstName lastName email");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ----------------------
   Public routes (Track)
----------------------- */

// 👉 Track order by paymentRef
router.get("/track/:paymentRef", async (req, res) => {
  try {
    const order = await OrderModel.findOne({ paymentRef: req.params.paymentRef });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 👉 Track orders by email (optionally filter by paymentRef)
router.get("/user-orders", async (req, res) => {
  try {
    const { email, paymentRef } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    let filter = { email };
    if (paymentRef) filter.paymentRef = paymentRef; // ✅ support both email + paymentRef

    const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
    if (!orders.length) return res.status(404).json({ success: false, message: "No orders found" });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;



// // routes/orderRoutes.js
// import express from "express";
// import Order from "../models/Order.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import User from "../models/user.js"; // ✅ make sure you have a User model

// const router = express.Router();

// // 👉 Create new order (protected)
// router.post("/", authMiddleware, async (req, res) => {
//   try {
//     // ✅ Find logged-in user
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // ✅ Create order, always use logged-in user’s email    
//     const newOrder = new Order({
//       user: req.user._id,
//       name: req.body.name,
//       email: req.body.email || user.email, // ✅ take email from frontend, fallback to user email
//       phone: req.body.phone,
//       address: req.body.address,
//       cart: req.body.cart,
//       total: req.body.total,
//       paymentRef: req.body.paymentRef,
//     });

//     await newOrder.save();

//     res.json({ success: true, order: newOrder });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // 👉 Track orders by email OR email + paymentRef
// router.get("/user-orders", async (req, res) => {
//   try {
//     const { email, paymentRef } = req.query;
//     if (!email) return res.status(400).json({ success: false, message: "Email required" });

//     const filter = { email };
//     if (paymentRef) filter.paymentRef = paymentRef; // ✅ filter by both if provided

//     const orders = await Order.find(filter).sort({ createdAt: -1 });
//     if (!orders.length) return res.status(404).json({ success: false, message: "No orders found" });

//     res.json({ success: true, orders });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });


// export default router;
