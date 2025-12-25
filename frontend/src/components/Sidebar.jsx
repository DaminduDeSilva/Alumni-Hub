import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, onClose, user, isAuthenticated }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const SidebarLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => {
        if (window.innerWidth < 1024) onClose();
      }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        isActive(to)
          ? "bg-primary/5 text-primary shadow-sm"
          : "text-slate-500 hover:bg-slate-100 hover:text-primary"
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive(to) ? "bg-primary scale-100" : "bg-transparent scale-0 group-hover:scale-100 group-hover:bg-slate-300"}`} />
      <span className="font-bold tracking-wide text-xs uppercase">{children}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel - Light Slate Theme */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-slate-50 border-r border-slate-200 z-[70] flex flex-col transition-all duration-500 ease-in-out transform shadow-sm ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Logo Section */}
        <div className="p-8 pb-4">
          <Link to="/" onClick={() => window.innerWidth < 1024 && onClose()} className="flex items-center space-x-4 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-headings font-black text-primary leading-none">ALUMNI</h1>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">Hub Platform</span>
            </div>
          </Link>
          
          <div className="h-px w-full bg-slate-200" />
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 scrollbar-hide">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Navigation</p>
          
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
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Management</p>
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

        {/* Footer info (minimal) */}
        <div className="p-8 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                v2.1.0 • Built with Passion
            </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
