"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { formatFileSize, formatDuration, getExtension } from "@/lib/utils";

interface FileInfoProps {
  file: File;
  onDurationLoaded?: (duration: number) => void;
  onRemove?: () => void;
  showPreview?: boolean;
}

export default function FileInfo({ file, onDurationLoaded, onRemove, showPreview = true }: FileInfoProps) {
  const [duration, setDuration] = useState<number | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [largeThumbnail, setLargeThumbnail] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [metadata, setMetadata] = useState<{ width: number; height: number } | null>(null);
  const [showMeta] = useState(true);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const previewRef = useRef<HTMLVideoElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);

  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      setDuration(video.duration);
      onDurationLoaded?.(video.duration);
      if (video.videoWidth && video.videoHeight) {
        setMetadata({ width: video.videoWidth, height: video.videoHeight });
      }
    };

    // Wait for actual frame data before seeking
    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, 160, 90);
        setThumbnail(canvas.toDataURL());
      }

      const bigCanvas = document.createElement("canvas");
      bigCanvas.width = Math.min(video.videoWidth, 640);
      bigCanvas.height = Math.min(video.videoHeight, 360);
      const bigCtx = bigCanvas.getContext("2d");
      if (bigCtx) {
        bigCtx.drawImage(video, 0, 0, bigCanvas.width, bigCanvas.height);
        setLargeThumbnail(bigCanvas.toDataURL("image/jpeg", 0.85));
      }

      URL.revokeObjectURL(url);
    };

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, onDurationLoaded]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleCanPlay = () => {
    setCanPlay(true);
  };

  const togglePlay = () => {
    if (!previewRef.current || !canPlay) return;
    if (isPlaying) {
      previewRef.current.pause();
    } else {
      previewRef.current.muted = false;
      previewRef.current.volume = 1;
      previewRef.current.play().catch(() => {
        setCanPlay(false);
      });
    }
  };

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current || !seekRef.current) return;
    const rect = seekRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    previewRef.current.currentTime = pct * previewDuration;
  }, [previewDuration]);

  const ext = getExtension(file.name).replace(".", "").toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full space-y-3"
    >
      {/* File details card */}
      <div className="w-full glass rounded-xl p-4 flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
          {thumbnail ? (
            <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate">{file.name}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
            <span>{formatFileSize(file.size)}</span>
            {ext && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="px-1.5 py-0.5 rounded bg-white/5 font-medium">{ext}</span>
              </>
            )}
            {duration !== null && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>{formatDuration(duration)}</span>
              </>
            )}
          </div>
        </div>

        {/* Change file button */}
        {onRemove && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRemove}
            className="flex-shrink-0 p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            title="Change file"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Video metadata panel */}
      {metadata && showMeta && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 grid grid-cols-3 gap-4"
        >
          <div className="text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Resolution</p>
            <p className="text-sm font-semibold text-zinc-200">{metadata.width}&times;{metadata.height}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Aspect Ratio</p>
            <p className="text-sm font-semibold text-zinc-200">
              {(() => {
                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
                const d = gcd(metadata.width, metadata.height);
                return `${metadata.width / d}:${metadata.height / d}`;
              })()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Bitrate</p>
            <p className="text-sm font-semibold text-zinc-200">
              {duration && duration > 0
                ? `${(file.size * 8 / duration / 1000).toFixed(0)} kbps`
                : "—"
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* Video preview player */}
      {showPreview && (
        <div className="w-full glass rounded-xl overflow-hidden">
          <div className="relative group cursor-pointer" onClick={togglePlay}>
            <video
              ref={previewRef}
              src={previewUrl}
              className="w-full object-contain bg-black/50"
              onCanPlay={handleCanPlay}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={(e) => setPreviewDuration((e.target as HTMLVideoElement).duration)}
              onTimeUpdate={(e) => setPreviewTime((e.target as HTMLVideoElement).currentTime)}
              preload="auto"
              playsInline
            />

            {/* Play/Pause overlay */}
            <div
              className={`
                absolute inset-0 flex items-center justify-center
                bg-black/20 transition-opacity duration-200
                ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}
              `}
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

          {/* Seek bar */}
          {previewDuration > 0 && (
            <div className="px-4 pb-3 pt-1">
              <div
                ref={seekRef}
                onClick={handleSeek}
                className="w-full h-1.5 rounded-full bg-white/10 cursor-pointer group/seek relative"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 relative"
                  style={{ width: `${(previewTime / previewDuration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-zinc-600 tabular-nums">{formatDuration(previewTime)}</span>
                <span className="text-[10px] text-zinc-600 tabular-nums">{formatDuration(previewDuration)}</span>
              </div>
            </div>
          )}

          {/* Label */}
          <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/5">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Preview</span>
            <span className="text-[11px] text-zinc-600">
              {canPlay
                ? `Click to ${isPlaying ? "pause" : "play"}`
                : "Preview not available for this format"
              }
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
