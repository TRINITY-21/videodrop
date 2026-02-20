"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ACCEPTED_VIDEO_TYPES, MAX_FILE_SIZE, WARN_FILE_SIZE } from "@/lib/formats";
import { formatFileSize } from "@/lib/utils";
import { isFFmpegLoaded } from "@/lib/ffmpeg";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  accept?: string;
  label?: string;
}

export default function DropZone({ onFile, disabled, accept, label }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform?.toUpperCase().includes("MAC") || navigator.userAgent?.includes("Mac"));
    if (isFFmpegLoaded()) { setFfmpegReady(true); return; }
    const interval = setInterval(() => {
      if (isFFmpegLoaded()) { setFfmpegReady(true); clearInterval(interval); }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError("");
      setWarning("");

      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large (${formatFileSize(file.size)}). Max 2GB.`);
        return false;
      }

      if (
        !ACCEPTED_VIDEO_TYPES.includes(file.type) &&
        !file.name.match(/\.(mp4|mov|avi|webm|mkv|wmv|3gp|flv)$/i)
      ) {
        setError("Unsupported format. Try MP4, MOV, AVI, WebM, or MKV.");
        return false;
      }

      if (file.size > WARN_FILE_SIZE) {
        setWarning(
          `Large file (${formatFileSize(file.size)}). Processing may take a while.`
        );
      }

      return true;
    },
    []
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFile(file);
      }
    },
    [validateFile, onFile]
  );

  // Handle paste from clipboard
  useEffect(() => {
    if (disabled) return;
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files || []).find((f) =>
        f.type.startsWith("video/")
      );
      if (file) {
        e.preventDefault();
        handleFile(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [disabled, handleFile]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        animate={
          isDragging
            ? {
                scale: 1.03,
                boxShadow: "0 0 40px rgba(59,130,246,0.3), 0 0 80px rgba(59,130,246,0.1)",
              }
            : {
                scale: 1,
                boxShadow: "0 0 0px rgba(59,130,246,0)",
              }
        }
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`
          relative group cursor-pointer w-full rounded-2xl p-12
          grain
          ${
            isDragging
              ? "border-2 border-blue-400/50 bg-blue-500/10"
              : "border-2 border-dashed border-white/10 hover:border-blue-400/30 hover:bg-surface-1"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          {/* Upload icon */}
          <motion.div
            animate={
              isDragging
                ? { y: 0, scale: 1.1 }
                : { y: [0, -10, 0] }
            }
            transition={
              isDragging
                ? { type: "spring", stiffness: 300, damping: 15 }
                : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center
              transition-colors duration-300
              ${isDragging ? "gradient-bg" : "bg-surface-1 group-hover:bg-surface-2"}
            `}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDragging ? "white" : "#3b82f6"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </motion.div>

          <AnimatePresence mode="wait">
            {isDragging ? (
              <motion.p
                key="dragging"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="text-lg font-semibold text-blue-300"
              >
                Release to drop!
              </motion.p>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <p className="text-lg font-semibold text-zinc-200">
                    {label || "Drop your video here"}
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    or{" "}
                    <span className="text-blue-400 font-medium">browse files</span>
                  </p>
                </div>
                <p className="text-xs text-zinc-600 mt-4">
                  MP4, MOV, AVI, WebM, MKV — up to 2GB
                </p>
                <p className="text-[11px] text-zinc-700 mt-2 flex items-center justify-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 font-mono text-[10px] text-zinc-500">
                    {isMac ? "⌘" : "Ctrl"}
                  </kbd>
                  <span>+</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 font-mono text-[10px] text-zinc-500">
                    V
                  </kbd>
                  <span className="text-zinc-600 ml-0.5">to paste from clipboard</span>
                </p>
                {!ffmpegReady && (
                  <div className="flex items-center justify-center gap-2 mt-3" role="status" aria-live="polite">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span className="text-[11px] text-zinc-600">Loading video engine...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept || "video/*"}
          onChange={handleInput}
          className="hidden"
          disabled={disabled}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
        {warning && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400"
          >
            {warning}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
