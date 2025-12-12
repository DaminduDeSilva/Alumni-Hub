import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const Navigation = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="blue-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent group-hover:from-blue-100 group-hover:to-blue-300 transition-all duration-300">
                Alumni Hub
              </span>
            </Link>
          </div>

          {/* Enhanced Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Home */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "blue-text-secondary hover:text-white hover:bg-blue-700/30"
              }`}
            >
              Home
            </Link>

            {/* User-specific links based on role */}
            {user?.role === "VERIFIED_USER" && (
              <>
                <Link
                  to="/my-profile"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/my-profile")
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "blue-text-secondary hover:text-white hover:bg-blue-700/30"
                  }`}
                >
                  My Profile
                </Link>
                <Link
                  to="/my-submissions"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/my-submissions")
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "blue-text-secondary hover:text-white hover:bg-blue-700/30"
                  }`}
                >
                  My Submissions
                </Link>
              </>
            )}

            {/* Directory for admins */}
            {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
              <>
                <Link
                  to="/directory"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/directory")
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "blue-text-secondary hover:text-white hover:bg-blue-700/30"
                  }`}
                >
                  Directory
                </Link>

                {/* My Profile for field admins */}
                {user?.role === "FIELD_ADMIN" && (
                  <Link
                    to="/my-profile"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/my-profile")
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "blue-text-secondary hover:text-white hover:bg-blue-700/30"
                    }`}
                  >
                    My Profile
                  </Link>
                )}
              </>
            )}

            {/* Admin Panel for admins */}
            {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
              <>
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/admin")
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "blue-text-secondary hover:text-white hover:bg-blue-700/30"
                  }`}
                >
                  {user?.role === "FIELD_ADMIN" ? "Manage" : "Dashboard"}
                </Link>

                <Link
                  to="/reports"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/reports")
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "blue-text-secondary hover:text-white hover:bg-blue-700/30"
                  }`}
                >
                  Reports
                </Link>

                {user?.role === "SUPER_ADMIN" && (
                  <Link
                    to="/admin/field-admins"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/admin/field-admins")
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "blue-text-secondary hover:text-white hover:bg-blue-700/30"
                    }`}
                  >
                    Admins
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Enhanced Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Enhanced Submit Data for unverified users */}
            {user?.role === "UNVERIFIED" && (
              <Link
                to="/submit"
                className="blue-button"
              >
                Submit Data
              </Link>
            )}

            {/* Enhanced User menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold blue-text-primary">
                  {user?.full_name || user?.email}
                </div>
                <div className="text-xs blue-text-muted capitalize font-medium">
                  {user?.role === "FIELD_ADMIN" && user?.assigned_field
                    ? `${user.assigned_field} Admin`
                    : user?.role?.toLowerCase().replace("_", " ")}
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
