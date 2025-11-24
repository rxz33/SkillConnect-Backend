const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const { recommendWorkers, workerAdvice } = require("../controllers/aiController");

// Recommend best workers (customer)
router.post("/recommend", protect, recommendWorkers);

// Provide improvement tips (worker)
router.post("/advice", protect, workerAdvice);

module.exports = router;
