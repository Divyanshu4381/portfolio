"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Unlock,
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
  Calendar,
  Sparkles,
  Shield,
  Layers,
  KeyRound,
  Bookmark,
  ChevronDown,
  AlertCircle,
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
  ContactStatus,
  ISavedFilterView,
} from "@/lib/lead-engine/types";
import { CANONICAL_FIELDS } from "@/lib/lead-engine/columnMatcher";
import { sanitizeForCsv } from "@/lib/lead-engine/normalizer";

// ─── Status Options ─────────────────────────────────────────────────────────
const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "New Lead", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { value: "not_contacted", label: "Not Contacted", color: "bg-zinc-800 text-zinc-300 border-zinc-700" },
  { value: "contacted", label: "Contacted", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  { value: "follow_up", label: "Follow Up", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { value: "interested", label: "Interested", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  { value: "not_interested", label: "Not Interested", color: "bg-zinc-800 text-zinc-400 border-zinc-700" },
  { value: "qualified", label: "Qualified", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  { value: "converted", label: "Converted Deal", color: "bg-green-500/20 text-green-300 border-green-500/40" },
  { value: "archived", label: "Archived", color: "bg-red-500/10 text-red-400 border-red-500/30" },
];

const CONTACT_STATUS_OPTIONS: { value: ContactStatus; label: string; color: string }[] = [
  { value: "not_contacted", label: "Not Contacted", color: "bg-zinc-800 text-zinc-400 border-zinc-700" },
  { value: "contacted", label: "Contacted", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  { value: "unreachable", label: "Unreachable", color: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
];

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
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Search with 300ms debounce
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [contactStatusFilter, setContactStatusFilter] = useState<string>("");
  const [hasWebsiteFilter, setHasWebsiteFilter] = useState<string>("");
  const [hasEmailFilter, setHasEmailFilter] = useState<string>("");
  const [hasPhoneFilter, setHasPhoneFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [dateField, setDateField] = useState<"createdAt" | "updatedAt" | "followUpDate">("createdAt");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Sort State
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectAllMatching, setSelectAllMatching] = useState(false);

  // Filter Drawer & Values
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<{
    categories: string[];
    cities: string[];
    states: string[];
    batches: { batchId: string; fileName: string }[];
  }>({ categories: [], cities: [], states: [], batches: [] });

  // Saved Filter Views
  const [savedViews, setSavedViews] = useState<ISavedFilterView[]>([]);
  const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewDesc, setNewViewDesc] = useState("");
  const [savingView, setSavingView] = useState(false);

  // Detail Drawer & Quick Edit Modal
  const [inspectingLead, setInspectingLead] = useState<ILead | null>(null);
  const [editingLead, setEditingLead] = useState<ILead | null>(null);
  const [savingLead, setSavingLead] = useState(false);

  // Upload & Extraction Wizard State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<"upload" | "map" | "preview" | "done">("upload");
  const [extractionResult, setExtractionResult] = useState<{
    batchId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    totalRows: number;
    headers: string[];
    suggestedMapping: Record<string, string>;
    mappingWithConfidence?: Record<
      string,
      { canonicalKey: string; confidence: string; sampleValues: string[] }
    >;
    sampleRows: Record<string, any>[];
    duplicateEstimate: number;
  } | null>(null);
  const [activeMapping, setActiveMapping] = useState<Record<string, string>>({});
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "update" | "import_all">("skip");
  const [confirmingImport, setConfirmingImport] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    batchId: string;
    insertedCount: number;
    updatedCount: number;
    skippedCount: number;
    duplicateCount: number;
    invalidCount: number;
    totalProcessed: number;
    errorSummary: Array<{ row: number; reason: string }>;
  } | null>(null);

  // Batches State
  const [batches, setBatches] = useState<ILeadBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Sharing Management State
  const [shares, setShares] = useState<ILeadShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [isCreateShareOpen, setIsCreateShareOpen] = useState(false);
  const [newShareTitle, setNewShareTitle] = useState("");
  const [newShareDesc, setNewShareDesc] = useState("");
  const [newShareRecipientName, setNewShareRecipientName] = useState("");
  const [newShareRecipientEmail, setNewShareRecipientEmail] = useState("");
  const [newShareMode, setNewShareMode] = useState<"restricted" | "public">("restricted");
  const [newSharePassword, setNewSharePassword] = useState("");
  const [showSharePassword, setShowSharePassword] = useState(false);
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
    "country",
  ]);
  const [creatingShare, setCreatingShare] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Collaborative Update Requests State
  const [requests, setRequests] = useState<ILeadUpdateRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestFilter, setRequestFilter] = useState<string>("pending");
  const [actioningRequestId, setActioningRequestId] = useState<string | null>(null);

  // Initial Data Load
  useEffect(() => {
    loadAnalytics();
    loadFilterValues();
    loadSavedViews();
  }, []);

  // Main Data Tab Watcher
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
  }, [
    activeSubTab,
    page,
    limit,
    debouncedSearch,
    statusFilter,
    contactStatusFilter,
    hasWebsiteFilter,
    hasEmailFilter,
    hasPhoneFilter,
    categoryFilter,
    cityFilter,
    stateFilter,
    dateField,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    requestFilter,
  ]);

  // Reset page when any filter changes
  const handleFilterChange = (setter: (v: any) => void, val: any) => {
    setter(val);
    setPage(1);
    setSelectedLeadIds([]);
    setSelectAllMatching(false);
  };

  // ─── Active Filters Count & Clear ───────────────────────────────────────────
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter) count++;
    if (contactStatusFilter) count++;
    if (hasWebsiteFilter) count++;
    if (hasEmailFilter) count++;
    if (hasPhoneFilter) count++;
    if (categoryFilter) count++;
    if (cityFilter) count++;
    if (stateFilter) count++;
    if (dateFrom || dateTo) count++;
    return count;
  }, [
    statusFilter,
    contactStatusFilter,
    hasWebsiteFilter,
    hasEmailFilter,
    hasPhoneFilter,
    categoryFilter,
    cityFilter,
    stateFilter,
    dateFrom,
    dateTo,
  ]);

  const clearAllFilters = () => {
    setStatusFilter("");
    setContactStatusFilter("");
    setHasWebsiteFilter("");
    setHasEmailFilter("");
    setHasPhoneFilter("");
    setCategoryFilter("");
    setCityFilter("");
    setStateFilter("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    setSelectedLeadIds([]);
    setSelectAllMatching(false);
  };

  // ─── Data Loaders ───────────────────────────────────────────────────────────
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

  async function loadFilterValues() {
    try {
      const res = await fetch("/api/admin/leads/filter-values");
      if (res.ok) {
        const data = await res.json();
        setFilterValues(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSavedViews() {
    try {
      const res = await fetch("/api/admin/leads/saved-views");
      if (res.ok) {
        const data = await res.json();
        setSavedViews(data.views || []);
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
        search: debouncedSearch,
        sortBy,
        sortOrder,
      });

      if (statusFilter) params.append("status", statusFilter);
      if (contactStatusFilter) params.append("contactStatus", contactStatusFilter);
      if (hasWebsiteFilter) params.append("hasWebsite", hasWebsiteFilter);
      if (hasEmailFilter) params.append("hasEmail", hasEmailFilter);
      if (hasPhoneFilter) params.append("hasPhone", hasPhoneFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (cityFilter) params.append("city", cityFilter);
      if (stateFilter) params.append("state", stateFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (dateFrom || dateTo) params.append("dateField", dateField);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setTotalLeads(data.pagination?.total || 0);
      } else {
        toast.error("Failed to load leads");
      }
    } catch {
      toast.error("Network error while loading leads");
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

  // ─── Saved View Handlers ────────────────────────────────────────────────────
  async function handleSaveCurrentView(e: React.FormEvent) {
    e.preventDefault();
    if (!newViewName.trim()) return;

    setSavingView(true);
    try {
      const filters = {
        search: debouncedSearch,
        status: statusFilter,
        contactStatus: contactStatusFilter,
        hasWebsite: hasWebsiteFilter,
        hasEmail: hasEmailFilter,
        hasPhone: hasPhoneFilter,
        category: categoryFilter,
        city: cityFilter,
        state: stateFilter,
        dateField,
        dateFrom,
        dateTo,
      };

      const res = await fetch("/api/admin/leads/saved-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newViewName.trim(),
          description: newViewDesc.trim(),
          filters,
        }),
      });

      if (res.ok) {
        playSuccessChime();
        toast.success(`Filter view "${newViewName}" saved`);
        setIsSaveViewOpen(false);
        setNewViewName("");
        setNewViewDesc("");
        loadSavedViews();
      } else {
        const data = await res.json();
        toast.error("Failed to save view", { description: data.error });
      }
    } catch {
      toast.error("Network error while saving view");
    } finally {
      setSavingView(false);
    }
  }

  function applySavedView(view: ISavedFilterView) {
    const f = view.filters || {};
    setSearch(f.search || "");
    setDebouncedSearch(f.search || "");
    setStatusFilter(f.status || "");
    setContactStatusFilter(f.contactStatus || "");
    setHasWebsiteFilter(f.hasWebsite || "");
    setHasEmailFilter(f.hasEmail || "");
    setHasPhoneFilter(f.hasPhone || "");
    setCategoryFilter(f.category || "");
    setCityFilter(f.city || "");
    setStateFilter(f.state || "");
    setDateField(f.dateField || "createdAt");
    setDateFrom(f.dateFrom || "");
    setDateTo(f.dateTo || "");
    setPage(1);
    setSelectedLeadIds([]);
    setSelectAllMatching(false);
    playSuccessChime();
    toast.info(`Applied filter view "${view.name}"`);
  }

  async function handleDeleteSavedView(viewId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved filter view?")) return;

    try {
      const res = await fetch(`/api/admin/leads/saved-views?viewId=${viewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Saved view deleted");
        loadSavedViews();
      }
    } catch {
      toast.error("Failed to delete saved view");
    }
  }

  // ─── File Upload & Extraction ───────────────────────────────────────────────
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    const validExtensions = [".xlsx", ".xls", ".csv", ".docx", ".pdf"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      toast.error("Invalid file format", {
        description: "Please upload an Excel (.xlsx, .xls), CSV, Word (.docx), or PDF table.",
      });
      return;
    }

    setUploading(true);
    setExtractionResult(null);
    setImportSummary(null);

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
        toast.success("File parsed successfully", {
          description: `Extracted ${data.totalRows} records from ${data.fileName}`,
        });

        setExtractionResult(data);
        setActiveMapping(data.suggestedMapping || {});
        setUploadStep("map");
      } else {
        playErrorSound();
        toast.error("Upload failed", { description: data.error });
      }
    } catch {
      playErrorSound();
      toast.error("Network error during file upload");
    } finally {
      setUploading(false);
    }
  }

  // Confirm Import
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
        setImportSummary(data);
        setUploadStep("done");
        toast.success("Import completed!", {
          description: `Inserted ${data.insertedCount}, Updated ${data.updatedCount}, Skipped ${data.skippedCount}`,
        });
        loadLeads();
        loadAnalytics();
        loadFilterValues();
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

  // Export Error Summary
  function handleDownloadErrorReport() {
    if (!importSummary || !importSummary.errorSummary || importSummary.errorSummary.length === 0) {
      toast.info("No errors were logged for this batch");
      return;
    }

    const headers = ["Row Number", "Reason"];
    const rows = importSummary.errorSummary.map((err) => [
      err.row,
      `"${sanitizeForCsv(err.reason).replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = `import_errors_${importSummary.batchId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded error report");
  }

  // ─── Quick Edit & Status Changes ───────────────────────────────────────────
  async function handleQuickStatusChange(leadId: string, newStatus: LeadStatus) {
    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l.leadId === leadId ? { ...l, status: newStatus } : l))
      );

      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          updates: { status: newStatus },
        }),
      });

      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        loadAnalytics();
      } else {
        loadLeads(); // Revert
        toast.error("Failed to update status");
      }
    } catch {
      loadLeads();
      toast.error("Network error while updating status");
    }
  }

  async function handleQuickContactStatusChange(leadId: string, newContactStatus: ContactStatus) {
    try {
      setLeads((prev) =>
        prev.map((l) => (l.leadId === leadId ? { ...l, contactStatus: newContactStatus } : l))
      );

      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          updates: { contactStatus: newContactStatus },
        }),
      });

      if (res.ok) {
        toast.success(`Contact status updated to ${newContactStatus.replace("_", " ")}`);
        loadAnalytics();
      } else {
        loadLeads();
        toast.error("Failed to update contact status");
      }
    } catch {
      loadLeads();
      toast.error("Network error while updating contact status");
    }
  }

  // Bulk Status Update
  async function handleBulkStatusChange(newStatus: LeadStatus) {
    const idsToUpdate = selectAllMatching ? [] : selectedLeadIds;
    if (!selectAllMatching && idsToUpdate.length === 0) return;

    try {
      let finalIds = idsToUpdate;
      if (selectAllMatching) {
        // Fetch all matching IDs
        const params = new URLSearchParams({
          limit: "5000",
          fields: "leadId",
          search: debouncedSearch,
        });
        if (statusFilter) params.append("status", statusFilter);
        if (contactStatusFilter) params.append("contactStatus", contactStatusFilter);
        if (hasWebsiteFilter) params.append("hasWebsite", hasWebsiteFilter);
        if (hasEmailFilter) params.append("hasEmail", hasEmailFilter);
        if (hasPhoneFilter) params.append("hasPhone", hasPhoneFilter);
        if (categoryFilter) params.append("category", categoryFilter);
        if (cityFilter) params.append("city", cityFilter);
        if (stateFilter) params.append("state", stateFilter);

        const resIds = await fetch(`/api/admin/leads?${params.toString()}`);
        if (resIds.ok) {
          const idData = await resIds.json();
          finalIds = idData.leadIds || [];
        }
      }

      if (finalIds.length === 0) {
        toast.error("No leads to update");
        return;
      }

      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: finalIds,
          updates: { status: newStatus },
        }),
      });

      if (res.ok) {
        playSuccessChime();
        toast.success(`Updated ${finalIds.length} lead(s) to ${newStatus}`);
        setSelectedLeadIds([]);
        setSelectAllMatching(false);
        loadLeads();
        loadAnalytics();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error while updating status");
    }
  }

  // Bulk Delete
  async function handleBulkDelete() {
    const idsToDelete = selectAllMatching ? [] : selectedLeadIds;
    const count = selectAllMatching ? totalLeads : idsToDelete.length;

    if (!confirm(`Are you sure you want to permanently delete ${count} lead(s)?`)) return;

    try {
      let finalIds = idsToDelete;
      if (selectAllMatching) {
        const params = new URLSearchParams({
          limit: "5000",
          fields: "leadId",
          search: debouncedSearch,
        });
        if (statusFilter) params.append("status", statusFilter);
        if (contactStatusFilter) params.append("contactStatus", contactStatusFilter);
        if (hasWebsiteFilter) params.append("hasWebsite", hasWebsiteFilter);
        if (hasEmailFilter) params.append("hasEmail", hasEmailFilter);
        if (hasPhoneFilter) params.append("hasPhone", hasPhoneFilter);
        if (categoryFilter) params.append("category", categoryFilter);
        if (cityFilter) params.append("city", cityFilter);
        if (stateFilter) params.append("state", stateFilter);

        const resIds = await fetch(`/api/admin/leads?${params.toString()}`);
        if (resIds.ok) {
          const idData = await resIds.json();
          finalIds = idData.leadIds || [];
        }
      }

      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: finalIds }),
      });

      if (res.ok) {
        playSuccessChime();
        toast.success(`Deleted ${finalIds.length} lead(s)`);
        setSelectedLeadIds([]);
        setSelectAllMatching(false);
        loadLeads();
        loadAnalytics();
      }
    } catch {
      toast.error("Failed to delete leads");
    }
  }

  // Single Lead Delete
  async function handleDeleteSingleLead(leadId: string) {
    if (!confirm("Are you sure you want to permanently delete this lead?")) return;

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

  // Save Full Edited Lead
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
      } else {
        toast.error("Failed to update lead details");
      }
    } catch {
      toast.error("Network error while updating lead");
    } finally {
      setSavingLead(false);
    }
  }

  // ─── Export CSV ─────────────────────────────────────────────────────────────
  async function handleExportCsv() {
    try {
      toast.info("Preparing CSV export...");

      let exportLeads: ILead[] = [];

      if (!selectAllMatching && selectedLeadIds.length > 0) {
        exportLeads = leads.filter((l) => selectedLeadIds.includes(l.leadId));
      } else {
        // Fetch full matching set up to 5000 records
        const params = new URLSearchParams({
          limit: "5000",
          export: "true",
          search: debouncedSearch,
          sortBy,
          sortOrder,
        });

        if (statusFilter) params.append("status", statusFilter);
        if (contactStatusFilter) params.append("contactStatus", contactStatusFilter);
        if (hasWebsiteFilter) params.append("hasWebsite", hasWebsiteFilter);
        if (hasEmailFilter) params.append("hasEmail", hasEmailFilter);
        if (hasPhoneFilter) params.append("hasPhone", hasPhoneFilter);
        if (categoryFilter) params.append("category", categoryFilter);
        if (cityFilter) params.append("city", cityFilter);
        if (stateFilter) params.append("state", stateFilter);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);

        const res = await fetch(`/api/admin/leads?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          exportLeads = data.leads || [];
        } else {
          exportLeads = leads;
        }
      }

      if (exportLeads.length === 0) {
        toast.error("No leads available to export");
        return;
      }

      const headers = [
        "Lead ID",
        "Company Name",
        "Contact Person",
        "Email",
        "Phone",
        "Website",
        "Category",
        "City",
        "State",
        "Country",
        "Status",
        "Contact Status",
        "Follow Up Date",
        "Notes",
      ];

      const rows = exportLeads.map((l) => [
        sanitizeForCsv(l.leadId),
        `"${sanitizeForCsv(l.companyName || "").replace(/"/g, '""')}"`,
        `"${sanitizeForCsv(l.contactPerson || "").replace(/"/g, '""')}"`,
        sanitizeForCsv(l.email || ""),
        sanitizeForCsv(l.phone || ""),
        sanitizeForCsv(l.website || ""),
        `"${sanitizeForCsv(l.category || "").replace(/"/g, '""')}"`,
        `"${sanitizeForCsv(l.city || "").replace(/"/g, '""')}"`,
        `"${sanitizeForCsv(l.state || "").replace(/"/g, '""')}"`,
        `"${sanitizeForCsv(l.country || "").replace(/"/g, '""')}"`,
        sanitizeForCsv(l.status || ""),
        sanitizeForCsv(l.contactStatus || ""),
        sanitizeForCsv(l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : ""),
        `"${sanitizeForCsv(l.notes || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `leadvault_leads_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      playSuccessChime();
      toast.success(`Exported ${exportLeads.length} leads to CSV`);
    } catch {
      toast.error("Failed to generate CSV export");
    }
  }

  // ─── Batch Management ───────────────────────────────────────────────────────
  async function handleDeleteBatch(batchId: string) {
    if (
      !confirm(
        "Delete this import batch? This will cascade-delete all leads imported by this file."
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

  // ─── Sharing Management ─────────────────────────────────────────────────────
  async function handleCreateShareLink(e: React.FormEvent) {
    e.preventDefault();
    setCreatingShare(true);

    try {
      let leadIdsToShare = selectedLeadIds;

      // If no leads specifically selected, offer to share all matching leads
      if (leadIdsToShare.length === 0) {
        const params = new URLSearchParams({
          limit: "5000",
          fields: "leadId",
          search: debouncedSearch,
        });
        if (statusFilter) params.append("status", statusFilter);
        if (contactStatusFilter) params.append("contactStatus", contactStatusFilter);
        if (hasWebsiteFilter) params.append("hasWebsite", hasWebsiteFilter);
        if (hasEmailFilter) params.append("hasEmail", hasEmailFilter);
        if (hasPhoneFilter) params.append("hasPhone", hasPhoneFilter);
        if (categoryFilter) params.append("category", categoryFilter);
        if (cityFilter) params.append("city", cityFilter);
        if (stateFilter) params.append("state", stateFilter);

        const resIds = await fetch(`/api/admin/leads?${params.toString()}`);
        if (resIds.ok) {
          const idData = await resIds.json();
          leadIdsToShare = idData.leadIds || [];
        }
      }

      if (leadIdsToShare.length === 0) {
        toast.error("No leads available to share in this view");
        return;
      }

      const res = await fetch("/api/admin/leads/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newShareTitle.trim(),
          description: newShareDesc.trim(),
          recipientName: newShareRecipientName.trim(),
          recipientEmail: newShareRecipientEmail.trim(),
          mode: newShareMode,
          password: newSharePassword.trim() || undefined,
          expiresAt: newShareExpiresAt || undefined,
          maxViews: newShareMaxViews ? parseInt(newShareMaxViews, 10) : undefined,
          leadIds: leadIdsToShare,
          allowedFields: newShareAllowedFields,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        playSuccessChime();
        toast.success("Share portal created!", {
          description: `Authorized ${data.share?.leadIds?.length || 0} leads`,
        });

        setIsCreateShareOpen(false);
        setNewShareTitle("");
        setNewShareDesc("");
        setNewShareRecipientName("");
        setNewShareRecipientEmail("");
        setNewSharePassword("");
        setNewShareExpiresAt("");
        setNewShareMaxViews("");
        loadShares();
        loadAnalytics();
      } else {
        toast.error("Failed to create share", { description: data.error });
      }
    } catch {
      toast.error("Network error while creating share");
    } finally {
      setCreatingShare(false);
    }
  }

  async function handleToggleRevokeShare(shareId: string, currentRevoked: boolean) {
    try {
      const res = await fetch(`/api/admin/leads/shares/${shareId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRevoked: !currentRevoked }),
      });

      if (res.ok) {
        toast.success(currentRevoked ? "Share link reactivated" : "Share link revoked");
        loadShares();
        loadAnalytics();
      }
    } catch {
      toast.error("Failed to update share status");
    }
  }

  async function handleDeleteShare(shareId: string) {
    if (!confirm("Permanently delete this share link?")) return;

    try {
      const res = await fetch(`/api/admin/leads/shares/${shareId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Share link deleted");
        loadShares();
        loadAnalytics();
      }
    } catch {
      toast.error("Failed to delete share link");
    }
  }

  function handleCopyShareLink(token: string) {
    const fullUrl = `${window.location.origin}/shared/leads/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    toast.success("Secure link copied to clipboard");
    setTimeout(() => setCopiedToken(null), 2500);
  }

  function generateSecureRandomPassword() {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewSharePassword(pwd);
    setShowSharePassword(true);
  }

  // ─── Collaborative Update Requests ──────────────────────────────────────────
  async function handleRequestAction(requestId: string, action: "approve" | "reject") {
    setActioningRequestId(requestId);
    try {
      const res = await fetch(`/api/admin/leads/requests/${requestId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        playSuccessChime();
        toast.success(action === "approve" ? "Update request approved & applied" : "Request rejected");
        loadRequests();
        loadLeads();
        loadAnalytics();
      } else {
        toast.error("Action failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActioningRequestId(null);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-zinc-100 font-sans">
      {/* 1. Header & Primary Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                LeadVault CRM & Portal
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                  PRODUCTION v2.4
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Intelligent ingestion, zero false-match mapping, deduplication & zero-trust sharing.
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
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-950 text-zinc-400">
              {totalLeads}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("upload");
              setUploadStep("upload");
            }}
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
            <span>Client Sharing</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Leads</span>
            <p className="text-xl font-bold text-white mt-0.5">{analytics.totalLeads.toLocaleString()}</p>
          </div>

          <div
            onClick={() => handleFilterChange(setHasWebsiteFilter, hasWebsiteFilter === "yes" ? "" : "yes")}
            className={`rounded-xl p-3 border transition-colors cursor-pointer ${
              hasWebsiteFilter === "yes"
                ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
              Has Website
              <Globe className="w-3 h-3 text-blue-400" />
            </span>
            <p className="text-xl font-bold text-blue-400 mt-0.5">
              {analytics.leadsWithWebsite.toLocaleString()}
            </p>
          </div>

          <div
            onClick={() => handleFilterChange(setHasWebsiteFilter, hasWebsiteFilter === "no" ? "" : "no")}
            className={`rounded-xl p-3 border transition-colors cursor-pointer ${
              hasWebsiteFilter === "no"
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase">No Website</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">
              {analytics.leadsWithoutWebsite.toLocaleString()}
            </p>
          </div>

          <div
            onClick={() => handleFilterChange(setHasEmailFilter, hasEmailFilter === "yes" ? "" : "yes")}
            className={`rounded-xl p-3 border transition-colors cursor-pointer ${
              hasEmailFilter === "yes"
                ? "bg-green-500/10 border-green-500/40 text-green-300"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
              Has Email
              <Mail className="w-3 h-3 text-green-400" />
            </span>
            <p className="text-xl font-bold text-green-400 mt-0.5">
              {analytics.leadsWithEmail.toLocaleString()}
            </p>
          </div>

          <div
            onClick={() => handleFilterChange(setContactStatusFilter, contactStatusFilter === "contacted" ? "" : "contacted")}
            className={`rounded-xl p-3 border transition-colors cursor-pointer ${
              contactStatusFilter === "contacted"
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Contacted</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              {analytics.contactedLeads.toLocaleString()}
            </p>
          </div>

          <div
            onClick={() => handleFilterChange(setStatusFilter, statusFilter === "interested" ? "" : "interested")}
            className={`rounded-xl p-3 border transition-colors cursor-pointer ${
              statusFilter === "interested"
                ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Interested</span>
            <p className="text-xl font-bold text-purple-400 mt-0.5">
              {analytics.interestedLeads.toLocaleString()}
            </p>
          </div>

          <div
            onClick={() => setActiveSubTab("sharing")}
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 cursor-pointer hover:border-purple-500/40 transition-colors"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
              Active Shares
              <Share2 className="w-3 h-3 text-purple-400" />
            </span>
            <p className="text-xl font-bold text-purple-400 mt-0.5">
              {analytics.activeShares.toLocaleString()}
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
          {/* Main Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80">
            {/* Left Controls: Search & Filter Toggle & Saved Views */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search with Clear */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search company, contact, email, website..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-green-400"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setDebouncedSearch("");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Advanced Filter Toggle Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isFilterOpen || activeFiltersCount > 0
                    ? "bg-green-500/10 border-green-500/40 text-green-400"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-green-500 text-black font-bold text-[10px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Saved Views Dropdown */}
              <div className="relative inline-block">
                <select
                  value=""
                  onChange={(e) => {
                    const view = savedViews.find((v) => v.viewId === e.target.value);
                    if (view) applySavedView(view);
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-green-400 cursor-pointer"
                >
                  <option value="" disabled>
                    Saved Views ({savedViews.length})
                  </option>
                  {savedViews.map((v) => (
                    <option key={v.viewId} value={v.viewId}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save View Button */}
              <button
                onClick={() => setIsSaveViewOpen(true)}
                title="Save current filters as a named view"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Controls: Share, Export & Ingest */}
            <div className="flex items-center gap-2">
              {/* Share Selected Shortcut */}
              <button
                onClick={() => {
                  setIsCreateShareOpen(true);
                  if (selectedLeadIds.length > 0) {
                    setNewShareTitle(`Selected Leads (${selectedLeadIds.length})`);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedLeadIds.length > 0
                    ? "bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>
                  {selectedLeadIds.length > 0
                    ? `Share Selected (${selectedLeadIds.length})`
                    : "Create Share"}
                </span>
              </button>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export CSV</span>
              </button>

              {/* Import File Button */}
              <button
                onClick={() => {
                  setActiveSubTab("upload");
                  setUploadStep("upload");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-semibold shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Leads</span>
              </button>
            </div>
          </div>

          {/* Collapsible Advanced Filter Panel */}
          {isFilterOpen && (
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-green-400" />
                  Advanced Filter Query Builder
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  Reset all filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Lead Status */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Lead Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">All Lead Statuses</option>
                    {LEAD_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Status */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Contact Status</label>
                  <select
                    value={contactStatusFilter}
                    onChange={(e) => handleFilterChange(setContactStatusFilter, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">All Contact Statuses</option>
                    {CONTACT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Has Website Filter */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Website Available</label>
                  <select
                    value={hasWebsiteFilter}
                    onChange={(e) => handleFilterChange(setHasWebsiteFilter, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">Either (All Leads)</option>
                    <option value="yes">Has Website URL</option>
                    <option value="no">Missing Website</option>
                  </select>
                </div>

                {/* Has Email Filter */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Email Available</label>
                  <select
                    value={hasEmailFilter}
                    onChange={(e) => handleFilterChange(setHasEmailFilter, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">Either</option>
                    <option value="yes">Has Email</option>
                    <option value="no">Missing Email</option>
                  </select>
                </div>

                {/* Has Phone Filter */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Phone Available</label>
                  <select
                    value={hasPhoneFilter}
                    onChange={(e) => handleFilterChange(setHasPhoneFilter, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">Either</option>
                    <option value="yes">Has Phone</option>
                    <option value="no">Missing Phone</option>
                  </select>
                </div>

                {/* Industry / Category */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Industry</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">All Industries</option>
                    {filterValues.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second row of filters: City, Date Range, Sort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-zinc-800/60">
                {/* City */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">City Location</label>
                  <select
                    value={cityFilter}
                    onChange={(e) => handleFilterChange(setCityFilter, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">All Cities</option>
                    {filterValues.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Field Selector */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Filter Date By</label>
                  <select
                    value={dateField}
                    onChange={(e) => handleFilterChange(setDateField, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="updatedAt">Last Updated</option>
                    <option value="followUpDate">Follow-up Date</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => handleFilterChange(setDateFrom, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => handleFilterChange(setDateTo, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Chips Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
              <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Active Filters:</span>

              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px]">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("")} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {contactStatusFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px]">
                  Contact: {contactStatusFilter}
                  <button onClick={() => setContactStatusFilter("")} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {hasWebsiteFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-blue-300 text-[11px]">
                  Website: {hasWebsiteFilter === "yes" ? "Yes" : "Missing"}
                  <button onClick={() => setHasWebsiteFilter("")} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {hasEmailFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-green-300 text-[11px]">
                  Email: {hasEmailFilter === "yes" ? "Yes" : "Missing"}
                  <button onClick={() => setHasEmailFilter("")} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {hasPhoneFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px]">
                  Phone: {hasPhoneFilter === "yes" ? "Yes" : "Missing"}
                  <button onClick={() => setHasPhoneFilter("")} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px]">
                  Industry: {categoryFilter}
                  <button onClick={() => setCategoryFilter("")} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {cityFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px]">
                  City: {cityFilter}
                  <button onClick={() => setCityFilter("")} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(dateFrom || dateTo) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px]">
                  Date: {dateFrom || "Start"} → {dateTo || "End"}
                  <button
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-[11px] text-zinc-500 hover:text-white ml-auto underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Bulk Selection Actions Bar */}
          {selectedLeadIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900 border border-green-500/30 rounded-xl animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-green-500 text-black font-bold text-xs">
                  {selectAllMatching ? totalLeads : selectedLeadIds.length} Selected
                </span>
                <span className="text-xs text-zinc-400">
                  {selectAllMatching
                    ? "All matching leads across all pages selected"
                    : `Leads selected on current page`}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Bulk Status Select */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusChange(e.target.value as LeadStatus);
                      e.target.value = "";
                    }
                  }}
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="">Change Status...</option>
                  {LEAD_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Set {opt.label}
                    </option>
                  ))}
                </select>

                {/* Share Selected */}
                <button
                  onClick={() => {
                    setIsCreateShareOpen(true);
                    setNewShareTitle(`Portal for ${selectedLeadIds.length} Leads`);
                  }}
                  className="px-3 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share</span>
                </button>

                {/* Delete Selected */}
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedLeadIds([]);
                    setSelectAllMatching(false);
                  }}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* "Select All Matching" Banner */}
          {leads.length > 0 && selectedLeadIds.length === leads.length && totalLeads > leads.length && (
            <div className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-center text-xs text-zinc-300">
              {!selectAllMatching ? (
                <>
                  All <strong>{leads.length}</strong> leads on this page are selected.{" "}
                  <button
                    onClick={() => setSelectAllMatching(true)}
                    className="text-green-400 font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    Select all {totalLeads.toLocaleString()} matching leads
                  </button>
                </>
              ) : (
                <>
                  All <strong>{totalLeads.toLocaleString()}</strong> matching leads across all pages are selected.{" "}
                  <button
                    onClick={() => {
                      setSelectAllMatching(false);
                      setSelectedLeadIds([]);
                    }}
                    className="text-amber-400 font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    Clear selection
                  </button>
                </>
              )}
            </div>
          )}

          {/* Table Container */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
            {loadingLeads ? (
              <div className="p-16 text-center text-zinc-500">
                <div className="w-7 h-7 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono">Loading leads from LeadVault...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="p-16 text-center text-zinc-500">
                <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-zinc-300">No leads match your criteria</p>
                <p className="text-xs mt-1 text-zinc-500 max-w-sm mx-auto">
                  {debouncedSearch || activeFiltersCount > 0
                    ? "Try relaxing search keywords or resetting your active filters."
                    : "Upload an Excel or CSV file to populate your LeadVault repository."}
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/90 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeadIds(leads.map((l) => l.leadId));
                            } else {
                              setSelectedLeadIds([]);
                              setSelectAllMatching(false);
                            }
                          }}
                          className="rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th
                        onClick={() => {
                          setSortBy("leadId");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                        className="py-3 px-3 cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center gap-1">
                          <span>Lead ID</span>
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        </div>
                      </th>
                      <th
                        onClick={() => {
                          setSortBy("companyName");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                        className="py-3 px-3 cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center gap-1">
                          <span>Company & Industry</span>
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        </div>
                      </th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Email & Phone</th>
                      <th className="py-3 px-3">Website</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Lead Status</th>
                      <th className="py-3 px-3">Contact Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {leads.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.leadId) || selectAllMatching;

                      return (
                        <tr
                          key={lead.leadId}
                          className={`hover:bg-zinc-900/40 transition-colors ${
                            isSelected ? "bg-green-500/5" : ""
                          }`}
                        >
                          {/* Checkbox */}
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
                                  setSelectAllMatching(false);
                                }
                              }}
                              className="rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Lead ID */}
                          <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                            <button
                              onClick={() => setInspectingLead(lead)}
                              className="hover:text-green-400 hover:underline text-left cursor-pointer"
                              title="Inspect lead details"
                            >
                              {lead.leadId}
                            </button>
                          </td>

                          {/* Company Name & Industry */}
                          <td className="py-2.5 px-3 max-w-[200px]">
                            <p className="font-semibold text-white truncate" title={lead.companyName}>
                              {lead.companyName || "—"}
                            </p>
                            {lead.category && (
                              <span className="text-[10px] text-zinc-400 truncate block">
                                {lead.category}
                              </span>
                            )}
                          </td>

                          {/* Contact Person */}
                          <td className="py-2.5 px-3 text-zinc-300 max-w-[140px] truncate" title={lead.contactPerson}>
                            {lead.contactPerson || "—"}
                          </td>

                          {/* Email & Phone */}
                          <td className="py-2.5 px-3 font-mono text-[11px] space-y-0.5">
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="text-green-400 hover:underline flex items-center gap-1 max-w-[170px] truncate"
                              >
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{lead.email}</span>
                              </a>
                            ) : null}
                            {lead.phone ? (
                              <a
                                href={`tel:${lead.phone}`}
                                className="text-zinc-400 hover:text-white flex items-center gap-1 max-w-[170px] truncate"
                              >
                                <Phone className="w-3 h-3 shrink-0" />
                                <span className="truncate">{lead.phone}</span>
                              </a>
                            ) : null}
                            {!lead.email && !lead.phone && <span className="text-zinc-600">—</span>}
                          </td>

                          {/* Website Column */}
                          <td className="py-2.5 px-3 max-w-[150px]">
                            {lead.website ? (
                              <a
                                href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 hover:text-blue-300 hover:border-blue-500/40 text-[11px] font-mono transition-colors truncate max-w-full"
                                title={lead.website}
                              >
                                <Globe className="w-3 h-3 shrink-0 text-blue-400" />
                                <span className="truncate">
                                  {lead.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                                </span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-zinc-500 italic">No Website</span>
                            )}
                          </td>

                          {/* Location */}
                          <td className="py-2.5 px-3 text-zinc-400 text-[11px] max-w-[120px] truncate">
                            {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                          </td>

                          {/* Lead Status Dropdown */}
                          <td className="py-2.5 px-3">
                            <select
                              value={lead.status}
                              onChange={(e) => handleQuickStatusChange(lead.leadId, e.target.value as LeadStatus)}
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border focus:outline-none cursor-pointer bg-zinc-950 ${
                                LEAD_STATUS_OPTIONS.find((s) => s.value === lead.status)?.color ||
                                "bg-zinc-800 text-zinc-300 border-zinc-700"
                              }`}
                            >
                              {LEAD_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Contact Status Dropdown */}
                          <td className="py-2.5 px-3">
                            <select
                              value={lead.contactStatus || "not_contacted"}
                              onChange={(e) =>
                                handleQuickContactStatusChange(lead.leadId, e.target.value as ContactStatus)
                              }
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border focus:outline-none cursor-pointer bg-zinc-950 ${
                                CONTACT_STATUS_OPTIONS.find(
                                  (s) => s.value === (lead.contactStatus || "not_contacted")
                                )?.color || "bg-zinc-800 text-zinc-400 border-zinc-700"
                              }`}
                            >
                              {CONTACT_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Row Actions */}
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setInspectingLead(lead)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                title="View lead details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingLead(lead)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                title="Edit lead record"
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

            {/* Pagination Bar */}
            <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-400 font-mono">
                <span>
                  Showing {leads.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
                  {Math.min(page * limit, totalLeads)} of {totalLeads.toLocaleString()} leads
                </span>
                <span className="text-zinc-600">|</span>
                <span>Page size:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-white"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono text-zinc-400">
                  Page {page} of {Math.ceil(totalLeads / limit) || 1}
                </span>
                <button
                  disabled={page >= Math.ceil(totalLeads / limit)}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Tab 2: Ingestion & Extraction Wizard */}
      {activeSubTab === "upload" && (
        <div className="space-y-6">
          {/* Step 1: Upload Dropzone */}
          {uploadStep === "upload" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-12 border-2 border-dashed border-zinc-800 hover:border-green-500/50 rounded-2xl bg-zinc-950/60 hover:bg-zinc-900/20 transition-all text-center cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .docx, .pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-4 group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                {uploading ? (
                  <div className="w-7 h-7 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <h3 className="text-base font-bold text-white">
                {uploading ? "Extracting Leads from Document..." : "Drop Lead File Here or Click to Browse"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                Ingest Excel (.xlsx, .xls), CSV, Word documents (.docx), or PDF tables up to 20MB.
              </p>

              {/* Supported Formats Pill Bar */}
              <div className="flex items-center justify-center gap-2 mt-5">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  .CSV
                </span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  .XLSX / .XLS
                </span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  .DOCX
                </span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  .PDF
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Extraction Review & Column Mapping */}
          {uploadStep === "map" && extractionResult && (
            <div className="space-y-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      STEP 2 OF 3 • COLUMN MAPPING
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {extractionResult.fileName} ({extractionResult.totalRows.toLocaleString()} rows detected)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Verify Fields & Sample Data
                  </h3>
                  <p className="text-xs text-zinc-400">
                    LeadVault auto-detected column mappings based on strict scoring. Verify each field mapping below.
                  </p>
                </div>

                <button
                  onClick={() => setUploadStep("upload")}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("skip")}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      duplicateStrategy === "skip"
                        ? "bg-green-500/10 border-green-500/40 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <p className="font-semibold text-green-400">Skip Duplicates (Recommended)</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Ignores leads that already exist in the database with matching email or phone.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("update")}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      duplicateStrategy === "update"
                        ? "bg-blue-500/10 border-blue-500/40 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <p className="font-semibold text-blue-400">Update Existing</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Overwrites and enriches fields of existing matching records with new data.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("import_all")}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      duplicateStrategy === "import_all"
                        ? "bg-amber-500/10 border-amber-500/40 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <p className="font-semibold text-amber-400">Import All</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Imports all rows, creating new records and flagging duplicates for review.
                    </p>
                  </button>
                </div>
              </div>

              {/* Column Mapping Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
                  File Columns & Sample Preview
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {extractionResult.headers.map((header) => {
                    const currentMapping = activeMapping[header] || "";
                    const meta = extractionResult.mappingWithConfidence?.[header];

                    return (
                      <div
                        key={header}
                        className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white truncate max-w-[150px]" title={header}>
                            {header}
                          </span>
                          {meta?.confidence === "high" && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              AUTO MATCH
                            </span>
                          )}
                        </div>

                        {/* Sample Data Display */}
                        {meta?.sampleValues && meta.sampleValues.length > 0 && (
                          <div className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 truncate">
                            <span className="text-zinc-600 block text-[9px] uppercase">Sample:</span>
                            <span className="text-zinc-300 truncate block">
                              {meta.sampleValues.join(" • ")}
                            </span>
                          </div>
                        )}

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

              {/* Navigation to Step 3 (Preview) or Direct Confirm */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => setUploadStep("preview")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Preview Ingestion Data (First 10 Rows)</span>
                </button>

                <button
                  onClick={handleConfirmImport}
                  disabled={confirmingImport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-xs shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{confirmingImport ? "Ingesting Leads..." : "Confirm & Ingest Leads"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Mapped Live Preview Table */}
          {uploadStep === "preview" && extractionResult && (
            <div className="space-y-5 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    LIVE MAPPED PREVIEW
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">First 10 Normalized Records</h3>
                  <p className="text-xs text-zinc-400">
                    Review how your file records will look once saved to the database.
                  </p>
                </div>

                <button
                  onClick={() => setUploadStep("map")}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Back to Column Mapping
                </button>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Website</th>
                      <th className="py-2.5 px-3">Industry</th>
                      <th className="py-2.5 px-3">Duplicate Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {extractionResult.sampleRows.map((row, idx) => {
                      const companyCol = Object.keys(activeMapping).find(
                        (k) => activeMapping[k] === "companyName"
                      );
                      const contactCol = Object.keys(activeMapping).find(
                        (k) => activeMapping[k] === "contactPerson"
                      );
                      const emailCol = Object.keys(activeMapping).find(
                        (k) => activeMapping[k] === "email"
                      );
                      const phoneCol = Object.keys(activeMapping).find(
                        (k) => activeMapping[k] === "phone"
                      );
                      const websiteCol = Object.keys(activeMapping).find(
                        (k) => activeMapping[k] === "website"
                      );
                      const categoryCol = Object.keys(activeMapping).find(
                        (k) => activeMapping[k] === "category"
                      );

                      return (
                        <tr key={idx} className="hover:bg-zinc-900/40">
                          <td className="py-2 px-3 font-semibold text-white">
                            {(companyCol && row[companyCol]) || "—"}
                          </td>
                          <td className="py-2 px-3">{(contactCol && row[contactCol]) || "—"}</td>
                          <td className="py-2 px-3 font-mono text-green-400">
                            {(emailCol && row[emailCol]) || "—"}
                          </td>
                          <td className="py-2 px-3 font-mono">{(phoneCol && row[phoneCol]) || "—"}</td>
                          <td className="py-2 px-3 font-mono text-blue-400">
                            {(websiteCol && row[websiteCol]) || "—"}
                          </td>
                          <td className="py-2 px-3">{(categoryCol && row[categoryCol]) || "—"}</td>
                          <td className="py-2 px-3">
                            {row._isDuplicate ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                Match by {row._matchField}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Fresh Lead
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => setUploadStep("map")}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Modify Column Mapping
                </button>

                <button
                  onClick={handleConfirmImport}
                  disabled={confirmingImport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-xs shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{confirmingImport ? "Ingesting Leads..." : "Confirm & Ingest Leads"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Import Complete & Results Report */}
          {uploadStep === "done" && importSummary && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 max-w-xl mx-auto shadow-xl">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Ingestion Complete</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Batch <span className="font-mono text-zinc-300">{importSummary.batchId}</span> was
                  safely processed into the database.
                </p>
              </div>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-3 gap-3 text-left">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Inserted</span>
                  <p className="text-lg font-bold text-green-400 mt-0.5">
                    +{importSummary.insertedCount}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Updated</span>
                  <p className="text-lg font-bold text-blue-400 mt-0.5">
                    {importSummary.updatedCount}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Skipped Dups</span>
                  <p className="text-lg font-bold text-amber-400 mt-0.5">
                    {importSummary.skippedCount}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {importSummary.errorSummary && importSummary.errorSummary.length > 0 && (
                  <button
                    onClick={handleDownloadErrorReport}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Error Report ({importSummary.errorSummary.length})</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveSubTab("table")}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-xs transition-colors cursor-pointer shadow-md"
                >
                  View Leads in Table
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
            <div>
              <h3 className="text-sm font-semibold text-white">Import History & Audit Trails</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full cryptographic history of every batch file ingested into LeadVault.
              </p>
            </div>
            <button
              onClick={loadBatches}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-800 cursor-pointer"
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
                      <th className="py-3 px-4">Format</th>
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
                        <td className="py-3 px-4 font-mono text-zinc-400 uppercase text-[10px]">
                          {b.fileType}
                        </td>
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
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
                Zero-Trust Sharing & Client Portals
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate secure, password-guarded links with granular field allowlists.
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
              <p className="text-xs font-semibold text-white mt-1">Token & Optional Password</p>
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
                Public directory. Exposes strictly approved fields. Internal notes always remain private.
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
                  Select leads from the table or click &ldquo;Create Share Link&rdquo; to build your first client portal.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Title & Recipient</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Security</th>
                      <th className="py-3 px-4">Leads</th>
                      <th className="py-3 px-4">Views</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {shares.map((s) => (
                      <tr key={s.shareId} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4 max-w-[200px]">
                          <p className="font-semibold text-white truncate">{s.title}</p>
                          {(s.recipientName || s.recipientEmail) && (
                            <p className="text-[10px] text-zinc-400 truncate">
                              To: {[s.recipientName, s.recipientEmail].filter(Boolean).join(" • ")}
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
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {s.hasPassword ? (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Lock className="w-3 h-3" /> Password Guarded
                            </span>
                          ) : (
                            <span className="text-zinc-500">Token Only</span>
                          )}
                          {s.expiresAt && (
                            <span className="text-[10px] text-zinc-500 block">
                              Exp: {new Date(s.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          {s.leadIds?.length || 0} leads
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
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyShareLink(s.token)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                              title="Copy secure link"
                            >
                              {copiedToken === s.token ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <a
                              href={`/shared/leads/${s.token}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                              title="Open client view in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleToggleRevokeShare(s.shareId, s.isRevoked)}
                              className={`p-1.5 rounded-lg text-xs font-mono border transition-colors ${
                                s.isRevoked
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              }`}
                              title={s.isRevoked ? "Reactivate link" : "Revoke link"}
                            >
                              {s.isRevoked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleDeleteShare(s.shareId)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete share link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* 7. Sub-Tab 5: Review Requests Queue */}
      {activeSubTab === "requests" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Collaborative Update Requests
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review call notes and lead status updates submitted by client collaborators.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              {["pending", "approved", "rejected", "all"].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setRequestFilter(st);
                    loadRequests(st);
                  }}
                  className={`px-3 py-1 rounded-lg uppercase font-mono text-[10px] font-bold transition-all cursor-pointer ${
                    requestFilter === st
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {loadingRequests ? (
              <div className="p-12 text-center text-zinc-500">
                <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-mono">Loading update requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-zinc-300">No requests found</p>
                <p className="text-xs mt-1 text-zinc-500">
                  {requestFilter === "pending"
                    ? "No pending updates waiting for admin review."
                    : "No requests matching this filter."}
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.requestId}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {req.companyName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400">
                          {req.leadId}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                            req.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : req.status === "rejected"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Submitted by <strong className="text-zinc-200">{req.submittedBy}</strong>{" "}
                        via {req.shareTitle || "Shared Link"} •{" "}
                        {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {req.status === "pending" && (
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          disabled={actioningRequestId === req.requestId}
                          onClick={() => handleRequestAction(req.requestId, "approve")}
                          className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-black font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Apply</span>
                        </button>
                        <button
                          disabled={actioningRequestId === req.requestId}
                          onClick={() => handleRequestAction(req.requestId, "reject")}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Checklist & Notes Content */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                        Proposed Status & Activities
                      </span>
                      <p className="text-white font-medium">
                        Set Status: <span className="text-green-400 font-bold">{req.proposedStatus}</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {req.checklist.contacted && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                            ✓ Contacted
                          </span>
                        )}
                        {req.checklist.meetingScheduled && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            ✓ Meeting Scheduled
                          </span>
                        )}
                        {req.checklist.followUpNeeded && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ✓ Follow-up Needed
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                        Collaborator Notes
                      </span>
                      <p className="text-zinc-300 italic">
                        {req.notes ? `"${req.notes}"` : "No notes attached."}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 1: Create Share Link ────────────────────────────────────────── */}
      {isCreateShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Create Client Share Portal</h3>
              </div>
              <button
                onClick={() => setIsCreateShareOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShareLink} className="space-y-4 text-xs">
              {/* Pre-population notice */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-between">
                <span>
                  {selectedLeadIds.length > 0
                    ? `Sharing ${selectedLeadIds.length} explicitly selected leads`
                    : `Sharing all currently filtered leads (${totalLeads} total)`}
                </span>
                <span className="font-mono text-[10px] text-purple-400 uppercase">
                  Zero-Trust Projection
                </span>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Portal Title *</label>
                <input
                  type="text"
                  required
                  value={newShareTitle}
                  onChange={(e) => setNewShareTitle(e.target.value)}
                  placeholder="e.g. Q4 Target Accounts for Acme Sales Team"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">
                    Recipient Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newShareRecipientName}
                    onChange={(e) => setNewShareRecipientName(e.target.value)}
                    placeholder="e.g. John Smith / Sales Lead"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">
                    Recipient Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newShareRecipientEmail}
                    onChange={(e) => setNewShareRecipientEmail(e.target.value)}
                    placeholder="e.g. john@agency.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Description / Welcome Message
                </label>
                <textarea
                  rows={2}
                  value={newShareDesc}
                  onChange={(e) => setNewShareDesc(e.target.value)}
                  placeholder="Internal instructions or briefing for the recipient..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                />
              </div>

              {/* Mode & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Access Mode</label>
                  <select
                    value={newShareMode}
                    onChange={(e) => setNewShareMode(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  >
                    <option value="restricted">Restricted (Bearer Token Link)</option>
                    <option value="public">Public Directory (Published)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-zinc-300 font-semibold">Password Guard</label>
                    <button
                      type="button"
                      onClick={generateSecureRandomPassword}
                      className="text-[10px] text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSharePassword ? "text" : "password"}
                      value={newSharePassword}
                      onChange={(e) => setNewSharePassword(e.target.value)}
                      placeholder="Leave blank for token-only"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono"
                    />
                    {newSharePassword && (
                      <button
                        type="button"
                        onClick={() => setShowSharePassword(!showSharePassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        {showSharePassword ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expiry & Views */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Expiry Date</label>
                  <input
                    type="date"
                    value={newShareExpiresAt}
                    onChange={(e) => setNewShareExpiresAt(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Max Views Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={newShareMaxViews}
                    onChange={(e) => setNewShareMaxViews(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>

              {/* Field Whitelist Selection */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-semibold block">
                    Permitted Client Visible Fields
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() =>
                        setNewShareAllowedFields([
                          "companyName",
                          "contactPerson",
                          "email",
                          "phone",
                          "website",
                          "category",
                          "city",
                          "state",
                          "country",
                          "status",
                        ])
                      }
                      className="text-purple-400 hover:underline"
                    >
                      All Standard
                    </button>
                    <span className="text-zinc-600">•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewShareAllowedFields(["companyName", "website", "category", "city", "state"])
                      }
                      className="text-purple-400 hover:underline"
                    >
                      Hide Contacts
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                  {[
                    { key: "companyName", label: "Company Name" },
                    { key: "contactPerson", label: "Contact Person" },
                    { key: "email", label: "Email Address" },
                    { key: "phone", label: "Phone Number" },
                    { key: "website", label: "Website URL" },
                    { key: "category", label: "Industry" },
                    { key: "city", label: "City & State" },
                    { key: "country", label: "Country" },
                    { key: "status", label: "Lead Status" },
                    { key: "notes", label: "Public Notes" },
                  ].map((field) => (
                    <label
                      key={field.key}
                      className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={newShareAllowedFields.includes(field.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewShareAllowedFields((prev) => [...prev, field.key]);
                          } else {
                            setNewShareAllowedFields((prev) => prev.filter((k) => k !== field.key));
                          }
                        }}
                        className="rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-0"
                      />
                      <span>{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateShareOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingShare}
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creatingShare ? "Creating Portal..." : "Generate Share Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Save View Preset ─────────────────────────────────────────── */}
      {isSaveViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-green-400" />
                <h3 className="text-base font-bold text-white">Save Current Filter Preset</h3>
              </div>
              <button
                onClick={() => setIsSaveViewOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrentView} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Preset Name *</label>
                <input
                  type="text"
                  required
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="e.g. Needs Website • High Priority"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Description</label>
                <input
                  type="text"
                  value={newViewDesc}
                  onChange={(e) => setNewViewDesc(e.target.value)}
                  placeholder="Brief note about this view..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaveViewOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingView}
                  className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingView ? "Saving..." : "Save View"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DRAWER: Inspect Full Lead Record ─────────────────────────────────── */}
      {inspectingLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full p-6 space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {inspectingLead.leadId}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {inspectingLead.companyName || "Untitled Company"}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectingLead(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-bold border ${
                    LEAD_STATUS_OPTIONS.find((s) => s.value === inspectingLead.status)?.color ||
                    "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  Status: {inspectingLead.status}
                </span>

                <span
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-bold border ${
                    CONTACT_STATUS_OPTIONS.find(
                      (s) => s.value === (inspectingLead.contactStatus || "not_contacted")
                    )?.color || "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  Contact: {inspectingLead.contactStatus?.replace("_", " ") || "Not Contacted"}
                </span>
              </div>

              {/* Primary Contact Info */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Contact Person</span>
                  <p className="text-white font-medium">{inspectingLead.contactPerson || "—"}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Email Address</span>
                  {inspectingLead.email ? (
                    <a
                      href={`mailto:${inspectingLead.email}`}
                      className="text-green-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{inspectingLead.email}</span>
                    </a>
                  ) : (
                    <p className="text-zinc-500 italic">No email</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Phone</span>
                  {inspectingLead.phone ? (
                    <a
                      href={`tel:${inspectingLead.phone}`}
                      className="text-zinc-300 hover:text-white flex items-center gap-1 font-mono"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{inspectingLead.phone}</span>
                    </a>
                  ) : (
                    <p className="text-zinc-500 italic">No phone</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Website</span>
                  {inspectingLead.website ? (
                    <a
                      href={inspectingLead.website.startsWith("http") ? inspectingLead.website : `https://${inspectingLead.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{inspectingLead.website}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <p className="text-zinc-500 italic">No website</p>
                  )}
                </div>
              </div>

              {/* Business & Location Details */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Industry</span>
                    <p className="text-white mt-0.5">{inspectingLead.category || "—"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Location</span>
                    <p className="text-white mt-0.5">
                      {[inspectingLead.city, inspectingLead.state, inspectingLead.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>

                {inspectingLead.address && (
                  <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Address</span>
                    <p className="text-zinc-300 mt-0.5">{inspectingLead.address}</p>
                  </div>
                )}

                {/* Follow Up Date */}
                {inspectingLead.followUpDate && (
                  <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Scheduled Follow-Up
                      </span>
                      <p className="text-amber-400 font-mono mt-0.5 font-bold">
                        {new Date(inspectingLead.followUpDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Calendar className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                {/* Internal Admin Notes */}
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
                  <span className="text-[10px] font-mono text-red-400 uppercase font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Internal Confidential Notes (Admin Only)
                  </span>
                  <p className="text-zinc-300 mt-1 italic">
                    {inspectingLead.internalNotes || "No internal confidential notes."}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setEditingLead(inspectingLead);
                  setInspectingLead(null);
                }}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Lead</span>
              </button>

              <button
                onClick={() => {
                  handleDeleteSingleLead(inspectingLead.leadId);
                }}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                title="Delete lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: Edit Lead Record ────────────────────────────────────────── */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-green-400" />
                <h3 className="text-base font-bold text-white">Edit Lead #{editingLead.leadId}</h3>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={editingLead.companyName || ""}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, companyName: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Contact Person</label>
                  <input
                    type="text"
                    value={editingLead.contactPerson || ""}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, contactPerson: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={editingLead.email || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Phone</label>
                  <input
                    type="text"
                    value={editingLead.phone || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Website</label>
                  <input
                    type="text"
                    value={editingLead.website || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Industry / Category</label>
                  <input
                    type="text"
                    value={editingLead.category || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    value={editingLead.city || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, city: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">State</label>
                  <input
                    type="text"
                    value={editingLead.state || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, state: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Lead Status</label>
                  <select
                    value={editingLead.status}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, status: e.target.value as LeadStatus })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  >
                    {LEAD_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Contact Status</label>
                  <select
                    value={editingLead.contactStatus || "not_contacted"}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        contactStatus: e.target.value as ContactStatus,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  >
                    {CONTACT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Follow-Up Date</label>
                  <input
                    type="date"
                    value={
                      editingLead.followUpDate
                        ? new Date(editingLead.followUpDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, followUpDate: e.target.value || null })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Internal Notes (Admin Confidential)
                </label>
                <textarea
                  rows={2}
                  value={editingLead.internalNotes || ""}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, internalNotes: e.target.value })
                  }
                  placeholder="Confidential notes visible only to admins..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Public Notes</label>
                <textarea
                  rows={2}
                  value={editingLead.notes || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  placeholder="General notes..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-400 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
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
