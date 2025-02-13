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

    console.log("Making request to:", `${BASE_URL}${endpoint}`);
    console.log("With options:", mergedOptions);

    const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);
    const data = await response.json();

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
    console.error("API Error:", error);
    // If unauthorized, clear token and user data
    if (error.message.includes("Not authorized")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      localStorage.setItem("token", response.token);
      console.log("Token stored:", response.token);
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  const data = await apiRequest("/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  return data;
};

export const logoutUser = async () => {
  try {
    await apiRequest("/logout", { method: "POST" });
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getUser = async () => {
  const data = await apiRequest("/profile", {
    method: "GET",
  });
  return data;
};

export const updateUser = async (userData) => {
  const data = await apiRequest("/profile", {
    method: "PUT",
    body: JSON.stringify(userData),
  });
  return data;
};

export const deleteUser = async () => {
  const data = await apiRequest("/profile", {
    method: "DELETE",
  });
  return data;
};
