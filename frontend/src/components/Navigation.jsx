import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
import api from "../utils/api";

const Navigation = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasUnreadApproval, setHasUnreadApproval] = useState(false);
  const notificationRef = useRef(null);
  const menuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close mobile menu on location change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch Notifications
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get("/notifications");
          setNotifications(res.data.notifications);
        } catch (err) {
          console.error("Failed to fetch notifications", err);
        }
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Early return MUST be after all hooks
  if (!isAuthenticated) {
    return null;
  }

  const NavLink = ({ to, children, mobile = false }) => (
    <Link
      to={to}
      className={`${
        mobile
          ? "block px-3 py-2 rounded-md text-base font-medium"
          : "px-4 py-2 rounded-md text-sm font-medium"
      } transition-colors duration-200 ${
        isActive(to)
          ? "bg-secondary text-white shadow-sm"
          : "text-gray-300 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const notificationCount = notifications.filter(n => !n.is_read).length;

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
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Mobile menu button */}
            <div className="flex md:hidden" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
            {/* Notification Bell */}
            {(user?.role === "SUPER_ADMIN" ||
              user?.role === "FIELD_ADMIN" ||
              user?.role === "VERIFIED_USER") && (
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
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Notifications
                      </h3>
                      {notifications.some(n => !n.is_read) && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-xs text-secondary hover:text-secondary-dark font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            to={notif.link || "#"}
                            onClick={() => {
                              handleMarkAsRead(notif.id);
                              setShowNotifications(false);
                            }}
                            className={`block px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 ${
                              notif.is_read ? "border-transparent" : "border-secondary bg-blue-50/30"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${notif.is_read ? "text-gray-600" : "font-bold text-primary"}`}>
                                {notif.title}
                              </p>
                              {!notif.is_read && (
                                <span className="w-2 h-2 bg-secondary rounded-full"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <svg className="w-10 h-10 text-gray-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <p className="text-sm">No notifications yet</p>
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary border-t border-primary-dark">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" mobile>Home</NavLink>

            {(user?.role === "VERIFIED_USER" ||
              user?.role === "SUPER_ADMIN" ||
              user?.role === "FIELD_ADMIN") && (
              <NavLink to="/events" mobile>Events</NavLink>
            )}

            {user?.role === "VERIFIED_USER" && (
              <>
                <NavLink to="/my-profile" mobile>My Profile</NavLink>
                <NavLink to="/my-submissions" mobile>My Submissions</NavLink>
              </>
            )}

            {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
              <>
                <NavLink to="/directory" mobile>Directory</NavLink>

                {user?.role === "FIELD_ADMIN" && (
                  <NavLink to="/my-profile" mobile>My Profile</NavLink>
                )}

                <NavLink to="/admin" mobile>
                  {user?.role === "FIELD_ADMIN" ? "Manage" : "Dashboard"}
                </NavLink>

                <NavLink to="/reports" mobile>Reports</NavLink>

                {user?.role === "SUPER_ADMIN" && (
                  <NavLink to="/admin/field-admins" mobile>Admins</NavLink>
                )}
              </>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-primary-dark px-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
                  {(user?.full_name || user?.email)?.[0].toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">
                  {user?.full_name || user?.email}
                </div>
                <div className="text-sm font-medium leading-none text-gray-400 mt-1">
                  {user?.role === "FIELD_ADMIN" && user?.assigned_field
                    ? `${user.assigned_field} Admin`
                    : user?.role?.toLowerCase().replace("_", " ")}
                </div>
              </div>
            </div>
            
            {user?.role === "UNVERIFIED" && (
              <div className="mb-4">
                <Link
                  to="/submit"
                  className="block w-full text-center bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Submit Data
                </Link>
              </div>
            )}
            
            <div className="flex justify-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
