const express = require("express");
const router = express.Router();

const { register, login, logout, getProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

// PUBLIC
router.post("/register", register);
router.post("/login", login);

// PRIVATE
router.get("/profile", protect, getProfile);
router.post("/logout", logout);

module.exports = router;
