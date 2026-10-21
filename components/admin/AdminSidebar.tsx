"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Wrench,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  ShieldCheck,
  LogOut,
  FolderOpen,
  Sparkles,
  X,
  Database,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type AdminTab = "overview" | "media" | "maintenance" | "messages" | "leads";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  mediaCount: number;
  unreadMessagesCount: number;
  maintenanceEnabled: boolean;
  adminEmail: string;
  onLogout: () => void;
  leadsCount?: number;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileOpen,
  setMobileOpen,
  mediaCount,
  unreadMessagesCount,
  maintenanceEnabled,
  adminEmail,
  onLogout,
  leadsCount = 0,
}: AdminSidebarProps) {
  // Collapsible navigation groups state
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    main: false,
    content: false,
    system: false,
  });

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const navItems = [
    {
      group: "main",
      groupTitle: "Core Workspace",
      items: [
        {
          id: "overview" as AdminTab,
          label: "Dashboard",
          icon: LayoutDashboard,
          badge: null,
          description: "System stats & quick actions",
        },
        {
          id: "leads" as AdminTab,
          label: "LeadVault",
          icon: ShieldCheck,
          badge: leadsCount > 0 ? `${leadsCount}` : "New",
          badgeColor: "bg-green-500/10 text-green-400 border-green-500/30 font-semibold",
          description: "Extract & secure business leads",
        },
      ],
    },
    {
      group: "content",
      groupTitle: "Content & Assets",
      items: [
        {
          id: "media" as AdminTab,
          label: "Media Library",
          icon: ImageIcon,
          badge: mediaCount > 0 ? `${mediaCount}` : null,
          badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
          description: "Upload & manage image URLs",
        },
        {
          id: "messages" as AdminTab,
          label: "Client Inquiries",
          icon: MessageSquare,
          badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} new` : null,
          badgeColor:
            unreadMessagesCount > 0
              ? "bg-red-500/20 text-red-400 border-red-500/30 font-semibold animate-pulse"
              : "bg-zinc-800 text-zinc-400 border-zinc-700",
          description: "Visitor contact form messages",
        },
      ],
    },
    {
      group: "system",
      groupTitle: "System & Config",
      items: [
        {
          id: "maintenance" as AdminTab,
          label: "Maintenance Mode",
          icon: Wrench,
          badge: maintenanceEnabled ? "ON" : "LIVE",
          badgeColor: maintenanceEnabled
            ? "bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold"
            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          description: "Public access lock & headline",
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0e17] border-r border-zinc-800/80 text-zinc-300 select-none">
      {/* Sidebar Header / Brand */}
      <div className="h-16 px-3.5 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-base shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.25)]">
            D
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white truncate">
                  DevStudio OS
                </span>
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium truncate">
                Admin Control Center
              </span>
            </div>
          )}
        </div>

        {/* Collapse button on desktop, close button on mobile */}
        <div className="flex items-center">
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Links (Independently Scrollable) */}
      <TooltipProvider delayDuration={150}>
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {navItems.map((group) => {
            const isGroupCollapsed = collapsedGroups[group.group] && !sidebarCollapsed;

            return (
              <div key={group.group} className="space-y-1">
                {/* Group Header */}
                {!sidebarCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors font-semibold"
                  >
                    <span>{group.groupTitle}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        isGroupCollapsed ? "-rotate-90 text-zinc-400" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <div className="w-full h-px bg-zinc-800/80 my-2" />
                )}

                {/* Group Items */}
                {!isGroupCollapsed && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = activeTab === item.id;
                      const Icon = item.icon;

                      const itemButton = (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full group flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                            isActive
                              ? "bg-zinc-800/90 text-white font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-zinc-700/80"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                        >
                          {/* Active state subtle left indicator bar */}
                          {isActive && (
                            <span className="absolute left-0 top-2 bottom-2 w-1 bg-green-500 rounded-r-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          )}

                          <div
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? "bg-green-500/10 text-green-400"
                                : "text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-800"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                          </div>

                          {!sidebarCollapsed && (
                            <div className="flex-1 flex items-center justify-between overflow-hidden">
                              <span className="truncate text-left">{item.label}</span>
                              {item.badge && (
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                    item.badgeColor ||
                                    "bg-zinc-800 text-zinc-300 border-zinc-700"
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );

                      if (sidebarCollapsed) {
                        return (
                          <Tooltip key={item.id}>
                            <TooltipTrigger asChild>{itemButton}</TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="bg-zinc-900 text-zinc-200 border-zinc-700 text-xs py-1.5 px-3 z-50 flex items-center gap-2"
                            >
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                                  {item.badge}
                                </span>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      return itemButton;
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick External Links */}
          <div className="space-y-1 pt-2 border-t border-zinc-800/80">
            {!sidebarCollapsed && (
              <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                Live Portfolio
              </span>
            )}

            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center p-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-zinc-900 text-zinc-200 border-zinc-700 text-xs py-1.5 px-3 z-50"
                >
                  View Live Site (opens new tab)
                </TooltipContent>
              </Tooltip>
            ) : (
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors border border-transparent"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-800">
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="text-zinc-300">Live Website</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-300">
                  Preview ↗
                </span>
              </a>
            )}
          </div>
        </div>
      </TooltipProvider>

      {/* Sidebar Footer / User Profile & Logout */}
      <div className="p-2.5 border-t border-zinc-800/80 bg-[#070a12]/80 shrink-0">
        {!sidebarCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 text-xs font-bold">
                  {adminEmail ? adminEmail[0].toUpperCase() : "A"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 ring-2 ring-[#070a12]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {adminEmail || "Admin User"}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-green-400" />
                  Authenticated
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Logout from admin session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-zinc-900 text-red-300 border-zinc-700 text-xs py-1.5 px-3 z-50"
              >
                Logout ({adminEmail})
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out z-30 h-screen sticky top-0 ${
          sidebarCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Responsive Navigation) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
