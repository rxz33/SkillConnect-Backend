const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const { getEarnings } = require("../controllers/earningsController");

router.get("/", protect, getEarnings);

module.exports = router;
