import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";

const LogoutButton = ({ className = "" }) => {
  const { logout } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmLogout = () => {
    logout();
    toast.success("Signed out successfully");
    setShowConfirmModal(false);
  };

  return (
    <>
      <button
        onClick={handleLogoutClick}
        className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group ${className}`}
        title="Sign out"
      >
        <svg
          className="w-5 h-5 group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
          />
        </svg>
      </button>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        isDangerous={true}
      />
    </>
  );
};

export default LogoutButton;
