import jwt from "jsonwebtoken";
import User from "../modal/userModal.js";
import asyncHandler from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Debug log for incoming request
  console.log("Auth Headers:", {
    authorization: req.headers.authorization,
    cookie: req.headers.cookie,
    allHeaders: req.headers,
  });

  // First try to get token from Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token from Authorization:", token);
    } catch (error) {
      console.error("Error extracting token from Authorization:", error);
    }
  }

  // If no token in Authorization header, try cookies
  if (!token && req.cookies?.jwt) {
    token = req.cookies.jwt;
    console.log("Token from cookies:", token);
  }

  if (!token) {
    console.log("No token found in request. Headers:", req.headers);
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("No user found for token");
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

export default authenticate;
