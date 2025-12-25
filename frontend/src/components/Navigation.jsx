import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import LogoutButton from "./LogoutButton";

// Custom debounce helper
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

  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

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

  const fetchSearchResults = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      try {
        const res = await api.get(`/batchmates?search=${query}`);
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

  const notificationCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-20 bg-primary border-b border-white/5 sticky top-0 z-[100] px-6">
      <div className="h-full flex items-center justify-between gap-8">
        
        {/* Left: Branding & Mobile Toggle */}
        <div className="flex items-center gap-6">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-2xl filter drop-shadow-lg">🎓</span>
            <div className="hidden sm:block">
              <h1 className="text-lg font-headings font-black text-white leading-none tracking-tight">ALUMNI HUB</h1>
              <p className="text-[9px] font-black text-secondary uppercase tracking-[0.3em]">Platform</p>
            </div>
          </Link>
        </div>

        {/* Center: Search Area */}
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`h-4 w-4 transition-colors duration-300 ${isSearching ? "text-secondary animate-pulse" : "text-white/30 group-focus-within:text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                className="w-full pl-11 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all outline-none"
            />
            <div className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[9px] font-bold text-white/20 bg-black/20 rounded-md"> / </kbd>
            </div>
          </div>

          {showResults && (
            <div className="absolute top-full left-0 mt-3 w-full bg-white rounded-2xl shadow-2xl py-4 z-50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="max-h-[350px] overflow-y-auto px-2 scrollbar-hide">
                    {searchResults.length > 0 ? (
                        searchResults.map((result) => (
                            <Link
                                key={result.id}
                                to={`/directory?search=${result.full_name}`}
                                onClick={() => setShowResults(false)}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-black text-[10px] group-hover:bg-secondary group-hover:text-white transition-colors">
                                    {result.full_name?.[0].toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[12px] font-bold text-primary truncate">{result.full_name}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight truncate">
                                        {result.field} • Batch of {result.batch_year || result.batch}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : !isSearching && (
                        <p className="py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No results found</p>
                    )}
                </div>
            </div>
          )}
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-6">
          {/* Notifications area */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-xl transition-all relative ${showNotifications ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl py-4 z-50 animate-in fade-in zoom-in-95">
                <div className="px-6 pb-2 border-b border-gray-50 flex justify-between items-center mb-2">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Updates</h3>
                    <button onClick={handleMarkAllRead} className="text-[10px] font-black text-secondary hover:underline">Clear</button>
                </div>
                <div className="max-h-[250px] overflow-y-auto px-2 scrollbar-hide">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div key={notif.id} className="p-3 rounded-lg hover:bg-gray-50 transition-all mb-1 border-l-4 border-secondary/20">
                                <p className="text-[11px] font-bold text-primary mb-0.5">{notif.title}</p>
                                <p className="text-[10px] text-gray-500 line-clamp-1">{notif.message}</p>
                            </div>
                        ))
                    ) : (
                        <p className="py-8 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">All caught up</p>
                    )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white leading-none mb-1">{user?.full_name}</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                {user?.role?.toLowerCase().replace("_", " ")}
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs font-black shadow-inner">
                {(user?.full_name || user?.email)?.[0].toUpperCase()}
            </div>

            <LogoutButton className="bg-white/5 text-white/60 border-white/10 hover:bg-red-500/20 hover:text-red-300" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
