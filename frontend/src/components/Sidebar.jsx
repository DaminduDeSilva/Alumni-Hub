import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Sidebar = ({ isOpen, onClose, user, isAuthenticated }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Prevent scroll only on mobile when sidebar is open as overlay
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        document.body.style.overflow = "unset";
      } else if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const SidebarLink = ({ to, children, icon }) => (
    <Link
      to={to}
      onClick={() => {
        if (window.innerWidth < 1024) onClose();
      }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        isActive(to)
          ? "bg-secondary text-white shadow-lg shadow-secondary/20 translate-x-1"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive(to) ? "bg-white scale-100" : "bg-transparent scale-0 group-hover:scale-100 group-hover:bg-gray-500"}`} />
      <span className="font-semibold tracking-wide text-sm uppercase">{children}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-primary border-r border-white/5 z-[70] flex flex-col transition-all duration-500 ease-in-out transform shadow-2xl ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Logo Section */}
        <div className="p-8 pb-4">
          <Link to="/" onClick={() => window.innerWidth < 1024 && onClose()} className="flex items-center space-x-4 mb-8">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-headings font-black text-white leading-none">ALUMNI</h1>
              <span className="text-secondary text-[10px] uppercase font-bold tracking-[0.2em]">Hub Platform</span>
            </div>
          </Link>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 scrollbar-hide">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Main Menu</p>
          
          <SidebarLink to="/">Overview</SidebarLink>

          {(user?.role === "VERIFIED_USER" ||
            user?.role === "SUPER_ADMIN" ||
            user?.role === "FIELD_ADMIN") && (
            <SidebarLink to="/events">Events</SidebarLink>
          )}

          {user?.role === "VERIFIED_USER" && (
            <>
              <SidebarLink to="/my-profile">Profile</SidebarLink>
              <SidebarLink to="/my-submissions">Submissions</SidebarLink>
            </>
          )}

          {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Management</p>
              </div>
              
              <SidebarLink to="/directory">Directory</SidebarLink>

              {user?.role === "FIELD_ADMIN" && (
                <SidebarLink to="/my-profile">Profile</SidebarLink>
              )}

              <SidebarLink to="/admin">
                {user?.role === "FIELD_ADMIN" ? "Field Manage" : "Admin Panel"}
              </SidebarLink>

              <SidebarLink to="/reports">Analytics</SidebarLink>

              {user?.role === "SUPER_ADMIN" && (
                <SidebarLink to="/admin/field-admins">Admins</SidebarLink>
              )}
            </>
          )}
        </div>

        {/* User Card (Bottom) */}
        <div className="p-6 bg-black/40 border-t border-white/5">
          <div className="flex items-center mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center text-white text-lg font-black shadow-lg">
                {(user?.full_name || user?.email)?.[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-primary rounded-full" />
            </div>
            <div className="ml-4 overflow-hidden">
              <p className="text-white font-bold text-sm truncate">
                {user?.full_name || user?.email}
              </p>
              <p className="text-secondary text-[10px] font-black uppercase tracking-wider">
                {user?.role === "FIELD_ADMIN" && user?.assigned_field
                  ? `${user.assigned_field}`
                  : user?.role?.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            {user?.role === "UNVERIFIED" && (
              <Link
                to="/submit"
                onClick={() => window.innerWidth < 1024 && onClose()}
                className="w-full text-center bg-secondary hover:bg-secondary-dark text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-secondary/20 active:scale-95"
              >
                Get Verified
              </Link>
            )}
            
            <div className="w-full">
              <LogoutButton fullWidth />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
