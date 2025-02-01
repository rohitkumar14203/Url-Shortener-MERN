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

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    console.log("Making URL request to:", `${BASE_URL}${endpoint}`);
    console.log("With options:", mergedOptions);

    const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);
    const data = await response.json();

    console.log("URL Response status:", response.status);
    console.log("URL Response data:", data);

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
