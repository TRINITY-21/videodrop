"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProcessingScreen from "@/components/ProcessingScreen";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { imagesToTimelapse, ProcessResult } from "@/lib/ffmpeg";
import { formatFileSize } from "@/lib/utils";

export default function TimelapseTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [fps, setFps] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState("");

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleProcess = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setProgress(0);
    setError("");
    setResult(null);

    try {
      const res = await imagesToTimelapse(files, fps, (p) => setProgress(p));
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Timelapse creation failed. Try different images.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setFps(10);
    setResult(null);
    setProgress(0);
    setError("");
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      }
      title="Timelapse from Images"
      description="Turn a series of images into a smooth timelapse video."
      accentColor="#ec4899"
    >
      <AnimatePresence mode="wait">
        {!result && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-zinc-300">
                    {files.length} image{files.length > 1 ? "s" : ""} — {formatFileSize(totalSize)}
                  </p>
                  <button
                    onClick={reset}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="glass rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5">
                  {files.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-lg bg-pink-500/15 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-pink-400">{i + 1}</span>
                      </div>
                      <span className="text-zinc-300 truncate flex-1 min-w-0">{file.name}</span>
                      <span className="text-[11px] text-zinc-600 shrink-0">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image file input */}
            <label
              className={`
                w-full flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed
                transition-all cursor-pointer
                ${files.length === 0
                  ? "border-white/10 hover:border-pink-500/30 hover:bg-white/[0.02]"
                  : "border-white/5 hover:border-pink-500/20 hover:bg-white/[0.02]"
                }
              `}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-sm text-zinc-400">
                {files.length === 0 ? "Select images for your timelapse" : "Add more images"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
            </label>

            {/* Info note */}
            {files.length > 0 && files.length < 2 && (
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span className="text-sm text-zinc-400">
                  Add at least <span className="text-pink-400 font-medium">2 images</span> to create a timelapse.
                </span>
              </div>
            )}

            {/* FPS slider */}
            {files.length >= 2 && (
              <div className="w-full">
                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Frame Rate</span>
                    <span className="text-sm font-mono text-pink-400">{fps} FPS</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value))}
                    className="w-full accent-pink-400"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>1 FPS</span>
                    <span>15 FPS</span>
                    <span>30 FPS</span>
                  </div>
                </div>
              </div>
            )}

            {/* Process button */}
            {processing ? (
              <ProcessingScreen progress={progress} label="Creating timelapse..." />
            ) : (
              files.length >= 2 && (
                <button
                  onClick={handleProcess}
                  className="
                    w-full py-4 rounded-2xl font-semibold text-white text-base
                    bg-gradient-to-r from-pink-500 to-rose-500
                    hover:from-pink-400 hover:to-rose-400
                    active:scale-[0.98] transition-all duration-200
                    shadow-[0_0_30px_rgba(236,72,153,0.2)]
                  "
                >
                  Create Timelapse
                </button>
              )
            )}

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
            <DownloadButton blob={result.blob} filename={result.filename} originalSize={totalSize} />
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="timelapse" />
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all"
            >
              Create another timelapse
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
