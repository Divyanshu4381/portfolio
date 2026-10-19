"use client";

import { motion } from "framer-motion";
import { Mail, Phone, ExternalLink, ShieldCheck, Wrench, Sparkles } from "lucide-react";
import Link from "next/link";

interface MaintenanceViewProps {
  title?: string;
  message?: string;
}

export default function MaintenanceView({
  title = "Portfolio Under Maintenance",
  message = "I am currently updating my portfolio with exciting new projects, performance improvements, and fresh designs. We will be back online shortly!",
}: MaintenanceViewProps) {
  return (
    <div className="min-h-screen bg-[#070908] text-white flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden font-sans selection:bg-green-500 selection:text-black">
      {/* Background radial gradients & grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-green-500/15 via-emerald-500/10 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top branding header */}
      <header className="relative z-10 w-full max-w-5xl flex justify-between items-center py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            D
          </div>
          <span className="font-bold tracking-tight text-lg text-white">
            Divyanshu<span className="text-green-400">.</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>Upgrading Portfolio</span>
        </div>
      </header>

      {/* Main card */}
      <main className="relative z-10 max-w-2xl w-full text-center my-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl relative"
        >
          {/* Animated badge glow icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/5 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.25)] relative group">
            <Wrench className="w-9 h-9 animate-bounce duration-1000" />
            <Sparkles className="w-4 h-4 text-emerald-300 absolute top-2 right-2 animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            {title}
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            {message}
          </p>

          {/* Status box */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 mb-8 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Current Status</p>
                <p className="text-sm font-semibold text-zinc-200">
                  Scheduled Maintenance & Enhancement
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-green-400 bg-green-950/60 border border-green-800/40 px-3 py-1.5 rounded-lg">
              Est: Returning Soon
            </span>
          </div>

          {/* Direct contact buttons */}
          <div className="pt-2 border-t border-zinc-800/70">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">
              Need urgent reach out?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="mailto:divyanshu4381@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 hover:text-white text-xs sm:text-sm font-medium transition-all duration-200"
              >
                <Mail className="w-4 h-4 text-green-400" />
                <span>divyanshu4381@gmail.com</span>
              </a>
              <a
                href="tel:+918957681217"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 hover:text-white text-xs sm:text-sm font-medium transition-all duration-200"
              >
                <Phone className="w-4 h-4 text-green-400" />
                <span>+91 8957681217</span>
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer & Admin shortcut */}
      <footer className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-3 py-4 text-xs text-zinc-500 border-t border-white/5">
        <p>© {new Date().getFullYear()} Divyanshu Kushwaha. All rights reserved.</p>
        <Link
          href="/admin/login"
          className="text-zinc-500 hover:text-green-400 transition-colors duration-200 inline-flex items-center gap-1.5"
        >
          <span>Admin Portal</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </footer>
    </div>
  );
}
