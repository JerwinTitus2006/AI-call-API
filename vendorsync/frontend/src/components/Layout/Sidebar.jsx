import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  FileText,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/meetings", icon: Video, label: "Meetings" },
  { to: "/reports", icon: FileText, label: "Reports" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="w-64 h-screen bg-bg-dark border-r border-bg-border flex flex-col fixed left-0 top-0 z-10">
      {/* Logo */}
      <div className="p-6 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <Flame size={24} className="text-fire-core" fill="rgba(255,34,0,0.3)" />
          </div>
          <span className="font-display text-2xl tracking-wide glow-text">
            VendorSync
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-bg-border">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "rgba(255,34,0,0.2)", border: "1px solid rgba(255,34,0,0.4)", color: "#FF2200" }}
          >
            {user?.avatar_initials || "??"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-dim capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full hover:text-fire-core hover:bg-red-950/20"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
