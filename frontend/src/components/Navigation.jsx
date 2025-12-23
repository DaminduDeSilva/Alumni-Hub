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
    <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
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
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
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
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Home
            </Link>

            {/* Events link for all verified users and admins */}
            {(user?.role === "VERIFIED_USER" ||
              user?.role === "SUPER_ADMIN" ||
              user?.role === "FIELD_ADMIN") && (
              <Link
                to="/events"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/events")
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Events
              </Link>
            )}

            {/* User-specific links based on role */}
            {user?.role === "VERIFIED_USER" && (
              <>
                <Link
                  to="/my-profile"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/my-profile")
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  My Profile
                </Link>
                <Link
                  to="/my-submissions"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/my-submissions")
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {user?.role === "FIELD_ADMIN" ? "Manage" : "Dashboard"}
                </Link>

                <Link
                  to="/reports"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/reports")
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Reports
                </Link>

                {user?.role === "SUPER_ADMIN" && (
                  <Link
                    to="/admin/field-admins"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/admin/field-admins")
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Submit Data
              </Link>
            )}

            {/* Enhanced User menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.full_name || user?.email}
                </div>
                <div className="text-xs text-gray-500 capitalize font-medium">
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
