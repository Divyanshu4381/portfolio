"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Upload,
  Database,
  FileSpreadsheet,
  FileText,
  Share2,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  ExternalLink,
  Lock,
  Globe,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Copy,
  Check,
  Building,
  Mail,
  Phone,
  User,
  Tag,
  ArrowUpDown,
  Download,
  X,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { playSuccessChime, playErrorSound } from "@/lib/effects";
import {
  ILead,
  ILeadBatch,
  ILeadShare,
  ILeadAnalytics,
  ILeadUpdateRequest,
  LeadStatus,
} from "@/lib/lead-engine/types";
import { CANONICAL_FIELDS } from "@/lib/lead-engine/columnMatcher";

export default function LeadVaultView() {
  const [activeSubTab, setActiveSubTab] = useState<
    "table" | "upload" | "batches" | "sharing" | "requests"
  >("table");

  // Analytics
  const [analytics, setAnalytics] = useState<ILeadAnalytics | null>(null);

  // Leads Table State
  const [leads, setLeads] = useState<ILead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Detail Drawer & Edit Modal
  const [inspectingLead, setInspectingLead] = useState<ILead | null>(null);
  const [editingLead, setEditingLead] = useState<ILead | null>(null);
  const [savingLead, setSavingLead] = useState(false);

  // Upload & Extraction Wizard State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<{
    batchId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    totalRows: number;
    headers: string[];
    suggestedMapping: Record<string, string>;
    sampleRows: Record<string, any>[];
    duplicateEstimate: number;
  } | null>(null);
  const [activeMapping, setActiveMapping] = useState<Record<string, string>>({});
  const [duplicateStrategy, setDuplicateStrategy] = useState<
    "skip" | "update" | "import_all"
  >("skip");
  const [confirmingImport, setConfirmingImport] = useState(false);

  // Batches State
  const [batches, setBatches] = useState<ILeadBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Sharing Management State
  const [shares, setShares] = useState<ILeadShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [isCreateShareOpen, setIsCreateShareOpen] = useState(false);
  const [newShareTitle, setNewShareTitle] = useState("");
  const [newShareDesc, setNewShareDesc] = useState("");
  const [newShareMode, setNewShareMode] = useState<"restricted" | "public">(
    "restricted"
  );
  const [newSharePassword, setNewSharePassword] = useState("");
  const [newShareExpiresAt, setNewShareExpiresAt] = useState("");
  const [newShareMaxViews, setNewShareMaxViews] = useState("");
  const [newShareAllowedFields, setNewShareAllowedFields] = useState<string[]>([
    "companyName",
    "contactPerson",
    "email",
    "phone",
    "website",
    "category",
    "city",
    "state",
  ]);
  const [creatingShare, setCreatingShare] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Collaborative Update Requests State
  const [requests, setRequests] = useState<ILeadUpdateRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestFilter, setRequestFilter] = useState<string>("pending");
  const [actioningRequestId, setActioningRequestId] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeSubTab === "table") {
      loadLeads();
    } else if (activeSubTab === "batches") {
      loadBatches();
    } else if (activeSubTab === "sharing") {
      loadShares();
    } else if (activeSubTab === "requests") {
      loadRequests();
    }
  }, [activeSubTab, page, limit, search, statusFilter, categoryFilter, sortBy, sortOrder, requestFilter]);

  async function loadAnalytics() {
    try {
      const res = await fetch("/api/admin/leads/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadLeads() {
    setLoadingLeads(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        sortBy,
        sortOrder,
      });
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setTotalLeads(data.pagination?.total || 0);
      }
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoadingLeads(false);
    }
  }

  async function loadBatches() {
    setLoadingBatches(true);
    try {
      const res = await fetch("/api/admin/leads/batches");
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch {
      toast.error("Failed to load import batches");
    } finally {
      setLoadingBatches(false);
    }
  }

  async function loadShares() {
    setLoadingShares(true);
    try {
      const res = await fetch("/api/admin/leads/shares");
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares || []);
      }
    } catch {
      toast.error("Failed to load share links");
    } finally {
      setLoadingShares(false);
    }
  }

  // Load Collaborative Update Requests
  async function loadRequests(statusToFetch = requestFilter) {
    setLoadingRequests(true);
    try {
      const res = await fetch(`/api/admin/leads/requests?status=${statusToFetch}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch {
      toast.error("Failed to load update requests");
    } finally {
      setLoadingRequests(false);
    }
  }

  // Handle Approve / Reject Request
  async function handleRequestAction(requestId: string, action: "approve" | "reject") {
    setActioningRequestId(requestId);
    try {
      const res = await fetch(`/api/admin/leads/requests/${requestId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === "approve") {
          playSuccessChime();
          toast.success("Update Accepted & Applied!", {
            description: "Lead status and collaborator call notes have been synced.",
          });
        } else {
          toast.success("Request Rejected");
        }
        loadRequests();
        loadAnalytics();
        loadLeads();
      } else {
        playErrorSound();
        toast.error(data.error || "Action failed");
      }
    } catch {
      playErrorSound();
      toast.error("Network error while processing request");
    } finally {
      setActioningRequestId(null);
    }
  }

  // Handle File Upload & Extraction
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/leads/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        playSuccessChime();
        toast.success(`Successfully parsed ${data.totalRows} record(s)!`);
        setExtractionResult(data);
        setActiveMapping(data.suggestedMapping || {});
      } else {
        playErrorSound();
        toast.error("Extraction error", { description: data.error });
      }
    } catch {
      playErrorSound();
      toast.error("Network error while uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Handle Confirm Import
  async function handleConfirmImport() {
    if (!extractionResult) return;
    setConfirmingImport(true);

    try {
      const res = await fetch("/api/admin/leads/import-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: extractionResult.batchId,
          columnMapping: activeMapping,
          duplicateStrategy,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        playSuccessChime();
        toast.success("Leads imported into LeadVault!", {
          description: `Inserted ${data.insertedCount}, Updated ${data.updatedCount}, Skipped ${data.skippedCount} duplicates.`,
        });
        setExtractionResult(null);
        setActiveSubTab("table");
        loadLeads();
        loadAnalytics();
      } else {
        playErrorSound();
        toast.error("Import failed", { description: data.error });
      }
    } catch {
      playErrorSound();
      toast.error("Network error while confirming import");
    } finally {
      setConfirmingImport(false);
    }
  }

  // Handle Bulk Status Change
  async function handleBulkStatusChange(newStatus: LeadStatus) {
    if (selectedLeadIds.length === 0) return;

    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          updates: { status: newStatus },
        }),
      });

      if (res.ok) {
        playSuccessChime();
        toast.success(`Updated ${selectedLeadIds.length} lead(s) to ${newStatus}`);
        setSelectedLeadIds([]);
        loadLeads();
        loadAnalytics();
      }
    } catch {
      toast.error("Failed to update status");
    }
  }

  // Handle Bulk Delete Leads
  async function handleBulkDelete() {
    if (selectedLeadIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} lead(s)?`))
      return;

    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: selectedLeadIds }),
      });

      if (res.ok) {
        playSuccessChime();
        toast.success(`Deleted ${selectedLeadIds.length} lead(s)`);
        setSelectedLeadIds([]);
        loadLeads();
        loadAnalytics();
      }
    } catch {
      toast.error("Failed to delete leads");
    }
  }

  // Handle Delete Single Lead
  async function handleDeleteSingleLead(leadId: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`/api/admin/leads?leadId=${leadId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Lead deleted successfully");
        if (inspectingLead?.leadId === leadId) setInspectingLead(null);
        loadLeads();
        loadAnalytics();
      }
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  // Handle Save Edited Lead
  async function handleSaveEditedLead(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLead) return;
    setSavingLead(true);

    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: editingLead.leadId,
          updates: editingLead,
        }),
      });

      if (res.ok) {
        playSuccessChime();
        toast.success("Lead details updated");
        setEditingLead(null);
        loadLeads();
      }
    } catch {
      toast.error("Failed to update lead");
    } finally {
      setSavingLead(false);
    }
  }

  // Handle Export CSV
  function handleExportCsv() {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    const headers = [
      "Lead ID",
      "Company",
      "Contact Person",
      "Email",
      "Phone",
      "Website",
      "Industry",
      "City",
      "State",
      "Country",
      "Status",
    ];

    const rows = leads.map((l) => [
      l.leadId,
      `"${(l.companyName || "").replace(/"/g, '""')}"`,
      `"${(l.contactPerson || "").replace(/"/g, '""')}"`,
      l.email || "",
      l.phone || "",
      l.website || "",
      `"${(l.category || "").replace(/"/g, '""')}"`,
      `"${(l.city || "").replace(/"/g, '""')}"`,
      `"${(l.state || "").replace(/"/g, '""')}"`,
      `"${(l.country || "").replace(/"/g, '""')}"`,
      l.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leadvault_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSuccessChime();
    toast.success("Exported leads to CSV");
  }

  // Handle Delete Batch
  async function handleDeleteBatch(batchId: string) {
    if (
      !confirm(
        "Delete this import batch and cascade-delete all leads imported by this file?"
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/leads/batches/${batchId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Batch and associated leads removed");
        loadBatches();
        loadLeads();
        loadAnalytics();
      }
    } catch {
      toast.error("Could not delete batch");
    }
  }

  // Handle Create Share Link
  async function handleCreateShareLink(e: React.FormEvent) {
    e.preventDefault();
    setCreatingShare(true);

    try {
      const res = await fetch("/api/admin/leads/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newShareTitle,
          description: newShareDesc,
          mode: newShareMode,
          password: newSharePassword || null,
          expiresAt: newShareExpiresAt || null,
          maxViews: newShareMaxViews ? parseInt(newShareMaxViews, 10) : null,
          allowedFields: newShareAllowedFields,
          leadIds: selectedLeadIds.length > 0 ? selectedLeadIds : [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        playSuccessChime();
        toast.success("Share link created successfully!");
        setIsCreateShareOpen(false);
        setNewShareTitle("");
        setNewShareDesc("");
        setNewSharePassword("");
        loadShares();
        loadAnalytics();
      } else {
        toast.error(data.error || "Failed to create share link");
      }
    } catch {
      toast.error("Network error while creating share link");
    } finally {
      setCreatingShare(false);
    }
  }

  // Handle Toggle Revoke Share
  async function handleToggleRevokeShare(shareId: string, currentRevoked: boolean) {
    try {
      const res = await fetch(`/api/admin/leads/shares/${shareId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRevoked: !currentRevoked }),
      });

      if (res.ok) {
        toast.success(
          !currentRevoked ? "Share link revoked" : "Share link re-activated"
        );
        loadShares();
        loadAnalytics();
      }
    } catch {
      toast.error("Failed to update share revocation");
    }
  }

  // Handle Copy Share URL
  function handleCopyShareUrl(token: string) {
    const fullUrl = `${window.location.origin}/shared/leads/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    playSuccessChime();
    toast.success("Encrypted share link copied!", { description: fullUrl });
    setTimeout(() => setCopiedToken(null), 2000);
  }

  const totalPages = Math.ceil(totalLeads / limit) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. Header & Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>LeadVault</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              Enterprise Extraction
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Automated document ingestion, lead deduplication, and zero-trust sharing.
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab("table")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "table"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-green-400" />
            <span>Leads Table</span>
          </button>

          <button
            onClick={() => setActiveSubTab("upload")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "upload"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Upload & Extract</span>
            {extractionResult && (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping inline-block" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("batches")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "batches"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Import History</span>
          </button>

          <button
            onClick={() => setActiveSubTab("sharing")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "sharing"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Share & Access</span>
          </button>

          <button
            onClick={() => setActiveSubTab("requests")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "requests"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Review Requests</span>
            {analytics && (analytics.pendingRequestsCount || 0) > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {analytics.pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Leads</span>
            <p className="text-xl font-bold text-white mt-0.5">{analytics.totalLeads}</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">This Month</span>
            <p className="text-xl font-bold text-green-400 mt-0.5">+{analytics.leadsThisMonth}</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Batches</span>
            <p className="text-xl font-bold text-white mt-0.5">{analytics.totalBatches}</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Duplicates</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{analytics.duplicatesDetected}</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Private Leads</span>
            <p className="text-xl font-bold text-zinc-300 mt-0.5">{analytics.privateListsCount}</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Restricted Shares</span>
            <p className="text-xl font-bold text-purple-400 mt-0.5">
              {analytics.activeRestrictedShares}
            </p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Public Lists</span>
            <p className="text-xl font-bold text-blue-400 mt-0.5">
              {analytics.publicPublishedShares}
            </p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Qualified</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              {analytics.statusBreakdown?.qualified || 0}
            </p>
          </div>
          <div
            onClick={() => setActiveSubTab("requests")}
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 cursor-pointer hover:border-amber-500/40 transition-colors"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
              Pending Updates
              {Boolean(analytics.pendingRequestsCount && analytics.pendingRequestsCount > 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              )}
            </span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">
              {analytics.pendingRequestsCount || 0}
            </p>
          </div>
        </div>
      )}

      {/* 3. Sub-Tab 1: Leads Data Table */}
      {activeSubTab === "table" && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search leads, email, city..."
                  className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl pl-9 pr-3.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-900/80 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="archived">Archived</option>
              </select>

              {/* Category Filter */}
              <input
                type="text"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter industry..."
                className="bg-zinc-900/80 border border-zinc-800 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none max-w-[130px]"
              />

              <button
                onClick={loadLeads}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh leads"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Bulk Actions Menu if selected */}
              {selectedLeadIds.length > 0 && (
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-xl text-xs">
                  <span className="text-green-400 font-semibold font-mono">
                    {selectedLeadIds.length} selected:
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleBulkStatusChange(e.target.value as LeadStatus);
                    }}
                    defaultValue=""
                    className="bg-zinc-900 border border-zinc-700 text-xs rounded-lg px-2 py-0.5 text-white"
                  >
                    <option value="" disabled>
                      Change Status...
                    </option>
                    <option value="reviewed">Set Reviewed</option>
                    <option value="contacted">Set Contacted</option>
                    <option value="qualified">Set Qualified</option>
                    <option value="archived">Set Archived</option>
                  </select>

                  <button
                    onClick={() => {
                      setIsCreateShareOpen(true);
                    }}
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-purple-400 text-xs transition-colors"
                    title="Share selected leads"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleBulkDelete}
                    className="p-1 rounded bg-zinc-900 hover:bg-red-500/20 text-red-400 text-xs transition-colors"
                    title="Delete selected leads"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setActiveSubTab("upload")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-semibold shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import File</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
            {leads.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <Database className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-zinc-300">No leads in LeadVault</p>
                <p className="text-xs mt-1 text-zinc-500">
                  {search || statusFilter
                    ? "No records match your filter criteria."
                    : "Upload an Excel, CSV, Word (.docx), or PDF file to extract leads automatically."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            leads.length > 0 && selectedLeadIds.length === leads.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeadIds(leads.map((l) => l.leadId));
                            } else {
                              setSelectedLeadIds([]);
                            }
                          }}
                          className="rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3">Lead ID</th>
                      <th className="py-3 px-3">Company</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Email & Phone</th>
                      <th className="py-3 px-3">Industry</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {leads.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.leadId);

                      return (
                        <tr
                          key={lead.leadId}
                          className={`hover:bg-zinc-900/40 transition-colors ${
                            isSelected ? "bg-green-500/5" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLeadIds((prev) => [...prev, lead.leadId]);
                                } else {
                                  setSelectedLeadIds((prev) =>
                                    prev.filter((id) => id !== lead.leadId)
                                  );
                                }
                              }}
                              className="rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                            {lead.leadId}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white max-w-[180px] truncate">
                            {lead.companyName || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-300 max-w-[140px] truncate">
                            {lead.contactPerson || "—"}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] space-y-0.5">
                            {lead.email && (
                              <div className="text-green-400 truncate max-w-[160px]">
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="text-zinc-400 truncate max-w-[160px]">
                                {lead.phone}
                              </div>
                            )}
                            {!lead.email && !lead.phone && "—"}
                          </td>
                          <td className="py-2.5 px-3">
                            {lead.category ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                                {lead.category}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400 text-[11px]">
                            {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                                lead.status === "qualified"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : lead.status === "contacted"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : lead.status === "reviewed"
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                  : lead.status === "archived"
                                  ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setInspectingLead(lead)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                title="View full lead record"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingLead(lead)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                title="Edit lead"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSingleLead(lead.leadId)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">
                  Showing page {page} of {totalPages} ({totalLeads} total records)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-40 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-40 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Sub-Tab 2: Upload & Extraction Wizard */}
      {activeSubTab === "upload" && (
        <div className="space-y-6">
          {!extractionResult ? (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-zinc-700/80 hover:border-green-400 bg-zinc-950/40 hover:bg-zinc-900/40 rounded-2xl p-10 text-center transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .docx, .pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <div className="mx-auto w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-3 group-hover:scale-105 transition-transform">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <h3 className="text-base font-semibold text-white">
                {uploading ? "Extracting Leads from Document..." : "Drop Lead File Here or Click to Browse"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                Supports Excel (.xlsx, .xls), CSV, Word documents (.docx), and PDF tables up to 15MB.
              </p>

              {/* Supported Formats Pill Bar */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  .CSV
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  .XLSX / .XLS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  .DOCX
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  .PDF
                </span>
              </div>
            </div>
          ) : (
            /* Extraction Review & Column Mapping Screen */
            <div className="space-y-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      EXTRACTION REVIEW
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {extractionResult.fileName} ({extractionResult.totalRows} detected)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Map Columns & Resolve Duplicates
                  </h3>
                </div>

                <button
                  onClick={() => setExtractionResult(null)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors self-start"
                >
                  Cancel / Re-upload
                </button>
              </div>

              {/* Duplicate Strategy Selector */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <label className="text-xs font-semibold text-white block">
                  Duplicate Resolution Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("skip")}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      duplicateStrategy === "skip"
                        ? "bg-green-500/10 border-green-500/40 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <p className="font-semibold text-green-400">Skip Duplicates</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Recommended. Ignores leads with matching email/phone.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("update")}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      duplicateStrategy === "update"
                        ? "bg-blue-500/10 border-blue-500/40 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <p className="font-semibold text-blue-400">Update Existing</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Merges new fields into existing matching records.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("import_all")}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      duplicateStrategy === "import_all"
                        ? "bg-amber-500/10 border-amber-500/40 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <p className="font-semibold text-amber-400">Import All (Keep Both)</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Imports everything and flags matching duplicates.
                    </p>
                  </button>
                </div>
              </div>

              {/* Column Mapping Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
                  Column Mapping Review
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {extractionResult.headers.map((header) => {
                    const currentMapping = activeMapping[header] || "";

                    return (
                      <div
                        key={header}
                        className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-white truncate max-w-[140px]" title={header}>
                            {header}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">File Header</span>
                        </div>

                        <select
                          value={currentMapping}
                          onChange={(e) =>
                            setActiveMapping((prev) => ({
                              ...prev,
                              [header]: e.target.value,
                            }))
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400"
                        >
                          <option value="">Ignore this column</option>
                          {CANONICAL_FIELDS.map((f) => (
                            <option key={f.key} value={f.key}>
                              {f.label}
                            </option>
                          ))}
                          <option value={`custom_${header.trim().replace(/\s+/g, "_").toLowerCase()}`}>
                            Custom Field ({header})
                          </option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Confirm Import Action Bar */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">
                  Ready to ingest {extractionResult.totalRows} leads into MongoDB
                </span>

                <button
                  onClick={handleConfirmImport}
                  disabled={confirmingImport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-xs sm:text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{confirmingImport ? "Ingesting Leads..." : "Confirm & Ingest Leads"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Sub-Tab 3: Import Batches History */}
      {activeSubTab === "batches" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Import History & Audit Trails</h3>
            <button
              onClick={loadBatches}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBatches ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
            {batches.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-zinc-300">No import batches recorded yet</p>
                <p className="text-xs mt-1 text-zinc-500">
                  Every uploaded file creates a traceable, safe import batch here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Batch ID</th>
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Extracted</th>
                      <th className="py-3 px-4">Duplicates</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Uploaded</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {batches.map((b) => (
                      <tr key={b.batchId} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                          {b.batchId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white max-w-[180px] truncate">
                          {b.fileName}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400">{b.fileType}</td>
                        <td className="py-3 px-4 font-mono text-green-400 font-bold">
                          {b.extractedCount}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-400">{b.duplicateCount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                              b.status === "imported"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : b.status === "failed"
                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteBatch(b.batchId)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete batch and its leads"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Sub-Tab 4: Sharing & Privacy Hub */}
      {activeSubTab === "sharing" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Zero-Trust Sharing & Link Access Control
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage revocable, password-guarded links (Mode B) and public directories (Mode C).
              </p>
            </div>

            <button
              onClick={() => setIsCreateShareOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Share Link</span>
            </button>
          </div>

          {/* Privacy Modes Explanatory Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold">
                MODE A • PRIVATE (DEFAULT)
              </span>
              <p className="text-xs font-semibold text-white mt-1">Admin Only</p>
              <p className="text-[11px] text-zinc-400">
                Visible only to authenticated administrators. Never exposed publicly or via search engines.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-purple-500/20 space-y-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/30">
                MODE B • RESTRICTED LINK
              </span>
              <p className="text-xs font-semibold text-white mt-1">Bearer Token / Password</p>
              <p className="text-[11px] text-zinc-400">
                Cryptographically secure revocable link. Optional password, view limit, and expiry date.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-blue-500/20 space-y-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/30">
                MODE C • PUBLIC DIRECTORY
              </span>
              <p className="text-xs font-semibold text-white mt-1">Explicitly Published</p>
              <p className="text-[11px] text-zinc-400">
                Public directory. Exposes strictly approved fields. Internal notes remain private.
              </p>
            </div>
          </div>

          {/* Shares Table */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
            {shares.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <Share2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-zinc-300">No share links created yet</p>
                <p className="text-xs mt-1 text-zinc-500">
                  Click &ldquo;Create Share Link&rdquo; to share filtered leads securely.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Security</th>
                      <th className="py-3 px-4">Views</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {shares.map((s) => (
                      <tr key={s.shareId} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{s.title}</p>
                          {s.description && (
                            <p className="text-[10px] text-zinc-500 truncate max-w-xs">
                              {s.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                              s.mode === "public"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            }`}
                          >
                            {s.mode}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                          {s.hasPassword ? (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Lock className="w-3 h-3" /> Password Guarded
                            </span>
                          ) : (
                            <span className="text-zinc-500">Token Only</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400">
                          {s.viewCount} {s.maxViews ? `/ ${s.maxViews}` : ""}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                              s.isRevoked
                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {s.isRevoked ? "Revoked" : "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyShareUrl(s.token)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Copy secure link"
                            >
                              {copiedToken === s.token ? (
                                <>
                                  <Check className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-zinc-400" />
                                  <span>Link</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleToggleRevokeShare(s.shareId, s.isRevoked)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                s.isRevoked
                                  ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                              }`}
                            >
                              {s.isRevoked ? "Activate" : "Revoke"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Sub-Tab 5: Collaborative Update Requests */}
      {activeSubTab === "requests" && (
        <div className="space-y-4">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Collaborator Update Requests</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review contact checklists, call notes, and status changes submitted from shared links.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                {(["pending", "approved", "rejected", "all"] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => {
                      setRequestFilter(filterKey);
                      loadRequests(filterKey);
                    }}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                      requestFilter === filterKey
                        ? "bg-zinc-800 text-white font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>

              <button
                onClick={() => loadRequests()}
                disabled={loadingRequests}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh requests"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRequests ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Requests Content */}
          {loadingRequests ? (
            <div className="p-12 text-center text-zinc-500 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Loading Update Requests...
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-2">
              <FileCheck className="w-10 h-10 mx-auto opacity-30 text-emerald-400" />
              <p className="text-sm font-semibold text-zinc-300">
                No {requestFilter === "all" ? "" : requestFilter} update requests found
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {requestFilter === "pending"
                  ? "All caught up! When recipients submit contact progress from shared links, they will show up here for your approval."
                  : "No requests matching the selected filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {requests.map((req) => (
                <div
                  key={req.requestId}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                        <Building className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{req.companyName}</span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            ({req.leadId})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          {req.contactPerson && (
                            <span>Contact: <strong className="text-zinc-300">{req.contactPerson}</strong></span>
                          )}
                          {req.shareTitle && (
                            <>
                              <span>•</span>
                              <span>Directory: <span className="text-purple-400">{req.shareTitle}</span></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                          req.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : req.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {req.status === "pending" ? "● PENDING APPROVAL" : req.status.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {new Date(req.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                    {/* Submitter & Proposed Status */}
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase">
                          Submitted By
                        </span>
                        <span className="font-semibold text-zinc-200">
                          {req.submittedBy}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase">
                          Proposed Status
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-white font-mono text-[11px] font-semibold capitalize">
                          {req.proposedStatus}
                        </span>
                      </div>
                    </div>

                    {/* Checklist Status */}
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 space-y-1.5">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">
                        Contact Activity Checklist
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            req.checklist.contacted
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-zinc-800 text-zinc-500 border-zinc-700"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Contacted: {req.checklist.contacted ? "YES" : "NO"}</span>
                        </span>

                        {req.checklist.meetingScheduled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Clock className="w-3 h-3" />
                            <span>Meeting Scheduled</span>
                          </span>
                        )}

                        {req.checklist.followUpNeeded && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Follow-up Needed</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions if pending */}
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 flex items-center justify-center sm:justify-end gap-2">
                      {req.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleRequestAction(req.requestId, "reject")}
                            disabled={actioningRequestId === req.requestId}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleRequestAction(req.requestId, "approve")}
                            disabled={actioningRequestId === req.requestId}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                          >
                            {actioningRequestId === req.requestId ? (
                              <>
                                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span>Applying...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept & Apply</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <div className="text-right text-[11px] text-zinc-500">
                          {req.status === "approved" ? (
                            <span className="text-emerald-400 font-medium">
                              Approved and synced to lead record
                            </span>
                          ) : (
                            <span className="text-red-400 font-medium">Rejected by admin</span>
                          )}
                          {req.reviewedBy && (
                            <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">
                              by {req.reviewedBy}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes / Conversation Remarks */}
                  {req.notes && (
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-300">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">
                        Collaborator Call Notes & Remarks
                      </span>
                      <p className="whitespace-pre-wrap leading-relaxed">{req.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Modal: Create Share Link */}
      {isCreateShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Create Secure Share Link</span>
              </h3>
              <button
                onClick={() => setIsCreateShareOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShareLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Directory Title *
                </label>
                <input
                  type="text"
                  required
                  value={newShareTitle}
                  onChange={(e) => setNewShareTitle(e.target.value)}
                  placeholder="e.g. Q4 Real Estate Leads"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newShareDesc}
                  onChange={(e) => setNewShareDesc(e.target.value)}
                  placeholder="Add notes for recipient..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Access Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewShareMode("restricted")}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      newShareMode === "restricted"
                        ? "bg-purple-500/10 border-purple-500/40 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <p className="font-semibold text-purple-400">Mode B: Restricted</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Cryptographic bearer link with optional password.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to make this public? Anyone with the URL can view approved fields."
                        )
                      ) {
                        setNewShareMode("public");
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      newShareMode === "public"
                        ? "bg-blue-500/10 border-blue-500/40 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <p className="font-semibold text-blue-400">Mode C: Public</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Explicitly published directory for broad viewing.
                    </p>
                  </button>
                </div>
              </div>

              {/* Password Protection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Password Protection (Optional)
                </label>
                <input
                  type="password"
                  value={newSharePassword}
                  onChange={(e) => setNewSharePassword(e.target.value)}
                  placeholder="Set an access passcode..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Allowed Fields Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Allowed Visible Fields (Zero-Trust Projection)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                  {[
                    { key: "companyName", label: "Company Name" },
                    { key: "contactPerson", label: "Contact Person" },
                    { key: "email", label: "Email Address" },
                    { key: "phone", label: "Phone Number" },
                    { key: "website", label: "Website URL" },
                    { key: "category", label: "Industry" },
                    { key: "city", label: "City & Location" },
                  ].map((f) => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newShareAllowedFields.includes(f.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewShareAllowedFields((prev) => [...prev, f.key]);
                          } else {
                            setNewShareAllowedFields((prev) =>
                              prev.filter((k) => k !== f.key)
                            );
                          }
                        }}
                        className="rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-0"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Internal notes and unapproved fields are completely stripped by the server.
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateShareOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingShare}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creatingShare ? "Generating..." : "Generate Share Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Drawer: Inspect Lead Details */}
      {inspectingLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full p-6 space-y-5 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-mono text-green-400 font-bold">
                  {inspectingLead.leadId}
                </span>
                <h3 className="text-base font-bold text-white">Lead Details</h3>
              </div>
              <button
                onClick={() => setInspectingLead(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Company Name
                </span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {inspectingLead.companyName || "—"}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Contact Person
                </span>
                <p className="text-sm text-zinc-200 mt-0.5">
                  {inspectingLead.contactPerson || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Email</span>
                  <p className="text-zinc-300 font-mono mt-0.5">{inspectingLead.email || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Phone</span>
                  <p className="text-zinc-300 font-mono mt-0.5">{inspectingLead.phone || "—"}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Website</span>
                <p className="text-zinc-300 font-mono mt-0.5">{inspectingLead.website || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Industry</span>
                  <p className="text-zinc-300 mt-0.5">{inspectingLead.category || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Location</span>
                  <p className="text-zinc-300 mt-0.5">
                    {[inspectingLead.city, inspectingLead.state, inspectingLead.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Notes</span>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 mt-1 whitespace-pre-wrap">
                  {inspectingLead.notes || "No additional notes provided."}
                </div>
              </div>

              {inspectingLead.customFields &&
                Object.keys(inspectingLead.customFields).length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Custom Columns
                    </span>
                    <div className="mt-1 space-y-1 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                      {Object.entries(inspectingLead.customFields).map(([k, v]) => (
                        <div key={k} className="flex justify-between py-0.5 text-[11px]">
                          <span className="text-zinc-400 font-mono">{k}:</span>
                          <span className="text-white font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setEditingLead(inspectingLead);
                  setInspectingLead(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium"
              >
                Edit Lead
              </button>
              <button
                onClick={() => handleDeleteSingleLead(inspectingLead.leadId)}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Edit Lead */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Edit Lead Record</h3>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Company Name</label>
                <input
                  type="text"
                  value={editingLead.companyName || ""}
                  onChange={(e) =>
                    setEditingLead((prev) =>
                      prev ? { ...prev, companyName: e.target.value } : null
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Contact Person</label>
                <input
                  type="text"
                  value={editingLead.contactPerson || ""}
                  onChange={(e) =>
                    setEditingLead((prev) =>
                      prev ? { ...prev, contactPerson: e.target.value } : null
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={editingLead.email || ""}
                    onChange={(e) =>
                      setEditingLead((prev) =>
                        prev ? { ...prev, email: e.target.value } : null
                      )
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Phone</label>
                  <input
                    type="text"
                    value={editingLead.phone || ""}
                    onChange={(e) =>
                      setEditingLead((prev) =>
                        prev ? { ...prev, phone: e.target.value } : null
                      )
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Industry</label>
                  <input
                    type="text"
                    value={editingLead.category || ""}
                    onChange={(e) =>
                      setEditingLead((prev) =>
                        prev ? { ...prev, category: e.target.value } : null
                      )
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Status</label>
                  <select
                    value={editingLead.status}
                    onChange={(e) =>
                      setEditingLead((prev) =>
                        prev ? { ...prev, status: e.target.value as LeadStatus } : null
                      )
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Notes</label>
                <textarea
                  rows={3}
                  value={editingLead.notes || ""}
                  onChange={(e) =>
                    setEditingLead((prev) =>
                      prev ? { ...prev, notes: e.target.value } : null
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-xs cursor-pointer disabled:opacity-50"
                >
                  {savingLead ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
