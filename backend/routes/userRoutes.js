import express from "express";
import {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
  logoutUser,
  getCurrentUserProfile,
} from "../controllers/userController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateUserProfile)
  .delete(authenticate, deleteUserProfile);

export default router;
