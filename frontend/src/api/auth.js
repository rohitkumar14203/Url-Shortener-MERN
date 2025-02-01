import { API_BASE_URL } from "../config/config";

const BASE_URL = `${API_BASE_URL}/api/users`;

const apiRequest = async (endpoint, options) => {
  try {
    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    // If we have a token in localStorage, add it to headers
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

    console.log("Making request to:", `${BASE_URL}${endpoint}`); // Debug log
    console.log("With options:", mergedOptions); // Debug log

    const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);
    const data = await response.json();

    // Debug logs
    console.log("Response status:", response.status);
    console.log("Response data:", data);

    if (!response.ok) {
      throw new Error(data.message || "Server error occurred");
    }

    // If this is a login/register response and we got a token, save it
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error); // Debug log
    throw new Error(error.message || "Server error occurred");
  }
};

// Simplified API functions that use the base apiRequest
export const loginUser = (credentials) =>
  apiRequest("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const registerUser = (userData) =>
  apiRequest("/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const logoutUser = async () => {
  try {
    await apiRequest("/logout", { method: "POST" });
    localStorage.removeItem("token"); // Clear token on logout
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getUser = () =>
  apiRequest("/profile", {
    method: "GET",
  });

export const updateUser = (userData) =>
  apiRequest("/profile", {
    method: "PUT",
    body: JSON.stringify(userData),
  });

export const deleteUser = () =>
  apiRequest("/profile", {
    method: "DELETE",
  });
