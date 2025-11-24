const Booking = require("../models/Booking");

exports.getEarnings = async (req, res) => {
  try {
    const workerId = req.user.id;

    const bookings = await Booking.find({ worker: workerId });

    const completed = bookings.filter((b) => b.status === "completed");
    const pending = bookings.filter((b) => b.status === "pending");
    const accepted = bookings.filter((b) => b.status === "accepted");

    const totalEarnings = completed.reduce((sum, b) => sum + b.price, 0);

    return res.json({
      ok: true,
      totalEarnings,
      completedCount: completed.length,
      pendingCount: pending.length,
      acceptedCount: accepted.length,
      recentBookings: bookings.slice(-5),
    });
  } catch (err) {
    console.log("Earnings error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};
