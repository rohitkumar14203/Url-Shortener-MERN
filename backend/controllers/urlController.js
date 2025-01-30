import asyncHandler from "../middleware/asyncHandler.js";
import URL from "../modal/urlModal.js";

// @desc    Create a short URL
// @route   POST /api/url/shorten
// @access  Private
const shortenUrl = asyncHandler(async (req, res) => {
  const { originalUrl, expirationDate, remarks } = req.body;

  // Basic validation
  if (!originalUrl) {
    res.status(400);
    throw new Error("Original URL is required");
  }

  // Create URL document with user reference
  const urlDoc = new URL({
    user: req.user._id, // Add user reference
    originalUrl,
    expirationDate: expirationDate || null,
    remarks: remarks || "",
  });

  // Save to database
  const savedUrl = await urlDoc.save();

  res.status(201).json({
    success: true,
    data: {
      _id: savedUrl._id,
      originalUrl: savedUrl.originalUrl,
      shortUrl: savedUrl.shortUrl,
      expirationDate: savedUrl.expirationDate,
      status: savedUrl.status,
      clicks: savedUrl.clicks,
      remarks: savedUrl.remarks,
      createdAt: savedUrl.createdAt,
    },
  });
});

// @desc    Get all URLs for the current user
// @route   GET /api/url/all
// @access  Private
const getAllUrls = asyncHandler(async (req, res) => {
  // Get all URLs for the current user
  const urls = await URL.find({ user: req.user._id }).sort({ createdAt: -1 });

  // Map URLs to include all necessary fields
  const urlData = urls.map((url) => ({
    _id: url._id,
    originalUrl: url.originalUrl,
    shortUrl: url.shortUrl,
    remarks: url.remarks || "",
    clicks: url.clicks || 0,
    status: url.status || "active",
    createdAt: url.createdAt,
    expirationDate: url.expirationDate,
  }));

  // Create a flattened array of all visits
  const allVisits = [];
  urls.forEach((url) => {
    url.clickDetails.forEach((click) => {
      allVisits.push({
        timestamp: click.timestamp,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        ipAddress: click.ipAddress,
        device: click.device,
        _id: click._id,
      });
    });
  });

  // Sort all visits by timestamp, newest first
  allVisits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({
    success: true,
    data: {
      urls: urlData,
      visits: allVisits,
    },
  });
});

// @desc    Update URL
// @route   PUT /api/url/:id
// @access  Private
const updateUrl = asyncHandler(async (req, res) => {
  const { originalUrl, expirationDate, remarks } = req.body;
  const url = await URL.findOne({ _id: req.params.id, user: req.user._id }); // Only find URL owned by current user

  if (!url) {
    res.status(404);
    throw new Error("URL not found or you don't have permission to update it");
  }

  url.originalUrl = originalUrl || url.originalUrl;
  url.remarks = remarks || url.remarks;
  url.expirationDate = expirationDate || url.expirationDate;

  const updatedUrl = await url.save();

  res.json({
    success: true,
    data: updatedUrl,
  });
});

// @desc    Delete URL
// @route   DELETE /api/url/:id
// @access  Private
const deleteUrl = asyncHandler(async (req, res) => {
  try {
    const url = await URL.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      res.status(404);
      throw new Error(
        "URL not found or you don't have permission to delete it"
      );
    }

    await URL.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    res.status(error.status || 500);
    throw new Error(error.message || "Failed to delete URL");
  }
});

// @desc    Get URL stats by short URL
// @route   GET /api/url/:shortUrl/stats
// @access  Private
const getUrlStats = asyncHandler(async (req, res) => {
  const shortUrl = `https://${process.env.HOSTNAME || "localhost:5000"}/${
    req.params.shortUrl
  }`;

  const url = await URL.findOne({ shortUrl, user: req.user._id }); // Only find URL owned by current user

  if (!url) {
    res.status(404);
    throw new Error(
      "URL not found or you don't have permission to view its stats"
    );
  }

  res.json({
    success: true,
    data: {
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      expirationDate: url.expirationDate,
      status: url.status,
      clicks: url.clicks,
      clickDetails: url.clickDetails,
      remarks: url.remarks,
      createdAt: url.timestamp,
    },
  });
});

// @desc    Redirect to original URL
// @route   GET /:shortUrl
// @access  Public
const redirectToUrl = asyncHandler(async (req, res) => {
  // Skip favicon and bot requests
  if (
    req.originalUrl === "/favicon.ico" ||
    req.originalUrl.includes("robots.txt")
  ) {
    res.status(204).end();
    return;
  }

  const shortUrl = `https://${process.env.HOSTNAME || "localhost:5000"}/${
    req.params.shortUrl
  }`;

  const url = await URL.findOne({ shortUrl });

  if (!url) {
    res.status(404);
    throw new Error("URL not found");
  }

  if (url.isInactive()) {
    res.status(410);
    throw new Error("URL has expired");
  }

  // Get the actual client IP address
  let clientIp =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress;

  // If x-forwarded-for contains multiple IPs, get the first one (original client)
  if (clientIp && clientIp.includes(",")) {
    clientIp = clientIp.split(",")[0].trim();
  }

  // Remove IPv6 prefix if present
  clientIp = clientIp.replace(/^::ffff:/, "");

  // Create a unique visit identifier
  const visitId = `${shortUrl}-${clientIp}-${Math.floor(Date.now() / 30000)}`; // 30-second window

  // Only register click if it's not a bot/crawler request and not a duplicate within 30 seconds
  const userAgent = req.headers["user-agent"] || "Unknown";
  const isBot = /bot|crawler|spider|crawling|favicon/i.test(userAgent);
  const recentVisit = await URL.findOne({
    shortUrl,
    "clickDetails.visitId": visitId,
  });

  if (!isBot && !recentVisit) {
    // Register click with IP, user agent, and visit ID
    await url.registerClick(clientIp, userAgent, visitId);
  }

  // For Postman testing: Send both redirect and JSON response
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    res.json({
      success: true,
      message: "Redirect URL found",
      redirectUrl: url.originalUrl,
    });
  } else {
    // For browser: Perform actual redirect with cache control
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.redirect(url.originalUrl);
  }
});

export {
  shortenUrl,
  getAllUrls,
  updateUrl,
  deleteUrl,
  getUrlStats,
  redirectToUrl,
};
