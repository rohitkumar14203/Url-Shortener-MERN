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
// const getAllUrls = asyncHandler(async (req, res) => {
//   console.log("Getting URLs for user:", req.user._id);

//   const urls = await URL.find({ user: req.user._id }).sort({ createdAt: -1 });
//   const visits = new Visit({
//     url: url._id,
//     ip:
//       req.headers["x-forwarded-for"]?.split(",")[0] ||
//       req.connection.remoteAddress ||
//       "Unknown",
//     userAgent: req.headers["user-agent"] || "Unknown",
//   })
//     .sort({ timestamp: -1 })
//     .populate("url", "originalUrl shortUrl");
//   await visits.save();

//   // Format visit data with URL details and proper IP
//   const formattedVisits = visits.map((visit) => ({
//     _id: visit._id,
//     timestamp: visit.timestamp,
//     originalUrl: visit.url.originalUrl,
//     shortUrl: visit.url.shortUrl,
//     ipAddress: visit.ip || "Unknown",
//     device: determineDevice(visit.device),
//   }));

//   res.json({
//     success: true,
//     data: {
//       urls,
//       visits: formattedVisits,
//     },
//   });
// });

const getAllUrls = asyncHandler(async (req, res) => {
  const urls = await URL.find({ user: req.user._id }).sort({ createdAt: -1 });

  // Fetch visit records for these URLs
  const visits = await Visit.find({ url: { $in: urls.map((url) => url._id) } })
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

// Helper function to get client IP
const getClientIP = (req) => {
  // Try Cloudflare headers first
  const cfIP =
    req.headers["cf-connecting-ip"] || req.headers["cf-connecting-ipv6"];
  if (cfIP) {
    return cfIP;
  }

  // Try x-forwarded-for
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    const clientIP = ips[0].trim();
    return clientIP;
  }

  // Try other headers
  const alternativeIPs = [
    req.headers["true-client-ip"],
    req.headers["x-real-ip"],
    req.headers["x-client-ip"],
    req.connection?.remoteAddress,
    req.socket?.remoteAddress,
    req.connection?.socket?.remoteAddress,
    "Unknown",
  ];

  const detectedIP = alternativeIPs.find(
    (ip) => ip && ip !== "1" && ip !== "unknown"
  );
  return detectedIP;
};

// Helper function to determine device type
const determineDevice = (userAgent) => {
  if (!userAgent) return "Unknown";

  const ua = userAgent.toLowerCase();

  // Mobile Devices
  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android")) {
    if (ua.includes("mobile")) return "Android Phone";
    return "Android Tablet";
  }

  // Desktop OS
  if (ua.includes("windows")) {
    if (ua.includes("windows phone")) return "Windows Phone";
    return "Windows PC";
  }
  if (ua.includes("macintosh") || ua.includes("mac os")) return "Mac";
  if (ua.includes("linux")) {
    if (ua.includes("android")) return "Android Device";
    return "Linux";
  }
  if (ua.includes("cros")) return "ChromeOS";

  // Game Consoles
  if (ua.includes("playstation")) return "PlayStation";
  if (ua.includes("xbox")) return "Xbox";
  if (ua.includes("nintendo")) return "Nintendo";

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

  // Get the actual client IP and device type
  const clientIP = getClientIP(req);
  const deviceType = determineDevice(req.headers["user-agent"]);

  // Create visit record
  await Visit.create({
    url: url._id,
    device: deviceType,
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
