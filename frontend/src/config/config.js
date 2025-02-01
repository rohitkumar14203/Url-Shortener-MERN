export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://url-shortener-mern.onrender.com"
    : "http://localhost:5000";
