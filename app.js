// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// initialize express
const app = express();

// enable CORS for frontend
const allowedOrigins = [
  "http://localhost:3000",
  "https://skill-connect-frontend-blue.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// const earningsRoutes = require("./routes/earningsRoutes");
// app.use("/api/earnings", earningsRoutes);

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// connect DB
require("./config/db")();

// routes
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const aiRoutes = require("./routes/aiRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/bookings", bookingRoutes);

// basic health route
app.get("/", (req, res) => {
    res.json({ status: "SkillConnect Backend Running" });
});

module.exports = app;
