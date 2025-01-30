import { createContext, useContext, useState, useEffect } from "react";
import { getUser } from "../api/auth";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        toast.error(error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setLoading(false);
  };
  const updateUserContext = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUserContext }}
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
