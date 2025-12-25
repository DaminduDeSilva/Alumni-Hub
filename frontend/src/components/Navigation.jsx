import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Navigation = ({ onOpenSidebar }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationRef = useRef(null);

  // Dynamic greeting based on time of day
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

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
    <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 px-6 sm:px-10">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-8">
        
        {/* Mobile Menu Trigger & Welcome */}
        <div className="flex items-center gap-6">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-3 text-gray-500 hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block">
             <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Welcome back</p>
             <h2 className="text-xl font-black text-primary flex items-center gap-2">
               {greeting}, {user?.full_name?.split(' ')[0] || 'User'} 
               <span className="animate-bounce-slow">👋</span>
             </h2>
          </div>
        </div>

        {/* Global Search - Ultra Modern */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-300 group-focus-within:text-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Quick search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-[24px] text-sm font-semibold placeholder-gray-400 focus:bg-white focus:border-secondary/10 focus:ring-8 focus:ring-secondary/5 transition-all outline-none shadow-sm group-hover:shadow-md"
            />
            <div className="absolute right-4 inset-y-0 flex items-center">
              <span className="text-[10px] font-bold text-gray-300 bg-gray-100 px-2 py-1 rounded-lg">⌘ K</span>
            </div>
          </div>
        </div>

        {/* Actions - Enhanced */}
        <div className="flex items-center gap-4">
          {/* Notifications - Refined */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-3.5 rounded-2xl transition-all duration-300 relative group ${showNotifications ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className={`absolute top-0 right-0 w-6 h-6 border-4 border-white text-[10px] font-black flex items-center justify-center rounded-full transition-colors ${showNotifications ? "bg-white text-secondary" : "bg-red-500 text-white"}`}>
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-6 w-96 bg-white rounded-[32px] shadow-2xl shadow-primary/10 py-6 z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-8 py-2 border-b border-gray-50 flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Recent Updates
                  </h3>
                  {notifications.some(n => !n.is_read) && (
                    <button onClick={handleMarkAllRead} className="text-[10px] font-black text-secondary hover:text-secondary-dark transition-colors uppercase tracking-widest">
                      Mark All
                    </button>
                  )}
                </div>

                <div className="max-h-[450px] overflow-y-auto px-4 scrollbar-hide">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-5 rounded-[24px] transition-all cursor-pointer mb-2 border-2 ${notif.is_read ? "border-transparent opacity-50 bg-gray-50/50" : "border-secondary/5 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/10 shadow-sm"}`}
                      >
                        <div className="flex gap-4">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.is_read ? "bg-gray-300" : "bg-secondary shadow-lg shadow-secondary/50"}`} />
                          <div>
                            <p className="text-sm font-bold text-primary mb-1">{notif.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center text-gray-300">
                       <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                       </svg>
                       <p className="text-xs font-black uppercase tracking-[0.2em]">Inbox is empty</p>
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
