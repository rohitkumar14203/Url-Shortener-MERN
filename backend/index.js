import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import urlRoutes from "./routes/urlRoutes.js";
import { redirectToUrl } from "./controllers/urlController.js";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// Connect to database
connectDB();

// Apply middlewares in correct order
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL || "https://url-shortener-mern-one.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log("Incoming request:", {
    method: req.method,
    path: req.path,
    headers: {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie,
      origin: req.headers.origin,
      host: req.headers.host,
    },
    cookies: req.cookies,
  });
  next();
});

// Health check route
app.get("/", (req, res) => {
  res.send("API is running");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/url", urlRoutes);

// Handle favicon requests - MOVED BEFORE shortUrl handler
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Handle URL redirects at root level
app.get("/:shortUrl", redirectToUrl);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${port}`
  );
});
