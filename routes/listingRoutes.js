const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const listingController = require("../controllers/listingController");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// GET all listings
router.get("/", listingController.getListings);

// GET single listing
router.get("/:id", listingController.getListing);

// CREATE listing (Worker only)
router.post("/", protect, upload.single("image"), listingController.createListing);

// UPDATE listing
router.put("/:id", protect, upload.single("image"), listingController.updateListing);

// DELETE listing
router.delete("/:id", protect, listingController.deleteListing);

module.exports = router;

router.post("/test-upload", upload.single("image"), (req, res) => {
  console.log("FILE RECEIVED:", req.file);
  res.json({
    file: req.file,
    body: req.body
  });
});

