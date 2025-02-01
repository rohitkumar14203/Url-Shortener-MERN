import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, logoutUser, getUser } from "../api/auth";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const userData = await getUser();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials);
      setUser(data);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      toast.success("Login successful");
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await registerUser(userData);
      setUser(data);
      // Save user data in localStorage
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  const updateUserContext = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        loading,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
