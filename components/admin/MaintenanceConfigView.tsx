"use client";

import React from "react";
import Image from "next/image";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  ShieldAlert,
} from "lucide-react";

interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface MaintenanceConfigViewProps {
  maintenance: MaintenanceConfig;
  setMaintenance: React.Dispatch<React.SetStateAction<MaintenanceConfig>>;
  savingSettings: boolean;
  onSaveForm: (e: React.FormEvent) => void;
  onToggleMaintenance: (next: boolean) => void;
}

export default function MaintenanceConfigView({
  maintenance,
  setMaintenance,
  savingSettings,
  onSaveForm,
  onToggleMaintenance,
}: MaintenanceConfigViewProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Service Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Maintenance Mode & Site Visibility</span>
            <span
              className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full border ${
                maintenance.enabled
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {maintenance.enabled ? "ACTIVE (VISITORS BLOCKED)" : "ONLINE (PUBLIC)"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Control public availability of your portfolio and customize the message displayed to visitors when performing updates.
          </p>
        </div>
      </div>

      {/* Two-Column SaaS Interface: Configuration Form (Left) & Live Visitor Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Settings (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <form onSubmit={onSaveForm} className="space-y-5">
            {/* Master Toggle Card */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    Enable Maintenance Mode
                  </span>
                  {maintenance.enabled && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {maintenance.enabled
                    ? "Visitors are currently redirected to the maintenance screen."
                    : "Portfolio is currently live to all visitors."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMaintenance((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenance.enabled ? "bg-amber-500" : "bg-zinc-700"
                }`}
                title="Toggle maintenance mode"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                    maintenance.enabled ? "translate-x-7" : "translate-x-0 bg-white"
                  }`}
                />
              </button>
            </div>

            {/* Screen Headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Visitor Screen Headline
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {maintenance.title?.length || 0}/80
                </span>
              </div>
              <input
                type="text"
                value={maintenance.title}
                onChange={(e) =>
                  setMaintenance((prev) => ({ ...prev, title: e.target.value }))
                }
                maxLength={80}
                required
                placeholder="e.g. Portfolio Under Maintenance"
                className="w-full bg-zinc-900/90 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-green-400 transition-all"
              />
            </div>

            {/* Announcement Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Announcement Message to Public
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {maintenance.message?.length || 0}/350
                </span>
              </div>
              <textarea
                rows={4}
                value={maintenance.message}
                onChange={(e) =>
                  setMaintenance((prev) => ({ ...prev, message: e.target.value }))
                }
                maxLength={350}
                required
                placeholder="Describe why the portfolio is temporarily offline..."
                className="w-full bg-zinc-900/90 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-green-400 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Form Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/60">
              <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {maintenance.updatedAt
                  ? `Last updated: ${new Date(maintenance.updatedAt).toLocaleString()}`
                  : "Ready to save"}
              </span>

              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? "Saving Settings..." : "Save Configuration"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Visitor Preview (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              <Eye className="w-4 h-4 text-green-400" />
              <span>Visitor Screen Simulation</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              Real-time
            </span>
          </div>

          <p className="text-[11px] text-zinc-500">
            Below is how your headline and message appear to any unauthorized visitor when maintenance mode is active.
          </p>

          {/* Browser Mockup Window */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden bg-[#070908] shadow-2xl">
            {/* Browser top chrome */}
            <div className="h-7 bg-zinc-900/90 border-b border-zinc-800 flex items-center px-3 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-3 h-4 bg-zinc-950 rounded-md border border-zinc-800/80 flex items-center px-2 text-[9px] font-mono text-zinc-500 truncate">
                https://divyanshubca.vercel.app/
              </div>
            </div>

            {/* Screen Content Simulation */}
            <div className="p-6 text-center space-y-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-green-500/40 mx-auto shadow-[0_0_15px_rgba(34,197,94,0.25)]">
                <Image
                  src="/myImg.jpg"
                  alt="Divyanshu Kushwaha"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>UPDATING PORTFOLIO</span>
              </div>

              <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                {maintenance.title || "Portfolio Under Maintenance"}
              </h4>

              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                {maintenance.message ||
                  "I am currently updating my portfolio with exciting new features and projects. Please check back soon!"}
              </p>

              <div className="pt-2 text-[10px] text-zinc-600 font-mono">
                © {new Date().getFullYear()} Divyanshu Kushwaha
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
