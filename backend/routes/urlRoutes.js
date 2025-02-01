import express from "express";
import {
  shortenUrl,
  getAllUrls,
  updateUrl,
  deleteUrl,
  getUrlStats,
} from "../controllers/urlController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/shorten", authenticate, shortenUrl);
router.get("/all", authenticate, getAllUrls);
router.put("/:id", authenticate, updateUrl);
router.delete("/:id", authenticate, deleteUrl);
router.get("/:shortUrl/stats", authenticate, getUrlStats);

// Add this route for testing
router.get("/test-auth", authenticate, (req, res) => {
  res.json({
    message: "Authentication successful",
    user: req.user._id,
    cookies: req.cookies,
  });
});

// Add at the beginning of your routes
router.get("/test-cookies", (req, res) => {
  console.log("All Cookies:", req.cookies);
  console.log("JWT Cookie:", req.cookies.jwt);
  console.log("Headers:", req.headers);
  res.json({
    cookies: req.cookies,
    jwt: req.cookies.jwt,
    headers: req.headers,
  });
});

export default router;
