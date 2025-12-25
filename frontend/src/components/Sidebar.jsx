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
      
      {/* Sidebar Panel - Starts below Header */}
      <aside className={`fixed lg:sticky top-20 left-0 h-[calc(100vh-80px)] w-[280px] bg-slate-50 border-r border-slate-200 z-[70] flex flex-col transition-all duration-500 ease-in-out transform lg:transform-none shadow-sm ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-1 scrollbar-hide">
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

      </aside>
    </>
  );
};

export default Sidebar;
