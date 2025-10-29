// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ Profile picture (optional or default)
    profilePic: {
      type: String,
      default: "https://via.placeholder.com/150",
    },

    // ✅ Email verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String }, // <— Added this field
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
