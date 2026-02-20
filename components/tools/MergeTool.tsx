"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import ProcessingScreen from "@/components/ProcessingScreen";
import DownloadButton from "@/components/DownloadButton";
import ToolPageLayout from "@/components/ToolPageLayout";
import { mergeVideos, ProcessResult } from "@/lib/ffmpeg";
import { formatFileSize, getExtension } from "@/lib/utils";

export default function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounterRef = useRef(0);

  const handleAddFile = useCallback((file: File) => {
    setFiles((prev) => [...prev, file]);
  }, []);

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const handleProcess = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setProgress(0);
    setError("");
    setResult(null);

    try {
      const res = await mergeVideos(files, setProgress);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Merge failed. Try different files.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setProgress(0);
    setError("");
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="8" height="7" rx="1" />
          <rect x="14" y="3" width="8" height="7" rx="1" />
          <rect x="5" y="14" width="14" height="7" rx="1" />
          <line x1="6" y1="10" x2="6" y2="14" />
          <line x1="18" y1="10" x2="18" y2="14" />
        </svg>
      }
      title="Merge Videos"
      description="Concatenate multiple video clips into one seamless file."
      accentColor="#6366f1"
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
                    {files.length} clip{files.length > 1 ? "s" : ""} — {formatFileSize(totalSize)}
                  </p>
                  <button
                    onClick={reset}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                {files.map((file, i) => (
                  <motion.div
                    key={`${file.name}-${i}`}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    draggable
                    onDragStart={(e) => {
                      setDragIndex(i);
                      (e as unknown as React.DragEvent).dataTransfer?.setData("text/plain", String(i));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null && dragIndex !== i) setDragOverIndex(i);
                    }}
                    onDragEnter={() => {
                      dragCounterRef.current++;
                      if (dragIndex !== null && dragIndex !== i) setDragOverIndex(i);
                    }}
                    onDragLeave={() => {
                      dragCounterRef.current--;
                      if (dragCounterRef.current === 0) setDragOverIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      dragCounterRef.current = 0;
                      if (dragIndex !== null && dragIndex !== i) {
                        setFiles((prev) => {
                          const arr = [...prev];
                          const [moved] = arr.splice(dragIndex, 1);
                          arr.splice(i, 0, moved);
                          return arr;
                        });
                      }
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDragIndex(null);
                      setDragOverIndex(null);
                      dragCounterRef.current = 0;
                    }}
                    className={`glass rounded-xl p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all ${
                      dragIndex === i ? "opacity-50 scale-95" : ""
                    } ${dragOverIndex === i ? "ring-2 ring-indigo-500/40" : ""}`}
                  >
                    {/* Drag handle + order number */}
                    <div className="flex items-center gap-2 shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600">
                        <circle cx="9" cy="5" r="1" fill="currentColor" />
                        <circle cx="15" cy="5" r="1" fill="currentColor" />
                        <circle cx="9" cy="12" r="1" fill="currentColor" />
                        <circle cx="15" cy="12" r="1" fill="currentColor" />
                        <circle cx="9" cy="19" r="1" fill="currentColor" />
                        <circle cx="15" cy="19" r="1" fill="currentColor" />
                      </svg>
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-400">{i + 1}</span>
                      </div>
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span className="px-1 py-0.5 rounded bg-white/5 font-medium">
                          {getExtension(file.name).replace(".", "").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveFile(i, -1)}
                        disabled={i === 0}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-20 disabled:cursor-default transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveFile(i, 1)}
                        disabled={i === files.length - 1}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-20 disabled:cursor-default transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveFile(i)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Drop zone for adding more files */}
            <DropZone
              onFile={handleAddFile}
              disabled={processing}
              label={files.length === 0 ? "Drop your first video clip" : "Drop another clip to add"}
            />

            {/* Info note */}
            {files.length > 0 && files.length < 2 && (
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span className="text-sm text-zinc-400">
                  Add at least <span className="text-indigo-400 font-medium">2 clips</span> to merge.
                  Use the arrows to reorder.
                </span>
              </div>
            )}

            {/* Process button */}
            {processing ? (
              <ProcessingScreen progress={progress} label="Merging videos..." />
            ) : (
              files.length >= 2 && (
                <button
                  onClick={handleProcess}
                  className="
                    w-full py-4 rounded-2xl font-semibold text-white text-base
                    bg-gradient-to-r from-indigo-500 to-violet-500
                    hover:from-indigo-400 hover:to-violet-400
                    active:scale-[0.98] transition-all duration-200
                    shadow-[0_0_30px_rgba(99,102,241,0.2)]
                  "
                >
                  Merge {files.length} Clips
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
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all"
            >
              Merge more videos
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
