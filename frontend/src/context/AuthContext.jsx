import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (err) {
      console.error("Auth check failed:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/auth/login", { email, password });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);

      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const loginWithGoogle = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleGoogleCallback = (token) => {
    localStorage.setItem("token", token);
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
    window.location.href = "/"; // Redirect to home
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    handleGoogleCallback,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN",
    isVerified: user?.is_verified || user?.role !== "UNVERIFIED",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
