import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";

const LogoutButton = ({ fullWidth = false, className = "" }) => {
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

  if (fullWidth) {
    return (
      <>
        <button
          onClick={handleLogoutClick}
          className={`w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all duration-300 group ${className}`}
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>
        </button>

        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmLogout}
          title="Sign Out"
          message="Are you sure you want to sign out?"
          confirmText="Sign Out"
          isDangerous={true}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleLogoutClick}
        className={`p-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300 group ${className}`}
        title="Sign out"
      >
        <svg
          className="w-6 h-6 group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
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
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        isDangerous={true}
      />
    </>
  );
};

export default LogoutButton;
