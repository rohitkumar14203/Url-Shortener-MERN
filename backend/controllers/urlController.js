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
  console.log("Getting URLs for user:", req.user._id);

  const urls = await URL.find({ user: req.user._id }).sort({ createdAt: -1 });
  const visits = await Visit.find({
    url: { $in: urls.map((url) => url._id) },
  })
    .sort({ timestamp: -1 })
    .populate("url", "originalUrl shortUrl");

  // Format visit data with URL details and proper IP
  const formattedVisits = visits.map((visit) => ({
    _id: visit._id,
    timestamp: visit.timestamp,
    originalUrl: visit.url.originalUrl,
    shortUrl: visit.url.shortUrl,
    ipAddress: visit.ip || "Unknown",
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
  if (ua.includes("android")) {
    return "Android";
  } else if (
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ios")
  ) {
    return "iOS";
  } else if (ua.includes("macintosh") || ua.includes("mac os")) {
    return "Mac";
  } else if (ua.includes("windows")) {
    return "Windows";
  } else if (ua.includes("linux")) {
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

// Helper function to get client IP
const getClientIP = (req) => {
  // Try to get IP from various headers
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIP = req.headers["x-real-ip"];
  const cfConnectingIP = req.headers["cf-connecting-ip"];
  const trueClientIP = req.headers["true-client-ip"];

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    const ips = forwardedFor.split(",");
    return ips[0].trim();
  }

  if (trueClientIP) return trueClientIP;
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;

  // Fallback to remote address
  return req.connection.remoteAddress?.replace(/^.*:/, "") || "Unknown";
};

// @desc    Record a visit to a URL
// @route   POST /api/url/visit/:shortUrl
// @access  Public
const recordVisit = asyncHandler(async (req, res) => {
  const url = await URL.findOne({ shortUrl: req.params.shortUrl });

  if (!url) {
    res.status(404);
    throw new Error("URL not found");
  }

  // Get the actual client IP
  const clientIP = getClientIP(req);
  console.log("Client IP:", clientIP);

  // Create visit record with actual IP
  await Visit.create({
    url: url._id,
    device: req.headers["user-agent"] || "Unknown",
    ip: clientIP,
  });

  // Increment click count
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
