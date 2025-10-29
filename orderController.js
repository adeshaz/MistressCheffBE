import Order from "../models/Order.js";

// ✅ Create new order
export const createOrder = async (req, res) => {
  try {
    const { name, email, phone, address, cart, total, paymentRef } = req.body;

    const newOrder = new Order({
      name,
      email,
      phone,
      address,
      cart,
      total,
      paymentRef,
    });

    await newOrder.save();

    res.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("❌ Error saving order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all orders (for admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update order status
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// ✅ Get all orders for a specific user (by email or logged-in userId if you add auth later)
export const getUserOrders = async (req, res) => {
  try {
    const { email } = req.query; // frontend will send ?email=...
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const orders = await Order.find({ email }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
