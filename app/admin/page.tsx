"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { playSuccessChime, playErrorSound } from "@/lib/effects";

import AdminSidebar, { AdminTab } from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import OverviewView from "@/components/admin/OverviewView";
import MediaView from "@/components/admin/MediaView";
import MessagesView from "@/components/admin/MessagesView";
import MaintenanceConfigView from "@/components/admin/MaintenanceConfigView";
import LeadVaultView from "@/components/admin/LeadVaultView";

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

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine active tab from URL query param if present
  const tabParam = searchParams.get("tab") as AdminTab | null;
  const initialTab: AdminTab =
    tabParam && ["overview", "leads", "media", "messages", "maintenance"].includes(tabParam)
      ? tabParam
      : "overview";

  const [activeTab, setActiveTabState] = useState<AdminTab>(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Data states
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [messagesList, setMessagesList] = useState<MessageItem[]>([]);
  const [leadsCount, setLeadsCount] = useState<number>(0);
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

  // Sync activeTab with URL without full page reload
  const handleSelectTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    setSearchQuery(""); // Clear search when switching services
    router.replace(`/admin?tab=${tab}`, { scroll: false });
  };

  // Keep state in sync if user clicks browser back/forward buttons
  useEffect(() => {
    if (tabParam && ["overview", "leads", "media", "messages", "maintenance"].includes(tabParam)) {
      setActiveTabState(tabParam);
    }
  }, [tabParam]);

  // Check auth & load initial dashboard data
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
          loadLeadsCount(),
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
      console.error("Load maintenance error:", err);
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
      console.error("Load media error:", err);
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
      console.error("Load messages error:", err);
    }
  }

  async function loadLeadsCount() {
    try {
      const res = await fetch("/api/admin/leads?limit=1");
      if (res.ok) {
        const data = await res.json();
        setLeadsCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Load leads count error:", err);
    }
  }

  // Handle Refresh All Data
  async function handleRefreshAll() {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadMaintenance(),
        loadMedia(),
        loadMessages(),
        loadLeadsCount(),
      ]);
      playSuccessChime();
      toast.success("Dashboard data synchronized");
    } catch {
      toast.error("Failed to sync latest data");
    } finally {
      setIsRefreshing(false);
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
  }

  // Handle Copy Media Link
  function handleCopyMediaUrl(url: string, id: string) {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    playSuccessChime();
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
      } else {
        toast.error("Could not delete message");
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
        <div className="w-9 h-9 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
          Initializing SaaS Command Console...
        </p>
      </div>
    );
  }

  const unreadMessagesCount = messagesList.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen h-screen flex overflow-hidden bg-[#070a12] text-zinc-100 font-sans selection:bg-green-500 selection:text-black">
      {/* 1. Left Sidebar (Persistent on Desktop, Collapsible, Mobile Drawer) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        mediaCount={mediaList.length}
        unreadMessagesCount={unreadMessagesCount}
        leadsCount={leadsCount}
        maintenanceEnabled={maintenance.enabled}
        adminEmail={adminEmail}
        onLogout={handleLogout}
      />

      {/* 2. Main Software App Layout (Header + Scrollable Working Workspace) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <AdminHeader
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          setMobileOpen={setMobileOpen}
          maintenanceEnabled={maintenance.enabled}
          adminEmail={adminEmail}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefreshAll={handleRefreshAll}
          isRefreshing={isRefreshing}
        />

        {/* 3. Right Main Workspace — Service Working Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === "overview" && (
                <OverviewView
                  mediaList={mediaList}
                  messagesList={messagesList}
                  maintenance={maintenance}
                  savingSettings={savingSettings}
                  onToggleMaintenance={handleToggleMaintenance}
                  onNavigateTab={handleSelectTab}
                  onCopyMediaUrl={handleCopyMediaUrl}
                  copiedId={copiedId}
                  adminEmail={adminEmail}
                  formatBytes={formatBytes}
                  leadsCount={leadsCount}
                />
              )}

              {activeTab === "leads" && <LeadVaultView />}

              {activeTab === "media" && (
                <MediaView
                  mediaList={mediaList}
                  uploading={uploading}
                  copiedId={copiedId}
                  onFileUpload={handleFileUpload}
                  onCopyMediaUrl={handleCopyMediaUrl}
                  onDeleteMedia={handleDeleteMedia}
                  onRefresh={loadMedia}
                  formatBytes={formatBytes}
                  searchFilter={searchQuery}
                />
              )}

              {activeTab === "messages" && (
                <MessagesView
                  messagesList={messagesList}
                  onToggleRead={handleToggleRead}
                  onDeleteMessage={handleDeleteMessage}
                  onRefresh={loadMessages}
                  searchFilter={searchQuery}
                />
              )}

              {activeTab === "maintenance" && (
                <MaintenanceConfigView
                  maintenance={maintenance}
                  setMaintenance={setMaintenance}
                  savingSettings={savingSettings}
                  onSaveForm={handleSaveMaintenanceForm}
                  onToggleMaintenance={handleToggleMaintenance}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070908] text-white flex flex-col justify-center items-center">
          <div className="w-9 h-9 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
          <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
            Loading Admin Console...
          </p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
