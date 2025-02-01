import jwt from "jsonwebtoken";
import User from "../modal/userModal.js";
import asyncHandler from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  console.log("Request cookies:", req.cookies);
  console.log("Headers:", req.headers);

  let token = req.cookies.jwt;

  if (!token) {
    console.log("No JWT token found in cookies");
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    console.log("Verifying token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      console.log("User not found for token");
      res.status(401);
      throw new Error("User not found");
    }

    console.log("Authentication successful for user:", req.user._id);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

export default authenticate;
