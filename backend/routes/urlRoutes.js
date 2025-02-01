import express from "express";
import {
  createShortUrl,
  getAllUrls,
  deleteUrl,
  getUrlStats,
} from "../controllers/urlController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.route("/shorten").post(createShortUrl);
router.route("/all").get(getAllUrls);
router.route("/stats/:id").get(getUrlStats);
router.route("/:id").delete(deleteUrl);

export default router;
