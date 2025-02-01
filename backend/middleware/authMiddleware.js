import jwt from "jsonwebtoken";
import User from "../modal/userModal.js";
import asyncHandler from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

export default authenticate;
