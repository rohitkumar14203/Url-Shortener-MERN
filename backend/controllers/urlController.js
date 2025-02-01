import asyncHandler from "../middleware/asyncHandler.js";
import URL from "../modal/urlModal.js";

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

// @desc    Create short URL
// @route   POST /api/url/shorten
// @access  Private
const createShortUrl = [
  debugRequest,
  asyncHandler(async (req, res) => {
    const { originalUrl, expirationDate, remarks } = req.body;

    if (!originalUrl) {
      res.status(400);
      throw new Error("Please provide a URL");
    }

    const url = await URL.create({
      originalUrl,
      user: req.user._id,
      expirationDate: expirationDate || null,
      remarks: remarks || "",
    });

    res.status(201).json({
      success: true,
      data: url,
    });
  }),
];

// @desc    Get all URLs for user
// @route   GET /api/url/all
// @access  Private
const getAllUrls = [
  debugRequest,
  asyncHandler(async (req, res) => {
    console.log("Getting URLs for user:", req.user._id);

    const urls = await URL.find({ user: req.user._id });

    res.json({
      success: true,
      data: {
        urls,
        visits: [], // We'll implement visit tracking later
      },
    });
  }),
];

// @desc    Delete URL
// @route   DELETE /api/url/:id
// @access  Private
const deleteUrl = [
  debugRequest,
  asyncHandler(async (req, res) => {
    const url = await URL.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!url) {
      res.status(404);
      throw new Error("URL not found");
    }

    await url.deleteOne();
    res.json({ success: true, data: {} });
  }),
];

// @desc    Get URL stats
// @route   GET /api/url/stats/:id
// @access  Private
const getUrlStats = [
  debugRequest,
  asyncHandler(async (req, res) => {
    const url = await URL.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!url) {
      res.status(404);
      throw new Error("URL not found");
    }

    res.json({
      success: true,
      data: {
        url,
        stats: {
          clicks: url.clicks,
          createdAt: url.createdAt,
          lastAccessed: url.updatedAt,
        },
      },
    });
  }),
];

// @desc    Redirect to original URL
// @route   GET /:shortUrl
// @access  Public
const redirectToUrl = asyncHandler(async (req, res) => {
  const url = await URL.findOne({ shortUrl: req.params.shortUrl });

  if (!url) {
    res.status(404);
    throw new Error("URL not found");
  }

  // Update click count
  url.clicks += 1;
  await url.save();

  res.redirect(url.originalUrl);
});

export { createShortUrl, getAllUrls, deleteUrl, getUrlStats, redirectToUrl };
