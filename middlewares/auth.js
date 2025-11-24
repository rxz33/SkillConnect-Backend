// middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // load user
    req.user = await User.findById(decoded.id).select("-password");

    // attach role from JWT
    req.user.role = decoded.role;

    next();
  } catch (err) {
    console.log("Auth Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
