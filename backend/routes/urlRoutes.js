import express from "express";
import {
  createShortUrl,
  getAllUrls,
  deleteUrl,
  getUrlStats,
  recordVisit,
} from "../controllers/urlController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/visit/:shortUrl", recordVisit);

// Protected routes
router.use(authenticate);
router.route("/shorten").post(createShortUrl);
router.route("/all").get(getAllUrls);
router.route("/stats/:id").get(getUrlStats);
router.route("/:id").delete(deleteUrl);

export default router;
