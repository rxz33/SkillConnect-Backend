// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["customer", "worker"],
      required: true,
    },

    // Worker-specific fields
    skills: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
    },

    experience: {
      type: String,
      default: "",
    },

    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },

    location: {
      type: String,
      default: "",
    },

    image: {
      url: String,
      public_id: String,
    },

    rating: {
      type: Number,
      default: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
