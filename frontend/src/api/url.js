import { API_BASE_URL } from "../config/config";

const BASE_URL = `${API_BASE_URL}/api/url`;

console.log("API URL:", BASE_URL); // For debugging

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const apiRequest = async (endpoint, options = {}) => {
  try {
    const headers = getAuthHeaders();

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

    console.log(
      `Making ${options.method || "GET"} request to:`,
      `${BASE_URL}${endpoint}`
    );
    console.log("Request headers:", mergedOptions.headers);

    const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

    if (response.status === 401) {
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
    if (error.message.includes("No authentication token found")) {
      window.location.href = "/login";
    }
    throw error;
  }
};

export const getAllUrls = async () => {
  return apiRequest("/all", { method: "GET" });
};

export const getUrlStats = async (urlId) => {
  return apiRequest(`/${urlId}/stats`, { method: "GET" });
};

export const createShortUrl = async (urlData) => {
  return apiRequest("/shorten", {
    method: "POST",
    body: JSON.stringify(urlData),
  });
};

export const updateUrl = async (urlId, urlData) => {
  return apiRequest(`/${urlId}`, {
    method: "PUT",
    body: JSON.stringify(urlData),
  });
};

export const deleteUrl = async (urlId) => {
  return apiRequest(`/${urlId}`, { method: "DELETE" });
};
