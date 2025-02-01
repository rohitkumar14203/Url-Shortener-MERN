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

// Update CORS configuration
const FRONTEND_URL = "https://url-shortener-mern-one.vercel.app";
// const FRONTEND_URL = "http://localhost:5173";

// CORS configuration
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Additional headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
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

app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${port}`
  );
});
