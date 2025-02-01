import asyncHandler from "../middleware/asyncHandler.js";
import URL from "../modal/urlModal.js";
import Visit from "../modal/visitModal.js";

// Debug middleware for URL routes
const debugRequest = (req, res, next) => {
  console.log("URL Request:", {
    method: req.method,
    path: req.path,
    headers: {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie,
    },
    user: req.user?._id,
  });
  next();
};

// @desc    Create a short URL
// @route   POST /api/url/shorten
// @access  Private
const createShortUrl = asyncHandler(async (req, res) => {
  const { originalUrl, expirationDate, remarks } = req.body;

  if (!originalUrl) {
    res.status(400);
    throw new Error("Original URL is required");
  }

  const url = await URL.create({
    user: req.user._id,
    originalUrl,
    expirationDate: expirationDate || null,
    remarks: remarks || "",
  });

  res.status(201).json({
    success: true,
    data: url,
  });
});

// @desc    Get all URLs for user
// @route   GET /api/url/all
// @access  Private
const getAllUrls = asyncHandler(async (req, res) => {
  const urls = await URL.find({ user: req.user._id }).sort({ createdAt: -1 });
  const visits = await Visit.find({
    url: { $in: urls.map((url) => url._id) },
  })
    .sort({ timestamp: -1 })
    .populate("url", "originalUrl shortUrl");

  const formattedVisits = visits.map((visit) => ({
    _id: visit._id,
    timestamp: visit.timestamp,
    originalUrl: visit.url.originalUrl,
    shortUrl: visit.url.shortUrl,
    ipAddress: visit.ip.replace(/^.*:/, ""),
    device: determineDevice(visit.device),
  }));

  res.json({
    success: true,
    data: {
      urls,
      visits: formattedVisits,
    },
  });
});

// Helper function to determine device type
const determineDevice = (userAgent) => {
  if (!userAgent) return "Unknown";

  const ua = userAgent.toLowerCase();

  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android")) return "Android Phone";

  if (ua.includes("macintosh") || ua.includes("mac os")) {
    return "Mac";
  }
  if (ua.includes("windows")) return "Windows";

  if (ua.includes("linux")) {
    if (ua.includes("android")) return "Android";
    return "Linux";
  }

  return "Other";
};

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

  // Get real IP by checking multiple headers in order of reliability
  let realIP =
    req.headers["x-real-ip"] || // Nginx
    req.headers["x-client-ip"] || // Standard client IP header
    req.headers["cf-connecting-ip"] || // Cloudflare
    req.headers["x-forwarded-for"]?.split(",")[0] || // Proxy forwarded IP
    req.socket.remoteAddress?.replace(/^.*:/, "") || // Socket IP (cleaned)
    req.ip?.replace(/^.*:/, "") || // Express IP (cleaned)
    "Unknown";

  // Remove any IPv6 prefix if present
  realIP = realIP.replace(/^::ffff:/, "");

  await Visit.create({
    url: url._id,
    device: req.headers["user-agent"] || "Unknown",
    ip: realIP,
  });

  url.clicks += 1;
  await url.save();

  res.json({
    success: true,
    data: {
      originalUrl: url.originalUrl,
    },
  });
});

export { createShortUrl, getAllUrls, deleteUrl, getUrlStats, recordVisit };
