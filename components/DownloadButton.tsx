"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { formatFileSize, formatDuration } from "@/lib/utils";
import SuccessConfetti from "@/components/SuccessConfetti";
import BeforeAfter from "@/components/BeforeAfter";

interface DownloadButtonProps {
  blob: Blob;
  filename: string;
  originalSize: number;
  originalFile?: File;
}

export default function DownloadButton({
  blob,
  filename,
  originalSize,
  originalFile,
}: DownloadButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);
  const previewUrl = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleDownload = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleShare = async () => {
    if (!navigator.share) return;
    const file = new File([blob], filename, { type: blob.type });
    try {
      await navigator.share({ files: [file], title: filename });
    } catch {
      // User cancelled or share failed
    }
  };

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.muted = false;
      mediaRef.current.volume = 1;
      mediaRef.current.play().catch(() => {});
    }
  };

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mediaRef.current || !seekRef.current) return;
    const rect = seekRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    mediaRef.current.currentTime = pct * duration;
  }, [duration]);

  const newSize = blob.size;
  const saved = originalSize > 0 ? Math.round((1 - newSize / originalSize) * 100) : 0;
  const isSmaller = newSize < originalSize;

  const isVideo = blob.type.startsWith("video/") || /\.(mp4|webm|mov|ogg)$/i.test(filename);
  const isAudio = blob.type.startsWith("audio/") || /\.(mp3|wav|aac|ogg|flac)$/i.test(filename);
  const isGif = /\.gif$/i.test(filename);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full space-y-3 relative"
    >
      <SuccessConfetti trigger={true} />

      {/* Video preview — BeforeAfter comparison when originalFile available, else standalone */}
      {isVideo && originalFile && (
        <BeforeAfter originalFile={originalFile} outputBlob={blob} outputFilename={filename} />
      )}
      {isVideo && !originalFile && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="relative group cursor-pointer" onClick={togglePlay}>
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={previewUrl}
              className="w-full object-contain bg-black/50"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
              playsInline
              preload="auto"
            />
            <div
              className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200 ${
                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
              >
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
                    <polygon points="8 5 20 12 8 19" />
                  </svg>
                )}
              </motion.div>
            </div>
          </div>
          {duration > 0 && (
            <div className="px-4 pb-3 pt-1">
              <div
                ref={seekRef}
                onClick={handleSeek}
                className="w-full h-1.5 rounded-full bg-white/10 cursor-pointer group/seek relative"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 relative"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-zinc-600 tabular-nums">{formatDuration(currentTime)}</span>
                <span className="text-[10px] text-zinc-600 tabular-nums">{formatDuration(duration)}</span>
              </div>
            </div>
          )}
          <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/5">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Output Preview</span>
            <span className="text-[11px] text-zinc-600">Click to {isPlaying ? "pause" : "play"}</span>
          </div>
        </div>
      )}
      {isGif && (
        <div className="glass rounded-xl overflow-hidden">
          <img
            src={previewUrl}
            alt="Output preview"
            className="w-full object-contain bg-black/50"
          />
          <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/5">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Output Preview</span>
            <span className="text-[11px] text-zinc-600">Animated GIF</span>
          </div>
        </div>
      )}

      {isAudio && (
        <div className="glass rounded-xl p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-3">Output Preview</p>
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={previewUrl}
            controls
            className="w-full h-10"
            preload="auto"
          />
        </div>
      )}

      {/* Size comparison */}
      {originalSize > 0 && (
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-400">{formatFileSize(originalSize)}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <span className="text-zinc-200 font-semibold">
              {formatFileSize(newSize)}
            </span>
          </div>
          {isSmaller && saved > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
              className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400"
            >
              {saved}% smaller
            </motion.span>
          )}
        </div>
      )}

      {/* Download button */}
      <motion.button
        onClick={handleDownload}
        whileHover={{ scale: 1.02, boxShadow: "0 0 50px rgba(52,211,153,0.3)" }}
        whileTap={{ scale: 0.98 }}
        className="
          w-full py-4 rounded-2xl font-semibold text-white
          bg-gradient-to-r from-emerald-500 to-teal-500
          hover:from-emerald-400 hover:to-teal-400
          transition-colors duration-200
          shadow-glow-emerald
          flex flex-col items-center gap-1.5
        "
      >
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="text-base">Download</span>
        </div>
        <span className="text-xs font-medium text-white/60 max-w-full truncate px-4">{filename}</span>
      </motion.button>

      {/* Share button */}
      {canShare && (
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      )}
    </motion.div>
  );
}
