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

  // Premium Logo-out Icon (Minimalist)
  const LogOutIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );

  return (
    <>
      <button
        onClick={handleLogoutClick}
        title="Sign Out"
        className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 group shadow-sm
          ${fullWidth 
            ? "w-full bg-white/5 border-white/10 text-white/50 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400" 
            : "bg-white/5 border-white/10 text-white/40 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
          } ${className}`}
      >
        <span className="group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <LogOutIcon />
        </span>
      </button>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Sign Out"
        message="Are you sure you want to end your current session?"
        confirmText="Sign Out"
        isDangerous={true}
      />
    </>
  );
};

export default LogoutButton;
