// controllers/bookingController.js
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

// =============================
// CREATE BOOKING (Customer)
// =============================
exports.createBooking = async (req, res) => {
  try {
    const { listingId, scheduledDate, address } = req.body;

    // Only customers can book
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can book services" });
    }

    const listing = await Listing.findById(listingId).populate("owner");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      worker: listing.owner._id,
      listing: listing._id,
      scheduledDate,
      address,
      price: listing.price,
    });

    res.status(201).json({
      message: "Booking created",
      booking,
    });
  } catch (err) {
    console.log("CREATE BOOKING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET CUSTOMER BOOKINGS
// =============================
exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("listing")
      .populate("worker", "name email");

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET WORKER BOOKINGS
// =============================
exports.getWorkerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ worker: req.user._id })
      .populate("listing")
      .populate("customer", "name email");

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// UPDATE BOOKING STATUS
// Worker accepts / completes
// =============================
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; // pending → accepted → completed / cancelled

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only worker can update
    if (String(booking.worker) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Status updated", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// CANCEL BOOKING (Customer)
// =============================
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only customer can cancel their own booking
    if (String(booking.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
