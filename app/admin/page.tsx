"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Wrench,
  MessageSquare,
  LogOut,
  ExternalLink,
  Upload,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  Clock,
  Eye,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { playSuccessChime, playErrorSound } from "@/lib/effects";

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

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "media" | "maintenance" | "messages"
  >("overview");
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Data states
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [messagesList, setMessagesList] = useState<MessageItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceConfig>({
    enabled: false,
    title: "Portfolio Under Maintenance",
    message:
      "I am currently updating my portfolio with exciting new features and projects. Please check back soon!",
  });

  // Action states
  const [uploading, setUploading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check auth & load data
  useEffect(() => {
    async function initDashboard() {
      try {
        const meRes = await fetch("/api/admin/me");
        if (!meRes.ok) {
          router.replace("/admin/login");
          return;
        }
        const meData = await meRes.json();
        setAdminEmail(meData.email);

        await Promise.all([
          loadMaintenance(),
          loadMedia(),
          loadMessages(),
        ]);
      } catch (err) {
        console.error("Dashboard init error:", err);
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router]);

  async function loadMaintenance() {
    try {
      const res = await fetch("/api/admin/maintenance");
      if (res.ok) {
        const data = await res.json();
        setMaintenance(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMedia() {
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.media || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMessages() {
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        setMessagesList(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Handle Logout
  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      playSuccessChime();
      toast.success("Logged out successfully");
      router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  }

  // Handle Toggle Maintenance Mode
  async function handleToggleMaintenance(nextEnabled: boolean) {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: nextEnabled,
          title: maintenance.title,
          message: maintenance.message,
        }),
      });

      if (res.ok) {
        setMaintenance((prev) => ({ ...prev, enabled: nextEnabled }));
        playSuccessChime();
        toast.success(
          nextEnabled
            ? "Maintenance Mode ACTIVATED: Public visitors will now see the maintenance screen."
            : "Maintenance Mode DEACTIVATED: Portfolio is now LIVE to everyone."
        );
      } else {
        playErrorSound();
        toast.error("Failed to update maintenance state");
      }
    } catch {
      playErrorSound();
      toast.error("Network error while updating maintenance mode");
    } finally {
      setSavingSettings(false);
    }
  }

  // Handle Save Maintenance Form
  async function handleSaveMaintenanceForm(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(maintenance),
      });

      if (res.ok) {
        playSuccessChime();
        toast.success("Maintenance settings saved successfully!");
      } else {
        playErrorSound();
        toast.error("Failed to save maintenance settings");
      }
    } catch {
      playErrorSound();
      toast.error("Network error");
    } finally {
      setSavingSettings(false);
    }
  }

  // Handle File Upload
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setMediaList((prev) => [data.media, ...prev]);
          successCount++;
        } else {
          const errData = await res.json();
          toast.error(`Failed to upload ${file.name}`, {
            description: errData.error,
          });
        }
      } catch {
        toast.error(`Upload error for ${file.name}`);
      }
    }

    if (successCount > 0) {
      playSuccessChime();
      toast.success(`Successfully uploaded ${successCount} image(s)!`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Handle Copy Media Link
  function handleCopyMediaUrl(url: string, id: string) {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success("Direct Image URL copied!", {
      description: fullUrl,
    });
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }

  // Handle Delete Media
  async function handleDeleteMedia(id: string) {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMediaList((prev) => prev.filter((item) => item.id !== id));
        toast.success("Image deleted successfully");
      } else {
        toast.error("Failed to delete image");
      }
    } catch {
      toast.error("Error deleting image");
    }
  }

  // Handle Toggle Read Message
  async function handleToggleRead(id: string, currentRead: boolean) {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: !currentRead }),
      });

      if (res.ok) {
        setMessagesList((prev) =>
          prev.map((m) => (m.id === id ? { ...m, read: !currentRead } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Handle Delete Message
  async function handleDeleteMessage(id: string) {
    if (!confirm("Delete this inquiry?")) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessagesList((prev) => prev.filter((m) => m.id !== id));
        toast.success("Message deleted");
      }
    } catch {
      toast.error("Could not delete message");
    }
  }

  // Helper format bytes
  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070908] text-white flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
          Loading Command Center...
        </p>
      </div>
    );
  }

  const unreadMessagesCount = messagesList.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-[#070908] text-white flex flex-col font-sans selection:bg-green-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-sm shadow-[0_0_12px_rgba(34,197,94,0.3)]">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-sm text-white">
                Portfolio Dashboard
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block truncate max-w-[200px]">
              {adminEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Maintenance status indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              maintenance.enabled
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                maintenance.enabled ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span>{maintenance.enabled ? "Maintenance ON" : "Portfolio Live"}</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-colors"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-200 border border-red-900/40 text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6 border-b border-zinc-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === "overview"
                ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === "media"
                ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media Manager</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "media" ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {mediaList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("maintenance")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === "maintenance"
                ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Maintenance Mode</span>
            {maintenance.enabled && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === "messages"
                ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Inquiries</span>
            {unreadMessagesCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Maintenance Toggle Card (Hero) */}
            <div
              className={`rounded-2xl p-6 sm:p-8 border transition-all ${
                maintenance.enabled
                  ? "bg-gradient-to-br from-amber-950/40 to-zinc-950 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                  : "bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                        maintenance.enabled
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {maintenance.enabled ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>MAINTENANCE MODE IS ON</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PORTFOLIO IS LIVE</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                    {maintenance.enabled
                      ? "Public visitors cannot see your portfolio"
                      : "Your portfolio is visible to all visitors"}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                    {maintenance.enabled
                      ? "When enabled, visitors are greeted with the dark luxury maintenance screen. Only you (the logged-in admin) can browse and preview the full portfolio."
                      : "Turn on Maintenance Mode whenever you want to update your portfolio, test changes, or restrict public access."}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    disabled={savingSettings}
                    onClick={() => handleToggleMaintenance(!maintenance.enabled)}
                    className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                      maintenance.enabled ? "bg-amber-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-black shadow-lg ring-0 transition duration-300 ease-in-out ${
                        maintenance.enabled ? "translate-x-8 bg-black" : "translate-x-0 bg-white"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold font-mono">
                    {maintenance.enabled ? "ACTIVE" : "OFF"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Uploaded Media</p>
                  <p className="text-2xl font-bold text-white mt-1">{mediaList.length}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Saved in MongoDB</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Client Inquiries</p>
                  <p className="text-2xl font-bold text-white mt-1">{messagesList.length}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">
                    {unreadMessagesCount} unread message(s)
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Security</p>
                  <p className="text-lg font-bold text-white mt-1 truncate max-w-[170px]">
                    OTP Verified
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Nodemailer Active</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Quick Management</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab("media")}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Upload Images</p>
                    <p className="text-[11px] text-zinc-400">Add projects / certificates</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("messages")}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">View Inquiries</p>
                    <p className="text-[11px] text-zinc-400">Read messages from clients</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("maintenance")}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Maintenance Text</p>
                    <p className="text-[11px] text-zinc-400">Customize visitor screen</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEDIA MANAGER */}
        {activeTab === "media" && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-zinc-700 hover:border-green-400 bg-zinc-950/60 hover:bg-zinc-900/50 rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <div className="mx-auto w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-3 group-hover:scale-110 transition-transform">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-white">
                {uploading ? "Uploading image to MongoDB..." : "Click or drag & drop images here"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Supports PNG, JPG, WEBP, SVG & GIF up to 8MB. Generates a permanent URL for your portfolio.
              </p>
            </div>

            {/* Gallery Grid Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Media Library ({mediaList.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Click &ldquo;Copy URL&rdquo; to use any image in projects, hero, or certificates.
                </p>
              </div>

              <button
                onClick={loadMedia}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Grid */}
            {mediaList.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No media uploaded yet</p>
                <p className="text-xs mt-1">Upload your first image above to get a direct URL.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden group hover:border-zinc-700 transition-all flex flex-col justify-between"
                  >
                    {/* Image Preview Container */}
                    <div className="relative aspect-video bg-zinc-900 overflow-hidden flex items-center justify-center">
                      <Image
                        src={item.url}
                        alt={item.filename}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-zinc-900/90 text-white hover:text-green-400"
                          title="Open full size"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-3.5">
                      <p
                        className="text-xs font-semibold text-zinc-200 truncate mb-1"
                        title={item.filename}
                      >
                        {item.filename}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-3 font-mono">
                        <span>{formatBytes(item.size)}</span>
                        <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyMediaUrl(item.url, item.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-green-400 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteMedia(item.id)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MAINTENANCE SETTINGS */}
        {activeTab === "maintenance" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white mb-2">Maintenance Mode Configuration</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">
                When active, all public pages redirect to the maintenance screen. Customize the headline and announcement message below.
              </p>

              <form onSubmit={handleSaveMaintenanceForm} className="space-y-5">
                {/* Switch item */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div>
                    <p className="text-sm font-semibold text-white">Enable Maintenance Mode</p>
                    <p className="text-xs text-zinc-400">Toggle public visibility of the portfolio</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setMaintenance((prev) => ({ ...prev, enabled: !prev.enabled }))
                    }
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      maintenance.enabled ? "bg-amber-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                        maintenance.enabled ? "translate-x-7" : "translate-x-0 bg-white"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Screen Headline
                  </label>
                  <input
                    type="text"
                    value={maintenance.title}
                    onChange={(e) =>
                      setMaintenance((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Announcement Message to Visitors
                  </label>
                  <textarea
                    rows={4}
                    value={maintenance.message}
                    onChange={(e) =>
                      setMaintenance((prev) => ({ ...prev, message: e.target.value }))
                    }
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-zinc-500">
                    {maintenance.updatedAt &&
                      `Last modified: ${new Date(maintenance.updatedAt).toLocaleString()}`}
                  </span>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    {savingSettings ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: CLIENT INQUIRIES / MESSAGES */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Contact Form Inquiries ({messagesList.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Messages submitted by visitors through your contact form are automatically captured here.
                </p>
              </div>

              <button
                onClick={loadMessages}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {messagesList.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No contact messages received yet</p>
                <p className="text-xs mt-1">
                  When someone submits your contact form, their details will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messagesList.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      m.read
                        ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-400"
                        : "bg-zinc-900/90 border-green-500/30 text-white shadow-[0_0_15px_rgba(34,197,94,0.08)]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm sm:text-base text-white">
                          {m.name}
                        </span>
                        {!m.read && (
                          <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold">
                            NEW
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mb-3">
                      <a
                        href={`mailto:${m.email}`}
                        className="inline-flex items-center gap-1.5 hover:text-green-400 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-green-400" />
                        <span>{m.email}</span>
                      </a>
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="inline-flex items-center gap-1.5 hover:text-green-400 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-green-400" />
                          <span>{m.phone}</span>
                        </a>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 mb-4 whitespace-pre-wrap leading-relaxed">
                      {m.message}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                      <button
                        onClick={() => handleToggleRead(m.id, m.read)}
                        className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {m.read ? "Mark as Unread" : "Mark as Read"}
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${m.email}?subject=Regarding your message on Divyanshu Portfolio`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                        </a>

                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
