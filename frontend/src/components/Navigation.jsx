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
  const inputRef = useRef(null);

  // Dynamic greeting
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Keyboard shortcut for search (/)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search Implementation - Fixed to use /batchmates endpoint
  const fetchSearchResults = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      try {
        const res = await api.get(`/batchmates?search=${query}`);
        // Backend returns search results in 'batchmates' property
        setSearchResults(res.data.batchmates || []);
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
      setSearchResults([]);
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
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 px-6 sm:px-10">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-12">
        
        {/* Mobile Toggle & Welcome Name */}
        <div className="flex items-center gap-6">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block">
             <h2 className="text-lg font-headings font-black text-primary tracking-tight">
               {greeting}, <span className="text-secondary">{user?.full_name?.split(' ')[0] || 'User'}</span>
             </h2>
          </div>
        </div>

        {/* Professional Minimal Search Bar */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className={`h-4 w-4 transition-colors duration-300 ${isSearching ? "text-secondary animate-pulse" : "text-gray-300 group-focus-within:text-primary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name, field or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full pl-11 pr-14 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-semibold text-primary placeholder-gray-400 focus:bg-white focus:border-secondary/20 focus:ring-4 focus:ring-secondary/5 transition-all outline-none"
            />
            <div className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-bold text-gray-300 bg-white border border-gray-100 rounded-lg"> / </kbd>
            </div>
          </div>

          {/* Search Results Dropdown - Premium Minimal */}
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl py-4 z-[60] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-6 pb-2 mb-2 border-b border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alumni Directory</p>
              </div>
              <div className="max-h-[350px] overflow-y-auto px-2 scrollbar-hide">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Link
                      key={result.id}
                      to={`/directory?search=${result.full_name}`} // In a real app we'd go to /profile/:id
                      onClick={() => setShowResults(false)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-black text-xs group-hover:bg-secondary group-hover:text-white transition-colors">
                        {result.full_name?.[0].toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-primary truncate">{result.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">
                          {result.field} • Batch of {result.batch_year || result.batch}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : !isSearching ? (
                  <div className="py-8 text-center">
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No matches found</p>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Searching...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl transition-all relative group ${showNotifications ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "text-gray-400 hover:bg-gray-50 hover:text-primary"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className={`absolute top-0 right-0 w-5 h-5 border-2 border-white text-[9px] font-black flex items-center justify-center rounded-full transition-colors ${showNotifications ? "bg-white text-secondary" : "bg-red-500 text-white"}`}>
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl py-4 z-[70] border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 pb-2 border-b border-gray-50 flex justify-between items-center mb-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inbox</h3>
                  <button onClick={handleMarkAllRead} className="text-[10px] font-black text-secondary hover:underline uppercase tracking-widest">Clear</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto px-2 scrollbar-hide">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-4 rounded-xl transition-all cursor-pointer mb-1 border ${notif.is_read ? "border-transparent opacity-40 hover:opacity-100 hover:bg-gray-50" : "border-secondary/5 bg-secondary/5 hover:bg-secondary/10"}`}
                      >
                        <p className="text-xs font-bold text-primary mb-0.5">{notif.title}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No new updates</p>
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
