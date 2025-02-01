import asyncHandler from "../middleware/asyncHandler.js";
import URL from "../modal/urlModal.js";
import Visit from "../modal/visitModal.js";

// @desc    Create a short URL
// @route   POST /api/url/shorten
// @access  Private
const createShortUrl = asyncHandler(async (req, res) => {
  const { originalUrl, expirationDate, remarks } = req.body;

  if (!originalUrl) {
    res.status(400);
    throw new Error("Original URL is required");
  }

  // Generate a unique short URL code
  const shortUrlCode = Math.random().toString(36).substring(2, 8);

  // Create the full short URL
  const fullShortUrl = `${
    process.env.HOSTNAME || "https://url-shortener-mern.onrender.com"
  }/${shortUrlCode}`;

  const url = await URL.create({
    user: req.user._id,
    originalUrl,
    shortUrl: shortUrlCode, // Store just the code
    fullShortUrl, // Store the full URL
    expirationDate: expirationDate || null,
    remarks: remarks || "",
  });

  res.status(201).json({
    success: true,
    data: {
      ...url.toObject(),
      shortUrl: fullShortUrl, // Return the full URL
    },
  });
});

// @desc    Get all URLs for user
// @route   GET /api/url/all
// @access  Private
const getAllUrls = asyncHandler(async (req, res) => {
  console.log("Getting URLs for user:", req.user._id);

  const urls = await URL.find({ user: req.user._id }).sort({ createdAt: -1 });
  const visits = await Visit.find({
    url: { $in: urls.map((url) => url._id) },
  }).sort({ timestamp: -1 });

  res.json({
    success: true,
    data: {
      urls,
      visits,
    },
  });
});

// @desc    Delete URL
// @route   DELETE /api/url/:id
// @access  Private
const deleteUrl = asyncHandler(async (req, res) => {
  const url = await URL.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!url) {
    res.status(404);
    throw new Error("URL not found");
  }

  // Delete associated visits first
  await Visit.deleteMany({ url: url._id });
  // Then delete the URL
  await url.deleteOne();

  res.json({
    success: true,
    message: "URL and associated visits deleted successfully",
  });
});

// @desc    Get URL stats
// @route   GET /api/url/stats/:id
// @access  Private
const getUrlStats = asyncHandler(async (req, res) => {
  const url = await URL.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!url) {
    res.status(404);
    throw new Error("URL not found");
  }

  const visits = await Visit.find({ url: url._id }).sort({ timestamp: -1 });

  res.json({
    success: true,
    data: {
      url,
      visits,
      totalClicks: visits.length,
    },
  });
});

// @desc    Record a visit to a URL
// @route   POST /api/url/visit/:shortUrl
// @access  Public
const recordVisit = asyncHandler(async (req, res) => {
  const url = await URL.findOne({ shortUrl: req.params.shortUrl });

  if (!url) {
    res.status(404);
    throw new Error("URL not found");
  }

  // Create visit record with more details
  await Visit.create({
    url: url._id,
    device: req.headers["user-agent"] || "Unknown",
    ip: req.ip || req.headers["x-forwarded-for"] || "Unknown",
    browser: req.headers["user-agent"] || "Unknown",
  });

  // Increment click count
  url.clicks += 1;
  await url.save();

  // Return the original URL for redirection
  res.json({
    success: true,
    data: {
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
    },
  });
});

export { createShortUrl, getAllUrls, deleteUrl, getUrlStats, recordVisit };
