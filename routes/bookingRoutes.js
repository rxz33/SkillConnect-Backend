const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const bookingController = require("../controllers/bookingController");

// Create booking (customer)
router.post("/", protect, bookingController.createBooking);

// Get customer bookings
router.get("/customer", protect, bookingController.getCustomerBookings);

// Get worker bookings
router.get("/worker", protect, bookingController.getWorkerBookings);

// Update booking status (worker)
router.put("/:id/status", protect, bookingController.updateBookingStatus);

// Cancel booking (customer)
router.put("/:id/cancel", protect, bookingController.cancelBooking);

module.exports = router;
