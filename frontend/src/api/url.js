import { API_BASE_URL } from "../config/config";

const BASE_URL = `${API_BASE_URL}/api/url`;

console.log("API URL:", BASE_URL); // For debugging

const apiRequest = async (endpoint, options) => {
  try {
    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    console.log("Making URL API request to:", `${BASE_URL}${endpoint}`);
    console.log("Request options:", mergedOptions);

    const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);
    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);

    const data = await response.json();
    console.log("Response data:", data);

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
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(urlData),
  });

export const getAllUrls = () =>
  apiRequest("/all", {
    method: "GET",
    credentials: "include",
  });

export const deleteUrl = (urlId) =>
  apiRequest(`/${urlId}`, {
    method: "DELETE",
    credentials: "include",
  });
