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

    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

    console.log("Making request with token:", token);
    console.log("Request options:", mergedOptions);

    const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

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
  const data = await apiRequest("/all", {
    method: "GET",
  });
  return data;
};

export const createShortUrl = async (urlData) => {
  const data = await apiRequest("/shorten", {
    method: "POST",
    body: JSON.stringify(urlData),
  });
  return data;
};

export const deleteUrl = async (urlId) => {
  const data = await apiRequest(`/${urlId}`, {
    method: "DELETE",
  });
  return data;
};
