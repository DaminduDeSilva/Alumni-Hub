import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Navigation = ({ onOpenSidebar }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationRef = useRef(null);

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
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

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
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 px-4 sm:px-8">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Mobile Menu Trigger & Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden sm:block">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Platform</p>
             <h2 className="text-lg font-black text-primary">Dashboard</h2>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search alumni, events or folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-secondary/20 focus:ring-4 focus:ring-secondary/5 transition-all outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-3 rounded-2xl transition-all duration-300 relative ${showNotifications ? "bg-secondary/10 text-secondary" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 border-2 border-white text-[10px] font-black text-white flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl shadow-primary/10 py-4 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-6 py-2 border-b border-gray-50 flex justify-between items-center mb-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Notifications
                  </h3>
                  {notifications.some(n => !n.is_read) && (
                    <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-secondary hover:underline">
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto px-2 scrollbar-hide">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-4 rounded-2xl transition-all cursor-pointer mb-1 ${notif.is_read ? "opacity-60" : "bg-secondary/5 hover:bg-secondary/10"}`}
                      >
                        <p className={`text-sm ${notif.is_read ? "text-gray-600" : "font-bold text-primary"}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      <p className="text-xs font-bold uppercase tracking-widest">All caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
