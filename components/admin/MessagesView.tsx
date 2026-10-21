"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  User,
} from "lucide-react";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface MessagesViewProps {
  messagesList: MessageItem[];
  onToggleRead: (id: string, currentRead: boolean) => void;
  onDeleteMessage: (id: string) => void;
  onRefresh: () => void;
  searchFilter?: string;
}

export default function MessagesView({
  messagesList,
  onToggleRead,
  onDeleteMessage,
  onRefresh,
  searchFilter = "",
}: MessagesViewProps) {
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read">("all");
  const [localSearch, setLocalSearch] = useState("");

  const activeSearch = searchFilter || localSearch;

  // Filter messages based on tab & search query
  const filteredMessages = messagesList.filter((m) => {
    if (filterTab === "unread" && m.read) return false;
    if (filterTab === "read" && !m.read) return false;

    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase().trim();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchEmail = m.email?.toLowerCase().includes(q);
      const matchPhone = m.phone?.toLowerCase().includes(q);
      const matchMsg = m.message?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchMsg;
    }
    return true;
  });

  const unreadCount = messagesList.filter((m) => !m.read).length;
  const readCount = messagesList.filter((m) => m.read).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Service Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Client Inquiries</span>
            {unreadCount > 0 && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time messages submitted by visitors and potential clients through your portfolio contact form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-medium self-start">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterTab === "all"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All ({messagesList.length})
          </button>
          <button
            onClick={() => setFilterTab("unread")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterTab === "unread"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab("read")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterTab === "read"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Read ({readCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl pl-9 pr-3.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
          />
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium text-zinc-300">
            {activeSearch || filterTab !== "all"
              ? "No messages match your filter"
              : "No contact messages received yet"}
          </p>
          <p className="text-xs mt-1 text-zinc-500">
            {activeSearch
              ? `No inquiries found for "${activeSearch}". Try another query.`
              : "When someone fills out your contact form, their inquiry appears here instantly."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredMessages.map((m) => (
            <div
              key={m.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                m.read
                  ? "bg-zinc-950/70 border-zinc-800/80 text-zinc-400"
                  : "bg-zinc-900/90 border-green-500/30 text-white shadow-[0_0_20px_rgba(34,197,94,0.06)]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {m.name ? m.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
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
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Contact meta tags */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mb-3 pl-0 sm:pl-10">
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

              {/* Message Content */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 mb-4 whitespace-pre-wrap leading-relaxed sm:ml-10">
                {m.message}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 sm:ml-10">
                <button
                  onClick={() => onToggleRead(m.id, m.read)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-medium"
                >
                  {m.read ? "Mark as Unread" : "Mark as Read"}
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${m.email}?subject=Regarding your message on Divyanshu Portfolio`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>

                  <button
                    onClick={() => onDeleteMessage(m.id)}
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
  );
}
