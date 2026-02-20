"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProcessingScreen from "@/components/ProcessingScreen";
import ToolPageLayout from "@/components/ToolPageLayout";
import { compressVideo, convertVideo, removeAudio, ProcessResult } from "@/lib/ffmpeg";
import { formatFileSize } from "@/lib/utils";
import { ACCEPTED_VIDEO_TYPES, MAX_FILE_SIZE } from "@/lib/formats";

type Operation = "compress" | "convert" | "remove-audio";

interface BatchFileItem {
  file: File;
  status: "pending" | "processing" | "done" | "error";
  result?: ProcessResult;
  error?: string;
}

const OPERATIONS: { key: Operation; label: string; desc: string; color: string }[] = [
  { key: "compress", label: "Compress", desc: "Reduce file size (medium quality)", color: "#3b82f6" },
  { key: "convert", label: "Convert to MP4", desc: "Re-encode all files to MP4", color: "#3b82f6" },
  { key: "remove-audio", label: "Remove Audio", desc: "Strip audio from all files", color: "#f43f5e" },
];

export default function BatchTool() {
  const [files, setFiles] = useState<BatchFileItem[]>([]);
  const [operation, setOperation] = useState<Operation>("compress");
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const items: BatchFileItem[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const f = newFiles[i];
      if (f.size > MAX_FILE_SIZE) continue;
      if (
        !ACCEPTED_VIDEO_TYPES.includes(f.type) &&
        !f.name.match(/\.(mp4|mov|avi|webm|mkv|wmv|3gp|flv)$/i)
      ) continue;
      items.push({ file: f, status: "pending" });
    }
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const removeFile = (index: number) => {
    if (processing) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "done") continue;
      setCurrentIndex(i);
      setProgress(0);
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "processing" } : f))
      );

      try {
        let result: ProcessResult;
        switch (operation) {
          case "compress":
            result = await compressVideo(files[i].file, "medium", setProgress);
            break;
          case "convert":
            result = await convertVideo(files[i].file, "mp4", setProgress);
            break;
          case "remove-audio":
            result = await removeAudio(files[i].file, setProgress);
            break;
        }
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "done", result } : f))
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error", error: err instanceof Error ? err.message : "Processing failed" }
              : f
          )
        );
      }
    }

    setProcessing(false);
    setCurrentIndex(-1);
  };

  const handleDownload = (item: BatchFileItem) => {
    if (!item.result) return;
    const url = URL.createObjectURL(item.result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.result.filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadAll = () => {
    files.forEach((f) => {
      if (f.status === "done") handleDownload(f);
    });
  };

  const reset = () => {
    setFiles([]);
    setCurrentIndex(-1);
    setProgress(0);
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const allDone = doneCount === files.length && files.length > 0;
  const totalOriginal = files.reduce((a, f) => a + f.file.size, 0);
  const totalOutput = files.reduce((a, f) => a + (f.result?.size || 0), 0);

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="16" height="12" rx="2" />
          <rect x="6" y="3" width="16" height="12" rx="2" />
        </svg>
      }
      title="Batch Process"
      description="Process multiple videos at once. Drop them all in, pick an operation, and go."
      accentColor="#6366f1"
    >
      <AnimatePresence mode="wait">
        {files.length === 0 ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              animate={isDragging ? { scale: 1.03 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`
                relative group cursor-pointer w-full rounded-2xl p-12 grain
                ${isDragging
                  ? "border-2 border-indigo-400/50 bg-indigo-500/10"
                  : "border-2 border-dashed border-white/10 hover:border-indigo-400/30 hover:bg-surface-1"
                }
              `}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <motion.div
                  animate={isDragging ? { y: 0, scale: 1.1 } : { y: [0, -10, 0] }}
                  transition={isDragging ? { type: "spring" } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                    isDragging ? "bg-indigo-500/20" : "bg-surface-1 group-hover:bg-surface-2"
                  }`}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isDragging ? "#818cf8" : "#6366f1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="16" height="12" rx="2" />
                    <rect x="6" y="3" width="16" height="12" rx="2" />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-lg font-semibold text-zinc-200">
                    Drop multiple videos here
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    or <span className="text-indigo-400 font-medium">browse files</span>
                  </p>
                </div>
                <p className="text-xs text-zinc-600">
                  Select multiple files — up to 2GB each
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
                className="hidden"
              />
            </motion.div>
          </motion.div>
        ) : !allDone ? (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* File list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </span>
                {!processing && (
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    + Add more
                  </button>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
                className="hidden"
              />
              <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                {files.map((item, i) => (
                  <div
                    key={`${item.file.name}-${i}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl glass text-sm ${
                      item.status === "processing"
                        ? "border border-indigo-500/30"
                        : item.status === "done"
                        ? "border border-emerald-500/20"
                        : item.status === "error"
                        ? "border border-red-500/20"
                        : "border border-transparent"
                    }`}
                  >
                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      {item.status === "pending" && (
                        <div className="w-2 h-2 rounded-full bg-zinc-600" />
                      )}
                      {item.status === "processing" && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full"
                        />
                      )}
                      {item.status === "done" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {item.status === "error" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 truncate">{item.file.name}</p>
                      <p className="text-[11px] text-zinc-600">
                        {formatFileSize(item.file.size)}
                        {item.result && (
                          <span className="text-emerald-400 ml-2">
                            → {formatFileSize(item.result.size)}
                          </span>
                        )}
                        {item.error && (
                          <span className="text-red-400 ml-2">{item.error}</span>
                        )}
                      </p>
                    </div>

                    {!processing && item.status === "pending" && (
                      <button
                        onClick={() => removeFile(i)}
                        className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}

                    {item.status === "done" && (
                      <button
                        onClick={() => handleDownload(item)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Operation selector */}
            {!processing && (
              <div className="w-full">
                <label className="text-sm font-medium text-zinc-300 mb-3 block">
                  Operation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATIONS.map((op) => (
                    <button
                      key={op.key}
                      onClick={() => setOperation(op.key)}
                      className={`
                        py-3.5 px-2 rounded-xl text-xs font-semibold transition-all border
                        flex flex-col items-center gap-1
                        ${operation === op.key
                          ? "text-indigo-300"
                          : "bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5"
                        }
                      `}
                      style={operation === op.key ? {
                        backgroundColor: "color-mix(in srgb, #6366f1 15%, transparent)",
                        borderColor: "color-mix(in srgb, #6366f1 40%, transparent)",
                      } : undefined}
                    >
                      <span>{op.label}</span>
                      <span className="text-[10px] opacity-60">{op.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Processing */}
            {processing ? (
              <div className="space-y-3">
                <ProcessingScreen
                  progress={progress}
                  label={`Processing file ${currentIndex + 1} of ${files.length}...`}
                />
                <p className="text-xs text-zinc-600 text-center">
                  {doneCount} of {files.length} complete
                </p>
              </div>
            ) : (
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
                Process {files.length} File{files.length > 1 ? "s" : ""}
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="space-y-5"
          >
            {/* Summary */}
            <div className="glass rounded-xl p-5 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-lg font-semibold text-zinc-200">
                  All {files.length} files processed
                </span>
              </div>
              {totalOutput > 0 && totalOriginal > totalOutput && (
                <p className="text-sm text-zinc-400">
                  {formatFileSize(totalOriginal)} → {formatFileSize(totalOutput)}
                  <span className="text-emerald-400 font-semibold ml-2">
                    ({Math.round((1 - totalOutput / totalOriginal) * 100)}% saved)
                  </span>
                </p>
              )}
            </div>

            {/* File results */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {files.map((item, i) => (
                <div
                  key={`${item.file.name}-${i}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl glass"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">{item.result?.filename || item.file.name}</p>
                    <p className="text-[11px] text-zinc-600">
                      {formatFileSize(item.file.size)}
                      {item.result && (
                        <span className="text-emerald-400 ml-2">→ {formatFileSize(item.result.size)}</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>

            {/* Download all */}
            <button
              onClick={downloadAll}
              className="
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-emerald-500 to-teal-500
                hover:from-emerald-400 hover:to-teal-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(52,211,153,0.2)]
                flex items-center justify-center gap-2.5
              "
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download All ({files.length} files)
            </button>

            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all"
            >
              Process more videos
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
