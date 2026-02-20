"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import QualitySlider from "@/components/QualitySlider";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { useToolProcessing } from "@/lib/processing-context";
import { compressVideo, presetCompress } from "@/lib/ffmpeg";
import { formatFileSize } from "@/lib/utils";

const ESTIMATE_RATIOS = { light: 0.7, medium: 0.45, heavy: 0.25 };

const PRESETS = [
  {
    key: "instagram",
    label: "Instagram",
    desc: "1080p, optimized for Reels & Stories",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    color: "#e1306c",
  },
  {
    key: "discord",
    label: "Discord",
    desc: "720p, under 25MB for free uploads",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h.01M15 12h.01" />
        <path d="M7.5 7.5c3.5-1 5.5-1 9 0" />
        <path d="M7 16.5c3.5 1 6.5 1 10 0" />
        <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5" />
        <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.476-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5" />
      </svg>
    ),
    color: "#5865f2",
  },
  {
    key: "email",
    label: "Email",
    desc: "480p, small enough to send via email",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    color: "#f59e0b",
  },
];

export default function CompressTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"custom" | string>("custom");

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [quality, setQuality] = useState<"light" | "medium" | "heavy">("medium");
  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/compress");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file) return;
    startProcessing(
      file,
      mode === "custom" ? "Compressing video..." : `Optimizing for ${PRESETS.find(p => p.key === mode)?.label}...`,
      (onProgress) => mode === "custom" ? compressVideo(file, quality, onProgress) : presetCompress(file, mode, onProgress)
    );
  };

  const reset = () => {
    setFile(null);
    clearResult();
  };

  const estimatedSize = displayFile ? Math.round(displayFile.size * ESTIMATE_RATIOS[quality]) : 0;
  const estimatedSaving = displayFile ? Math.round((1 - ESTIMATE_RATIOS[quality]) * 100) : 0;

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="14" y1="10" x2="21" y2="3" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      }
      title="Compress Video"
      description="Reduce file size while keeping quality. All processing happens in your browser."
      accentColor="#3b82f6"
    >
      <AnimatePresence mode="wait">
        {!displayFile && !result && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <DropZone onFile={setFile} disabled={processing} />
          </motion.div>
        )}

        {displayFile && !result && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <FileInfo file={displayFile} onRemove={reset} />

            {/* Platform Presets */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Quick Export
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => setMode(preset.key)}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center gap-2 ${
                      mode === preset.key
                        ? "text-white"
                        : "bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5"
                    }`}
                    style={mode === preset.key ? {
                      backgroundColor: `color-mix(in srgb, ${preset.color} 15%, transparent)`,
                      borderColor: `color-mix(in srgb, ${preset.color} 40%, transparent)`,
                      color: preset.color,
                    } : undefined}
                  >
                    {preset.icon}
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setMode("custom")}
                className={`mt-2 w-full py-2.5 rounded-xl text-xs font-medium transition-all border ${
                  mode === "custom"
                    ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
                    : "text-zinc-500 border-white/5 hover:bg-white/5"
                }`}
              >
                Custom compression
              </button>
            </div>

            {mode === "custom" && (
              <>
                <QualitySlider value={quality} onChange={setQuality} />
                {/* Size estimate */}
                <div className="w-full glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span className="text-sm text-zinc-400">Estimated output</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">
                        ~{formatFileSize(estimatedSize)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-400">
                        ~{estimatedSaving}% smaller
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode !== "custom" && (
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span className="text-sm text-zinc-400">
                  Optimized for <span className="text-zinc-200 font-medium">{PRESETS.find(p => p.key === mode)?.label}</span> — {PRESETS.find(p => p.key === mode)?.desc}
                </span>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-blue-500 to-cyan-500
                hover:from-blue-400 hover:to-cyan-400
                active:scale-[0.98] transition-all duration-200
                shadow-glow-blue
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {mode === "custom" ? "Compress Video" : `Export for ${PRESETS.find(p => p.key === mode)?.label}`}
            </button>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="space-y-5"
          >
            <DownloadButton
              blob={result.blob}
              filename={result.filename}
              originalSize={displayFile?.size || 0}
              originalFile={displayFile || undefined}
            />
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="compress" />
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all"
            >
              Compress another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
