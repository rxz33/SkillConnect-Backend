// controllers/listingController.js
const Listing = require("../models/Listing");

// =============================
// GET ALL LISTINGS
// =============================
exports.getListings = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;

    let filter = {};

    // Search by title / description / location
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    // Category filter
    if (category) filter.category = category;

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = {};
    if (sort === "priceLow") sortOption.price = 1;
    if (sort === "priceHigh") sortOption.price = -1;
    if (sort === "ratingHigh") sortOption.rating = -1;

    const listings = await Listing.find(filter)
      .populate("owner", "name email")
      .sort(sortOption);

    res.json({ ok: true, count: listings.length, listings });
  } catch (err) {
    console.log("GET LISTINGS ERROR:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

// =============================
// GET SINGLE LISTING
// =============================
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("owner", "name email")
      .populate("reviews");

    if (!listing) {
      return res.status(404).json({ ok: false, message: "Listing not found" });
    }

    res.json({ ok: true, listing });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

// =============================
// CREATE LISTING (workers only)
// =============================
exports.createListing = async (req, res) => {
  try {
    // only workers can create listings
    if (req.user.role !== "worker") {
      return res.status(403).json({ ok: false, message: "Only workers can create listings" });
    }

    const { title, description, category, price, location } = req.body;

    const listing = await Listing.create({
      title,
      description,
      category,
      price,
      location,
      owner: req.user._id,
      image: req.file ? { url: req.file.path, public_id: req.file.filename } : null
    });

    res.status(201).json({ ok: true, message: "Listing created", listing });
  } catch (err) {
    console.log("CREATE LISTING ERROR:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

// =============================
// UPDATE LISTING
// =============================
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ ok: false, message: "Listing not found" });
    }

    // only owner can edit
    if (String(listing.owner) !== String(req.user._id)) {
      return res.status(403).json({ ok: false, message: "Unauthorized" });
    }

    const { title, description, category, price, location } = req.body;

    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.category = category || listing.category;
    listing.price = price || listing.price;
    listing.location = location || listing.location;

    if (req.file) {
      listing.image = { url: req.file.path, public_id: req.file.filename };
    }

    await listing.save();

    res.json({ ok: true, message: "Listing updated", listing });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

// =============================
// DELETE LISTING
// =============================   
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ ok: false, message: "Listing not found" });
    }

    // only owner can delete
    if (String(listing.owner) !== String(req.user._id)) {
      return res.status(403).json({ ok: false, message: "Unauthorized" });
    }

    await listing.deleteOne();

    res.json({ ok: true, message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Server error" });
  }
};
