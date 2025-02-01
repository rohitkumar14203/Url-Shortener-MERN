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
router.post("/shorten", shortenUrl);
router.get("/all", getAllUrls);
router.put("/:id", updateUrl);
router.delete("/:id", deleteUrl);
router.get("/:shortUrl/stats", getUrlStats);

export default router;
