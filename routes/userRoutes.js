// routes/userRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import transporter from "../config/email.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";

const router = express.Router();


// ===============================
// ✅ CLOUDINARY SETUP
// ===============================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile-pics",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});
const upload = multer({ storage });


// ===============================
// ✅ PASSWORD STRENGTH VALIDATOR
// ===============================
function isStrongPassword(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=])[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/;
  return regex.test(password);
}


// ===============================
// ✅ USER SIGNUP (with email verification)
// ===============================
router.post("/signup", upload.single("profilePic"), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email already registered" });

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include uppercase, lowercase, number, and symbol.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePic: req.file ? req.file.path : "https://via.placeholder.com/150",
    });

    // ✅ Generate verification token (valid for 7 days)
    const verifyToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Send verification email using utility function
    await sendVerificationEmail(newUser.email, verifyToken);

    res.status(201).json({
      success: true,
      message: "Signup successful! Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
});


// ===============================
// ✅ VERIFY EMAIL
// ===============================
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid verification link" });
    }

    if (user.isVerified) {
      return res.json({ success: true, message: "Already verified" });
    }

    user.isVerified = true;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
});

// ===============================
// ✅ RESEND VERIFICATION EMAIL
// ===============================
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This account is already verified.",
      });
    }

    // ✅ Generate a new verification token (valid for 15 minutes)
    const verifyToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // ✅ Send verification email again
    await sendVerificationEmail(user.email, verifyToken);

    res.json({
      success: true,
      message: "A new verification link has been sent to your email.",
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: err.message });
  }
});



// ===============================
// ✅ LOGIN (Only verified users)
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "User not found" });

    if (!user.isVerified)
      return res.status(403).json({ success: false, message: "Please verify your email first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "20m" } // ⏳ Token expires after 20 minutes
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ===============================
// ✅ GET USER PROFILE
// ===============================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ===============================
// ✅ UPDATE PROFILE PICTURE
// ===============================
router.put("/update-profile-pic", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.path },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile picture updated successfully!",
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ===============================
// ✅ EXPORT ROUTER
// ===============================
export default router;


















// // routes/userRoutes.js
// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";
// import transporter from "../config/email.js";
// import User from "../models/User.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";


// const router = express.Router();

// // ✅ Cloudinary setup
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "profile-pics",
//     allowed_formats: ["jpg", "jpeg", "png"],
//     transformation: [{ width: 500, height: 500, crop: "limit" }],
//   },
// });
// const upload = multer({ storage });

// // ✅ Password strength validator
// function isStrongPassword(password) {
//   const regex =
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=])[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/;
//   return regex.test(password);
// }

// // ✅ USER SIGNUP with verification email
// router.post("/signup", upload.single("profilePic"), async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;

//     if (!firstName || !lastName || !email || !password) {
//       return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser)
//       return res.status(400).json({ success: false, message: "Email already registered" });

//     if (!isStrongPassword(password)) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must include uppercase, lowercase, number, and symbol.",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       profilePic: req.file ? req.file.path : "https://via.placeholder.com/150",
//     });

//     // ✅ Generate verification token (valid for 15 mins)
// // ✅ Generate verification token
// const verifyToken = jwt.sign(
//   { id: newUser._id },
//   process.env.JWT_SECRET,
//   { expiresIn: "15m" }
// );

// // ✅ Send verification email using the utility function
// await sendVerificationEmail(newUser.email, verifyToken);

//     res.status(201).json({
//       success: true,
//       message: "Signup successful! Please check your email to verify your account.",
//     });
//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ success: false, message: "Internal server error", error: err.message });
//   }
// });

// // ✅ VERIFY EMAIL
// router.get("/verify/:token", async (req, res) => {
//   try {
//     const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     if (user.verified) return res.json({ success: true, message: "Already verified" });

//     user.verified = true;
//     await user.save();

//     res.json({ success: true, message: "Email verified successfully! You can now log in." });
//   } catch (err) {
//     res.status(400).json({ success: false, message: "Invalid or expired verification link" });
//   }
// });

// // ✅ LOGIN (only verified users)
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ success: false, message: "All fields required" });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(400).json({ success: false, message: "User not found" });

//     if (!user.verified)
//       return res.status(403).json({ success: false, message: "Please verify your email first." });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ success: false, message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "20m" } // ⏳ Token expires after 20 minutes
//     );

//     res.json({
//       success: true,
//       message: "Login successful!",
//       token,
//       user: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         profilePic: user.profilePic,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ✅ GET PROFILE
// router.get("/profile", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     res.json({ success: true, user });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// export default router;



// // after creating newUser and saving it
// await newUser.save();

// // generate verification token
// const verifyToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

// // send verification email using the utility function
// await sendVerificationEmail(newUser.email, verifyToken);





// router.put("/update-profile-pic", authMiddleware, upload.single("profilePic"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { profilePic: req.file.path },
//       { new: true }
//     ).select("-password");

//     res.json({
//       success: true,
//       message: "Profile picture updated successfully!",
//       user,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });




