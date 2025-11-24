const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const reviewController = require("../controllers/reviewController");

// Add review
router.post("/", protect, reviewController.addReview);

// Get all reviews for a listing
router.get("/:listingId", reviewController.getReviews);

// Delete a review
router.delete("/:id", protect, reviewController.deleteReview);

module.exports = router;
