import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// Custom debounce helper to avoid external dependencies
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const Navigation = ({ onOpenSidebar }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  // Dynamic greeting
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Search Implementation
  const fetchSearchResults = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      try {
        const res = await api.get(`/directory?search=${query}&limit=5`);
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      setShowResults(true);
      fetchSearchResults(searchQuery);
    } else {
      setShowResults(false);
    }
  }, [searchQuery, fetchSearchResults]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Notifications
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
    } catch (err) { console.error(err); }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  };

  const notificationCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-24 bg-primary border-b border-white/5 sticky top-0 z-50 px-6 sm:px-10">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-8">
        
        {/* Sidebar Toggle & Welcome */}
        <div className="flex items-center gap-6">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-3 text-gray-400 hover:bg-white/5 rounded-2xl transition-all active:scale-95 border border-white/5"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block">
             <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Status: Verified</p>
             <h2 className="text-xl font-black text-white flex items-center gap-2">
               {greeting}, {user?.full_name?.split(' ')[0] || 'User'} 
               <span className="animate-bounce-slow">👋</span>
             </h2>
          </div>
        </div>

        {/* Global Search - Dark & Functional */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className={`h-5 w-5 transition-colors duration-300 ${isSearching ? "text-secondary animate-pulse" : "text-gray-500 group-focus-within:text-secondary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search alumni, events or submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full pl-14 pr-6 py-4 bg-primary-dark border-2 border-white/5 rounded-[24px] text-sm font-semibold text-white placeholder-gray-500 focus:border-secondary/20 focus:ring-8 focus:ring-secondary/5 transition-all outline-none shadow-inner"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-4 w-full bg-white rounded-[32px] shadow-2xl py-6 z-[60] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="px-8 pb-4 border-b border-gray-50 flex justify-between items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Results</p>
                {isSearching && <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />}
              </div>
              <div className="max-h-[400px] overflow-y-auto px-4 mt-4 scrollbar-hide">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Link
                      key={result.id}
                      to="/directory" // In a real app we'd go to /profile/:id
                      onClick={() => setShowResults(false)}
                      className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-gray-50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-sm group-hover:bg-secondary group-hover:text-white transition-colors">
                        {result.full_name?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{result.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{result.field || 'Alumni'} • Batch of {result.batch_year || 'N/A'}</p>
                      </div>
                    </Link>
                  ))
                ) : !isSearching ? (
                  <div className="py-12 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No results found for "{searchQuery}"</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-3.5 rounded-2xl transition-all duration-300 relative group border ${showNotifications ? "bg-secondary border-secondary text-white shadow-lg shadow-secondary/20" : "bg-primary-dark border-white/5 text-gray-400 hover:text-white hover:border-white/10"}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-6 h-6 border-4 border-primary text-[10px] font-black flex items-center justify-center rounded-full transition-colors ${showNotifications ? "bg-white text-secondary" : "bg-red-500 text-white"}`}>
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-6 w-96 bg-white rounded-[32px] shadow-2xl py-6 z-[70] border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-8 pb-4 border-b border-gray-50 flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notifications</h3>
                  <button onClick={handleMarkAllRead} className="text-[10px] font-black text-secondary hover:underline uppercase tracking-widest">Clear</button>
                </div>
                <div className="max-h-[450px] overflow-y-auto px-4 scrollbar-hide">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-5 rounded-[24px] transition-all cursor-pointer mb-2 border-2 ${notif.is_read ? "border-transparent opacity-50" : "border-secondary/5 bg-secondary/5 hover:bg-secondary/10"}`}
                      >
                        <p className="text-sm font-bold text-primary mb-1">{notif.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No new updates</p>
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
