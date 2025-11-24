// controllers/reviewController.js
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

// =============================
// ADD REVIEW (only after completed booking)
// =============================
exports.addReview = async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;

    // 1. Check if this customer booked AND completed the service
    const booking = await Booking.findOne({
      listing: listingId,
      customer: req.user._id,
      status: "completed"
    });

    if (!booking) {
      return res.status(403).json({
        message: "You can review only after completing a booking"
      });
    }

    // 2. Create review
    const review = await Review.create({
      listing: listingId,
      user: req.user._id,
      rating,
      comment
    });

    // 3. Recalculate average rating for listing
    const allReviews = await Review.find({ listing: listingId });
    const avgRating =
      allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    const listing = await Listing.findById(listingId);
    listing.rating = avgRating;
    listing.reviewCount = allReviews.length;
    await listing.save();

    res.status(201).json({
      message: "Review added",
      review,
      newRating: listing.rating,
    });
  } catch (err) {
    console.log("ADD REVIEW ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET REVIEWS FOR A LISTING
// =============================
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate("user", "name email");

    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// DELETE REVIEW (only by author)
// =============================
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only review author can delete
    if (String(review.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const listingId = review.listing;

    await review.deleteOne();

    // Update listing rating
    const remaining = await Review.find({ listing: listingId });
    const avg =
      remaining.length > 0
        ? remaining.reduce((acc, r) => acc + r.rating, 0) / remaining.length
        : 0;

    await Listing.findByIdAndUpdate(listingId, {
      rating: avg,
      reviewCount: remaining.length,
    });

    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
