"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Copy,
  Check,
  Trash2,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Search,
  ExternalLink,
  HardDrive,
  FileText,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

interface MediaItem {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string;
}

interface MediaViewProps {
  mediaList: MediaItem[];
  uploading: boolean;
  copiedId: string | null;
  onFileUpload: (files: FileList | null) => void;
  onCopyMediaUrl: (url: string, id: string) => void;
  onDeleteMedia: (id: string) => void;
  onRefresh: () => void;
  formatBytes: (bytes: number) => string;
  searchFilter?: string;
}

export default function MediaView({
  mediaList,
  uploading,
  copiedId,
  onFileUpload,
  onCopyMediaUrl,
  onDeleteMedia,
  onRefresh,
  formatBytes,
  searchFilter = "",
}: MediaViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [localSearch, setLocalSearch] = useState("");

  const activeSearch = searchFilter || localSearch;

  // Filter media items based on search query
  const filteredList = mediaList.filter((item) =>
    item.filename.toLowerCase().includes(activeSearch.toLowerCase().trim())
  );

  const totalBytes = mediaList.reduce((acc, curr) => acc + (curr.size || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Service Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Media Asset Library</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {mediaList.length} files
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Store and retrieve permanent CDN/MongoDB image URLs for projects, certificates, and hero banners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "hover:text-white"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "hover:text-white"
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-colors cursor-pointer"
            title="Refresh media"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-semibold shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFileUpload(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-zinc-700/80 hover:border-green-400 bg-zinc-950/40 hover:bg-zinc-900/40 rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer group relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => onFileUpload(e.target.files)}
          className="hidden"
        />

        <div className="mx-auto w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-3 group-hover:scale-105 transition-transform">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </div>

        <h3 className="text-sm font-semibold text-white">
          {uploading ? "Uploading images to MongoDB..." : "Drop images here or click to browse"}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
          Supports PNG, JPG, WEBP, SVG & GIF up to 8MB. Generates an instant, direct permanent URL.
        </p>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search filenames..."
            className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl pl-9 pr-3.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
          <span>
            Storage: <strong className="text-zinc-200">{formatBytes(totalBytes)}</strong>
          </span>
          <span className="text-zinc-700">•</span>
          <span>
            Showing:{" "}
            <strong className="text-zinc-200">
              {filteredList.length} of {mediaList.length}
            </strong>
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredList.length === 0 ? (
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium text-zinc-300">
            {activeSearch ? "No matching images found" : "No media uploaded yet"}
          </p>
          <p className="text-xs mt-1 text-zinc-500">
            {activeSearch
              ? `No file matching "${activeSearch}". Try a different term or clear the filter.`
              : "Upload your first portfolio image using the upload area above."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl overflow-hidden group hover:border-zinc-700 hover:shadow-lg transition-all flex flex-col justify-between"
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
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-zinc-900/90 text-white hover:text-green-400 transition-colors"
                    title="Open full size"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Metadata & Actions */}
              <div className="p-3">
                <p
                  className="text-xs font-semibold text-zinc-200 truncate mb-1"
                  title={item.filename}
                >
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-3 font-mono">
                  <span>{formatBytes(item.size)}</span>
                  <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCopyMediaUrl(item.url, item.id)}
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
                    onClick={() => onDeleteMedia(item.id)}
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
      ) : (
        /* Table / List View */
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-900/50 transition-colors group"
                  >
                    <td className="py-2.5 px-4">
                      <div className="relative w-12 h-8 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                        <Image
                          src={item.url}
                          alt={item.filename}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-white max-w-[200px] truncate" title={item.filename}>
                      {item.filename}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-400">
                      {formatBytes(item.size)}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-400">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Open full size"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => onCopyMediaUrl(item.url, item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Copy direct permanent URL"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-green-400" />
                              <span className="text-green-400 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onDeleteMedia(item.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete image"
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
        </div>
      )}
    </div>
  );
}
