import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Sidebar = ({ isOpen, onClose, user, isAuthenticated }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const SidebarLink = ({ to, children, icon }) => (
    <Link
      to={to}
      onClick={onClose}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive(to)
          ? "bg-secondary text-white shadow-md transform scale-[1.02]"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span className="font-medium">{children}</span>
    </Link>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="absolute top-0 right-0 h-full w-[280px] bg-primary shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <span className="text-xl font-headings font-bold text-white tracking-wide">
            Menu
          </span>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <SidebarLink to="/">Home</SidebarLink>

          {(user?.role === "VERIFIED_USER" ||
            user?.role === "SUPER_ADMIN" ||
            user?.role === "FIELD_ADMIN") && (
            <SidebarLink to="/events">Events</SidebarLink>
          )}

          {user?.role === "VERIFIED_USER" && (
            <>
              <SidebarLink to="/my-profile">My Profile</SidebarLink>
              <SidebarLink to="/my-submissions">My Submissions</SidebarLink>
            </>
          )}

          {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
            <>
              <SidebarLink to="/directory">Directory</SidebarLink>

              {user?.role === "FIELD_ADMIN" && (
                <SidebarLink to="/my-profile">My Profile</SidebarLink>
              )}

              <SidebarLink to="/admin">
                {user?.role === "FIELD_ADMIN" ? "Manage" : "Dashboard"}
              </SidebarLink>

              <SidebarLink to="/reports">Reports</SidebarLink>

              {user?.role === "SUPER_ADMIN" && (
                <SidebarLink to="/admin/field-admins">Admins</SidebarLink>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white text-lg font-bold shadow-inner">
              {(user?.full_name || user?.email)?.[0].toUpperCase()}
            </div>
            <div className="ml-4 overflow-hidden">
              <p className="text-white font-bold truncate">
                {user?.full_name || user?.email}
              </p>
              <p className="text-gray-400 text-xs uppercase tracking-wider">
                {user?.role === "FIELD_ADMIN" && user?.assigned_field
                  ? `${user.assigned_field} Admin`
                  : user?.role?.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </div>

          {user?.role === "UNVERIFIED" && (
            <Link
              to="/submit"
              onClick={onClose}
              className="block w-full text-center bg-secondary hover:bg-secondary-dark text-white px-4 py-3 rounded-lg font-bold transition-all mb-4 shadow-lg hover:shadow-secondary/20"
            >
              Submit Data
            </Link>
          )}
          
          <div className="flex items-center justify-center w-full">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
