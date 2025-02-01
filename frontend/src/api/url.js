import { API_BASE_URL } from "../config/config";

const BASE_URL = `${API_BASE_URL}/api/url`;

console.log("API URL:", BASE_URL); // For debugging

const apiRequest = async (endpoint, options) => {
  try {
    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if no token
      window.location.href = "/login";
      throw new Error("Please login to continue");
    }

    defaultOptions.headers.Authorization = `Bearer ${token}`;

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Server error occurred");
    }

    return data;
  } catch (error) {
    console.error("URL API Error:", error);
    throw error;
  }
};

export const createShortUrl = (urlData) =>
  apiRequest("/shorten", {
    method: "POST",
    body: JSON.stringify(urlData),
  });

export const getAllUrls = () =>
  apiRequest("/all", {
    method: "GET",
  });

export const deleteUrl = (urlId) =>
  apiRequest(`/${urlId}`, {
    method: "DELETE",
  });
