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

    const url = `${BASE_URL}${endpoint}`;
    console.log("Making request to:", url);

    const response = await fetch(url, mergedOptions);
    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Server error occurred");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Unable to connect to server. Please check your internet connection."
      );
    }
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
      credentials: "include",
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
