import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
import api from "../utils/api";

const Navigation = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadApproval, setHasUnreadApproval] = useState(false);
  const notificationRef = useRef(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch Admin Pending Count
  useEffect(() => {
    if (user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") {
      const fetchPending = async () => {
        try {
          const res = await api.get("/admin/submissions/pending");
          setPendingCount(res.data.submissions.length);
        } catch (err) {
          console.error("Failed to fetch pending count", err);
        }
      };
      
      fetchPending();
      // Poll every minute for updates
      const interval = setInterval(fetchPending, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Check User Verification Notification
  useEffect(() => {
    if (user?.role === "VERIFIED_USER") {
      const seen = localStorage.getItem("hasSeenApproval");
      if (!seen) {
        setHasUnreadApproval(true);
      }
    }
  }, [user]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    
    // Mark user approval as read when opening notifications
    if (hasUnreadApproval && !showNotifications) {
      localStorage.setItem("hasSeenApproval", "true");
      setHasUnreadApproval(false);
    }
  };

  const notificationCount =
    (user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN"
      ? pendingCount
      : 0) + (hasUnreadApproval ? 1 : 0);

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
            {/* Notification Bell */}
             {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN" || user?.role === "VERIFIED_USER") && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none"
                  aria-label="Notifications"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border border-primary">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Notifications
                      </h3>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
                        <>
                           {pendingCount > 0 ? (
                            <Link
                              to="/admin"
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 border-secondary"
                              onClick={() => setShowNotifications(false)}
                            >
                              <p className="text-sm font-bold text-primary">Pending Reviews</p>
                              <p className="text-xs text-gray-500 mt-1">
                                You have <span className="font-bold text-secondary">{pendingCount}</span> submission{pendingCount !== 1 && 's'} waiting for approval.
                              </p>
                            </Link>
                          ) : (
                             <div className="px-4 py-4 text-center text-gray-500">
                                <p className="text-sm">No pending submissions.</p>
                             </div>
                          )}
                        </>
                      )}

                      {user?.role === "VERIFIED_USER" && (
                         <div className="px-4 py-3 border-l-4 border-green-500 bg-green-50">
                            <p className="text-sm font-bold text-green-800">Account Verified</p>
                            <p className="text-xs text-green-600 mt-1">
                               Congratulations! Your profile has been approved and you are now a verified member.
                            </p>
                         </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
