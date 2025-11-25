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
  "https://skill-connect-frontend-blue.vercel.app",
  "https://skill-connect-frontend-git-main-rashi-guptas-projects-70e2be20.vercel.app",
  "https://skill-connect-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
}));


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});


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
