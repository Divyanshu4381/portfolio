"use client";

import React, { useState, useEffect, use } from "react";
import {
  Shield,
  Lock,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle,
} from "lucide-react";

interface SharedPageProps {
  params: Promise<{ token: string }>;
}

export default function SharedLeadViewerPage({ params }: SharedPageProps) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [shareData, setShareData] = useState<{
    title: string;
    description?: string;
    mode: string;
    allowedFields: string[];
    leads: Record<string, any>[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  async function fetchSharedLeads(providedPassword?: string) {
    setLoading(true);
    setError(null);
    setPasswordError("");

    try {
      const headers: Record<string, string> = {};
      if (providedPassword) {
        headers["x-share-password"] = providedPassword;
      }

      const res = await fetch(
        `/api/shared/leads/${token}?page=${page}&limit=25&search=${encodeURIComponent(search)}`,
        { headers }
      );

      const data = await res.json();

      if (res.status === 401 && data.requiresPassword) {
        setRequiresPassword(true);
        if (providedPassword) {
          setPasswordError("Incorrect password. Please try again.");
        }
        setShareData({
          title: data.title || "Protected Lead Directory",
          description: data.description,
          mode: data.mode || "restricted",
          allowedFields: [],
          leads: [],
          pagination: { total: 0, page: 1, limit: 25, totalPages: 1 },
        });
        return;
      }

      if (!res.ok) {
        setError(data.error || "Unable to access this shared link.");
        return;
      }

      setRequiresPassword(false);
      setShareData(data);
    } catch {
      setError("Network error while connecting to shared repository.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSharedLeads();
  }, [token, page, search]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    fetchSharedLeads(passwordInput.trim());
  };

  if (loading && !shareData) {
    return (
      <div className="min-h-screen bg-[#070908] text-white flex flex-col justify-center items-center font-sans">
        <div className="w-9 h-9 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
          Verifying Secure Share Token...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070908] text-white flex flex-col justify-center items-center p-6 font-sans">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Access Denied</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{error}</p>
          <div className="pt-2 text-[11px] text-zinc-600 font-mono">
            Security Notice: Expired, revoked, or invalid access tokens cannot view lead records.
          </div>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-[#070908] text-white flex flex-col justify-center items-center p-6 font-sans">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-8 space-y-5 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Password Protected Directory</h2>
            <p className="text-xs text-zinc-400">
              The owner of &ldquo;{shareData?.title}&rdquo; requires a password to view these records.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Access Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
              />
              {passwordError && (
                <p className="text-xs text-red-400 mt-1.5">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Unlock Lead Directory"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const allowed = shareData?.allowedFields || [];

  return (
    <div className="min-h-screen bg-[#080b11] text-zinc-100 font-sans flex flex-col selection:bg-green-500 selection:text-black">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#0d121d]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-sm">
            LV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                {shareData?.title || "Lead Directory"}
              </span>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  shareData?.mode === "public"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {shareData?.mode === "public" ? "PUBLIC DIRECTORY" : "RESTRICTED ACCESS"}
              </span>
            </div>
            {shareData?.description && (
              <p className="text-[11px] text-zinc-400 truncate max-w-md hidden sm:block">
                {shareData.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Shield className="w-3.5 h-3.5 text-green-400" />
          <span className="hidden sm:inline">Encrypted Viewer</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Search & Records Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search companies, people, or locations..."
              className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            Showing <strong className="text-white">{shareData?.leads.length || 0}</strong> of{" "}
            <strong className="text-white">{shareData?.pagination.total || 0}</strong> authorized records
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          {shareData?.leads.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <Building className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium text-zinc-300">No records found</p>
              <p className="text-xs mt-1 text-zinc-500">
                {search ? "Try adjusting your search terms." : "No leads in this directory."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                  <tr>
                    {allowed.includes("companyName") && <th className="py-3 px-4">Company</th>}
                    {allowed.includes("contactPerson") && (
                      <th className="py-3 px-4">Contact Person</th>
                    )}
                    {allowed.includes("email") && <th className="py-3 px-4">Email</th>}
                    {allowed.includes("phone") && <th className="py-3 px-4">Phone</th>}
                    {allowed.includes("category") && <th className="py-3 px-4">Industry</th>}
                    {allowed.includes("city") && <th className="py-3 px-4">Location</th>}
                    {allowed.includes("website") && <th className="py-3 px-4">Website</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {shareData?.leads.map((lead, idx) => (
                    <tr key={lead.leadId || idx} className="hover:bg-zinc-900/40 transition-colors">
                      {allowed.includes("companyName") && (
                        <td className="py-3 px-4 font-semibold text-white">
                          {lead.companyName || "—"}
                        </td>
                      )}
                      {allowed.includes("contactPerson") && (
                        <td className="py-3 px-4 text-zinc-300">{lead.contactPerson || "—"}</td>
                      )}
                      {allowed.includes("email") && (
                        <td className="py-3 px-4 font-mono">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-green-400 hover:underline flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3" />
                              <span>{lead.email}</span>
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}
                      {allowed.includes("phone") && (
                        <td className="py-3 px-4 font-mono">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-zinc-300 hover:text-green-400 flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-zinc-500" />
                              <span>{lead.phone}</span>
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}
                      {allowed.includes("category") && (
                        <td className="py-3 px-4">
                          {lead.category ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                              {lead.category}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}
                      {allowed.includes("city") && (
                        <td className="py-3 px-4 text-zinc-400">
                          {[lead.city, lead.state, lead.country].filter(Boolean).join(", ") || "—"}
                        </td>
                      )}
                      {allowed.includes("website") && (
                        <td className="py-3 px-4">
                          {lead.website ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                            >
                              <span>Visit</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {shareData && shareData.pagination.totalPages > 1 && (
            <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono">
                Page {shareData.pagination.page} of {shareData.pagination.totalPages}
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
                  disabled={page >= shareData.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-40 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-zinc-800/60 text-center text-[11px] text-zinc-600 font-mono">
        LeadVault Secure Directory System • Read-Only Client Workspace
      </footer>
    </div>
  );
}
