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

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive(to)
          ? "bg-secondary text-white shadow-sm"
          : "text-gray-300 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-primary shadow-md sticky top-0 z-50 border-b border-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="text-xl font-headings font-bold text-white tracking-wide group-hover:text-secondary transition-colors duration-200">
                Alumni Hub
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/">Home</NavLink>

            {(user?.role === "VERIFIED_USER" ||
              user?.role === "SUPER_ADMIN" ||
              user?.role === "FIELD_ADMIN") && (
              <NavLink to="/events">Events</NavLink>
            )}

            {user?.role === "VERIFIED_USER" && (
              <>
                <NavLink to="/my-profile">My Profile</NavLink>
                <NavLink to="/my-submissions">My Submissions</NavLink>
              </>
            )}

            {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
              <>
                <NavLink to="/directory">Directory</NavLink>

                {user?.role === "FIELD_ADMIN" && (
                  <NavLink to="/my-profile">My Profile</NavLink>
                )}

                <NavLink to="/admin">
                  {user?.role === "FIELD_ADMIN" ? "Manage" : "Dashboard"}
                </NavLink>

                <NavLink to="/reports">Reports</NavLink>

                {user?.role === "SUPER_ADMIN" && (
                  <NavLink to="/admin/field-admins">Admins</NavLink>
                )}
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-6">
            {user?.role === "UNVERIFIED" && (
              <Link
                to="/submit"
                className="bg-secondary hover:bg-secondary-dark text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm"
              >
                Submit Data
              </Link>
            )}

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block border-r border-gray-600 pr-4">
                <div className="text-sm font-bold text-white font-headings">
                  {user?.full_name || user?.email}
                </div>
                <div className="text-xs text-gray-300 capitalize">
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
