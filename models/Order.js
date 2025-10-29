// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // 🔑 link order to user

    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true }, // ✅ cleaner queries
    phone: { type: String, required: true },
    address: { type: String, required: true },

    cart: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
      },
    ],

    total: { type: Number, required: true },

    paymentRef: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true // ✅ faster search
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], // ✅ added Cancelled
      default: "Pending",
    },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// const Order = mongoose.model("Order", orderSchema);

export default Order;
