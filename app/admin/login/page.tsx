"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Lock,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { playSuccessChime, playErrorSound } from "@/lib/effects";

const AUTHORIZED_EMAIL = "divyanshu4381@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState(AUTHORIZED_EMAIL);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Check if already authenticated
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          router.replace("/admin");
        }
      } catch {
        // Not authenticated
      }
    }
    checkExistingAuth();
  }, [router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail !== AUTHORIZED_EMAIL.toLowerCase()) {
      playErrorSound();
      toast.error("Unauthorized email", {
        description: `Only ${AUTHORIZED_EMAIL} has administrative privileges.`,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        playSuccessChime();
        toast.success("Security code sent!", {
          description: `A 6-digit verification code has been dispatched to ${cleanEmail}`,
        });
        setStep("otp");
        setCountdown(60); // 60s cooldown
      } else {
        playErrorSound();
        toast.error("Failed to send code", {
          description: data.error || "Please check your network or try again.",
        });
      }
    } catch {
      playErrorSound();
      toast.error("Server connection error", {
        description: "Could not connect to the authentication server.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      playErrorSound();
      toast.error("Invalid code length", {
        description: "Please enter the complete 6-digit verification code.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanOtp }),
      });

      const data = await res.json();

      if (res.ok) {
        playSuccessChime();
        toast.success("Authentication confirmed!", {
          description: "Welcome to the Portfolio Command Center.",
        });
        setTimeout(() => {
          router.replace("/admin");
        }, 600);
      } else {
        playErrorSound();
        toast.error("Authentication failed", {
          description: data.error || "Invalid or expired verification code.",
        });
      }
    } catch {
      playErrorSound();
      toast.error("Server connection error", {
        description: "Could not reach the authentication endpoint.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060807] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-green-500 selection:text-black">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-green-500/10 via-emerald-500/10 to-transparent rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to site link */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio</span>
          </Link>
          <span className="text-xs font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            v2.4 Secured
          </span>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative"
        >
          {/* Top header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/5 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_25px_rgba(34,197,94,0.25)] mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {step === "email"
                ? "Sign in with your registered administrator email"
                : "Enter the one-time verification code"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              /* Step 1: Email Form */
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Authorized Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="divyanshu4381@gmail.com"
                      required
                      className="w-full bg-zinc-900/90 border border-zinc-800 text-white rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/80 focus:border-green-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-green-400 inline" />
                    Strictly locked to: <span className="text-zinc-400">{AUTHORIZED_EMAIL}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP to Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              /* Step 2: OTP Form */
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 truncate max-w-[220px]">
                    Code sent to: <strong className="text-white">{email}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-green-400 hover:text-green-300 font-medium underline"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400 w-4 h-4" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      autoFocus
                      required
                      className="w-full bg-zinc-900/90 border border-zinc-800 text-white rounded-xl pl-10 pr-3.5 py-3 text-lg font-mono tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-green-400/80 focus:border-green-500 transition-all placeholder:tracking-normal placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    disabled={countdown > 0 || loading}
                    onClick={handleSendOtp}
                    className="text-green-400 hover:text-green-300 disabled:opacity-40 disabled:hover:text-green-400 inline-flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full mt-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Open Dashboard</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
