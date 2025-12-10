import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      toast.error("Google login failed");
      navigate("/");
      return;
    }

    if (token) {
      handleGoogleCallback(token);
      toast.success("Google login successful!");
      navigate("/");
    } else {
      navigate("/");
    }
  }, [location, navigate, handleGoogleCallback]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google login...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
