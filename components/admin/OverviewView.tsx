"use client";

import React from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  MessageSquare,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  Mail,
  Copy,
  Check,
  HardDrive,
  Activity,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { AdminTab } from "./AdminSidebar";

interface MediaItem {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string;
}

interface MessageItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface OverviewViewProps {
  mediaList: MediaItem[];
  messagesList: MessageItem[];
  maintenance: MaintenanceConfig;
  savingSettings: boolean;
  onToggleMaintenance: (next: boolean) => void;
  onNavigateTab: (tab: AdminTab) => void;
  onCopyMediaUrl: (url: string, id: string) => void;
  copiedId: string | null;
  adminEmail: string;
  formatBytes: (bytes: number) => string;
  leadsCount?: number;
}

export default function OverviewView({
  mediaList,
  messagesList,
  maintenance,
  savingSettings,
  onToggleMaintenance,
  onNavigateTab,
  onCopyMediaUrl,
  copiedId,
  adminEmail,
  formatBytes,
  leadsCount = 0,
}: OverviewViewProps) {
  const unreadMessagesCount = messagesList.filter((m) => !m.read).length;
  const totalMediaBytes = mediaList.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const recentMessages = messagesList.slice(0, 3);
  const recentMedia = mediaList.slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Workspace Service Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Dashboard Overview</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              Live Monitor
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time status of your portfolio assets, visitor inquiries, and site availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab("leads")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30 transition-colors cursor-pointer shadow-[0_0_12px_rgba(34,197,94,0.15)]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>LeadVault</span>
            {leadsCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-green-500 text-black font-bold">
                {leadsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigateTab("media")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Upload Media</span>
          </button>
          <button
            onClick={() => onNavigateTab("messages")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
            <span>Inquiries</span>
          </button>
        </div>
      </div>

      {/* Hero: Maintenance Mode Quick Status Switch Card */}
      <div
        className={`rounded-2xl p-5 sm:p-6 border transition-all ${
          maintenance.enabled
            ? "bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.12)]"
            : "bg-gradient-to-r from-emerald-950/20 via-zinc-900 to-zinc-950 border-emerald-500/30 shadow-[0_0_30px_rgba(34,197,94,0.08)]"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  maintenance.enabled
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {maintenance.enabled ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>MAINTENANCE MODE IS ON</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PORTFOLIO IS LIVE TO PUBLIC</span>
                  </>
                )}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white">
              {maintenance.enabled
                ? "Public visitors see the maintenance screen"
                : "Your portfolio is fully accessible worldwide"}
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {maintenance.enabled
                ? "Visitors are currently redirected to the dark luxury maintenance notice. Only you (the authenticated admin) can view the active portfolio."
                : "All visitor pages, projects, and contact forms are active and running smoothly. Turn on maintenance anytime to update projects safely."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-black/40 p-2.5 rounded-2xl border border-zinc-800/80">
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Mode State
              </p>
              <p
                className={`text-xs font-bold font-mono ${
                  maintenance.enabled ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {maintenance.enabled ? "ACTIVE (HIDDEN)" : "ONLINE (LIVE)"}
              </p>
            </div>

            <button
              disabled={savingSettings}
              onClick={() => onToggleMaintenance(!maintenance.enabled)}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                maintenance.enabled ? "bg-amber-500" : "bg-zinc-700"
              }`}
              title="Click to toggle portfolio maintenance status"
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                  maintenance.enabled ? "translate-x-8 bg-black" : "translate-x-0 bg-white"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Media Assets */}
        <div className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-zinc-400">Media Assets</span>
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{mediaList.length}</p>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 font-mono">
            <span>{formatBytes(totalMediaBytes)}</span>
            <span className="text-emerald-400">MongoDB GridFS</span>
          </div>
        </div>

        {/* KPI 2: Client Inquiries */}
        <div className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-zinc-400">Inquiries Received</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{messagesList.length}</p>
          <div className="flex items-center justify-between text-[11px] mt-2 font-mono">
            <span
              className={unreadMessagesCount > 0 ? "text-red-400 font-semibold" : "text-zinc-500"}
            >
              {unreadMessagesCount} unread message(s)
            </span>
            <span className="text-zinc-500">Contact Form</span>
          </div>
        </div>

        {/* KPI 3: Site Availability */}
        <div className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-zinc-400">Site Status</span>
            <div
              className={`p-2 rounded-xl border ${
                maintenance.enabled
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-white truncate mt-0.5">
            {maintenance.enabled ? "Maintenance" : "Live & Public"}
          </p>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono truncate">
            {maintenance.updatedAt
              ? `Sync: ${new Date(maintenance.updatedAt).toLocaleDateString()}`
              : "Status Active"}
          </div>
        </div>

        {/* KPI 4: Security & Session */}
        <div className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-zinc-400">Security</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-white truncate mt-0.5">OTP Verified</p>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono truncate">
            Nodemailer 2FA Active
          </div>
        </div>
      </div>

      {/* Quick Service Launchpad */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-3">
          Service Launchpad
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab("leads")}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white group-hover:text-green-400 transition-colors">
                  LeadVault
                </p>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {leadsCount > 0 ? `${leadsCount} leads stored & ready` : "Extract & manage leads"}
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab("media")}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                Upload New Image
              </p>
              <p className="text-[11px] text-zinc-400 truncate">Add portfolio/certificate assets</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab("messages")}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                Client Inquiries
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {unreadMessagesCount > 0
                  ? `${unreadMessagesCount} unread message(s) awaiting`
                  : "Read visitor contact submissions"}
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab("maintenance")}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                Maintenance Settings
              </p>
              <p className="text-[11px] text-zinc-400 truncate">Customize visitor announcement</p>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Recent Inquiries & Recent Media Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries List */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                  Recent Inquiries
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab("messages")}
                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentMessages.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No inquiries recorded yet. When a visitor contacts you, messages appear here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      msg.read
                        ? "bg-zinc-900/40 border-zinc-800/60 text-zinc-400"
                        : "bg-zinc-900/90 border-green-500/30 text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        {msg.name}
                        {!msg.read && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            NEW
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-400 line-clamp-2 leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Media Assets */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-green-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                  Recent Media Uploads
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab("media")}
                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Browse library</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentMedia.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No media uploaded yet. Use the Media Library to upload your project assets.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {recentMedia.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col"
                  >
                    <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                      <Image
                        src={item.url}
                        alt={item.filename}
                        fill
                        sizes="160px"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        unoptimized
                      />
                    </div>
                    <div className="p-2 flex flex-col justify-between flex-1">
                      <p className="text-[11px] font-medium text-zinc-300 truncate" title={item.filename}>
                        {item.filename}
                      </p>
                      <button
                        onClick={() => onCopyMediaUrl(item.url, item.id)}
                        className="mt-1.5 w-full py-1 px-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-400" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
