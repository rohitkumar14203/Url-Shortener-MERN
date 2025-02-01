import { API_BASE_URL } from "../config/config";

const BASE_URL = `${API_BASE_URL}/api/url`;

console.log("API URL:", BASE_URL); // For debugging

const apiRequest = async (endpoint, options) => {
  try {
    // Get token before making request
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      window.location.href = "/login";
      throw new Error("Please login to continue");
    }

    // Create headers with token
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const defaultOptions = {
      credentials: "include",
      headers,
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    console.log("Making request with token:", token);
    console.log("Request URL:", `${BASE_URL}${endpoint}`);
    console.log("Request options:", mergedOptions);

    const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

    // Log the actual request headers for debugging
    console.log("Request headers sent:", mergedOptions.headers);

    if (response.status === 401) {
      console.log("Unauthorized request - clearing token");
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

export const getAllUrls = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  return apiRequest("/all", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createShortUrl = async (urlData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  return apiRequest("/shorten", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(urlData),
  });
};

export const deleteUrl = async (urlId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  return apiRequest(`/${urlId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
