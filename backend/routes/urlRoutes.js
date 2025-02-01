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

export default router;
