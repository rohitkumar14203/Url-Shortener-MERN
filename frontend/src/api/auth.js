import { API_BASE_URL } from "../config/config";

const BASE_URL = `${API_BASE_URL}/api/users`;

const apiRequest = async (endpoint, options = {}) => {
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

    console.log("Request URL:", `${BASE_URL}${endpoint}`);
    console.log("Request Options:", mergedOptions);

    const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

    // Log response headers for debugging
    console.log("Response Headers:", [...response.headers.entries()]);
    console.log("Response Status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Server error occurred");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const registerUser = (userData) =>
  apiRequest("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });

export const loginUser = async (credentials) => {
  try {
    const data = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = () =>
  apiRequest("/logout", {
    method: "POST",
    credentials: "include",
  });

export const getUser = () =>
  apiRequest("/profile", {
    method: "GET",
    credentials: "include",
  });

export const updateUser = (userData) =>
  apiRequest("/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });

export const deleteUser = () =>
  apiRequest("/profile", {
    method: "DELETE",
    credentials: "include",
  });
