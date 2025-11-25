// controllers/authController.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

// ===========================
// REGISTER USER
// ===========================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // 3. Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // 5. Generate JWT
    const token = generateToken(user._id);

    // 6. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,     // set TRUE when using HTTPS
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.log("Register Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ===========================
// LOGIN USER
// ===========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Provide email & password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.log("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// LOGOUT USER
// ===========================
exports.logout = (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  return res.json({ message: "Logged out successfully" });
};

// ===========================
// GET PROFILE
// ===========================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json({ user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
