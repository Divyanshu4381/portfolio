"use client";

import React from "react";
import {
  Menu,
  PanelLeft,
  PanelLeftClose,
  Search,
  ExternalLink,
  RefreshCw,
  Home,
  ChevronRight,
  ShieldCheck,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { AdminTab } from "./AdminSidebar";

interface AdminHeaderProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setMobileOpen: (open: boolean) => void;
  maintenanceEnabled: boolean;
  adminEmail: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
}

export default function AdminHeader({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  setMobileOpen,
  maintenanceEnabled,
  adminEmail,
  searchQuery,
  setSearchQuery,
  onRefreshAll,
  isRefreshing,
}: AdminHeaderProps) {
  const tabTitles: Record<AdminTab, { title: string; category: string }> = {
    overview: { title: "Dashboard Overview", category: "Core Workspace" },
    media: { title: "Media Library", category: "Content & Assets" },
    messages: { title: "Client Inquiries", category: "Communications" },
    maintenance: { title: "Maintenance Mode", category: "System & Config" },
  };

  const currentTabInfo = tabTitles[activeTab] || {
    title: "Dashboard",
    category: "Admin",
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#0a0e17]/80 backdrop-blur-xl sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Toggle, Desktop Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar toggle icon */}
        <button
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="hidden md:flex p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          title={sidebarCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4 text-zinc-300" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-zinc-300" />
          )}
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-400 min-w-0">
          <button
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer text-zinc-400 font-medium shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
          <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
          <span className="text-zinc-500 hidden lg:inline truncate">
            {currentTabInfo.category}
          </span>
          <ChevronRight className="w-3 h-3 text-zinc-600 hidden lg:inline shrink-0" />
          <span className="font-semibold text-white truncate">
            {currentTabInfo.title}
          </span>
        </nav>
      </div>

      {/* Center: Global Filter / Quick Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${currentTabInfo.title.toLowerCase()}...`}
            className="w-full bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl pl-9 pr-8 py-1.5 text-xs focus:outline-none transition-all placeholder:text-zinc-500"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 hidden xl:inline">
              Filter
            </span>
          )}
        </div>
      </div>

      {/* Right: Status Pill, Live Site, Refresh Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live / Maintenance Status Pill */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            maintenanceEnabled
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          }`}
          title={
            maintenanceEnabled
              ? "Maintenance mode is ON. Visitors see the maintenance screen."
              : "Portfolio is LIVE to all visitors."
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              maintenanceEnabled ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <span className="text-[11px] font-mono">
            {maintenanceEnabled ? "Maintenance ON" : "Portfolio Live"}
          </span>
        </div>

        {/* Refresh Data Button */}
        <button
          onClick={onRefreshAll}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs transition-all cursor-pointer disabled:opacity-50"
          title="Refresh current data"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-zinc-400 ${
              isRefreshing ? "animate-spin text-green-400" : ""
            }`}
          />
          <span className="hidden lg:inline text-xs">Sync</span>
        </button>

        {/* Live Site Link */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
          title="Open live website in a new tab"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </a>
      </div>
    </header>
  );
}
