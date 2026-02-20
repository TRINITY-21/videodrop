"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";

interface BeforeAfterProps {
  originalFile: File;
  outputBlob: Blob;
  outputFilename: string;
}

export default function BeforeAfter({
  originalFile,
  outputBlob,
  outputFilename,
}: BeforeAfterProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(0);
  const [canPlay, setCanPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLVideoElement>(null);
  const afterRef = useRef<HTMLVideoElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);

  const originalUrl = useMemo(() => URL.createObjectURL(originalFile), [originalFile]);
  const outputUrl = useMemo(() => URL.createObjectURL(outputBlob), [outputBlob]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(originalUrl);
      URL.revokeObjectURL(outputUrl);
    };
  }, [originalUrl, outputUrl]);

  const isVideo =
    originalFile.type.startsWith("video/") &&
    (outputBlob.type.startsWith("video/") ||
      /\.(mp4|webm|mov|ogg|avi|mkv)$/i.test(outputFilename));

  // Seek videos to frame 0 when metadata loads so they show a thumbnail
  const handleBeforeLoaded = useCallback(() => {
    setReady((r) => r + 1);
    if (beforeRef.current) beforeRef.current.currentTime = 0.01;
  }, []);

  const handleAfterLoaded = useCallback(() => {
    setReady((r) => r + 1);
    if (afterRef.current) afterRef.current.currentTime = 0.01;
  }, []);

  // Track when both videos can actually play
  const canPlayCount = useRef(0);
  const handleCanPlay = useCallback(() => {
    canPlayCount.current += 1;
    if (canPlayCount.current >= 2) setCanPlay(true);
  }, []);

  // Timeout: dismiss loading overlay after 3s even if metadata doesn't fire
  useEffect(() => {
    const t = setTimeout(() => setReady((r) => Math.max(r, 2)), 3000);
    return () => clearTimeout(t);
  }, []);

  const syncPlay = useCallback(() => {
    if (!beforeRef.current || !afterRef.current) return;
    beforeRef.current.currentTime = afterRef.current.currentTime;
    // Play both muted first (always allowed by browser autoplay policy)
    beforeRef.current.muted = true;
    afterRef.current.muted = true;
    const bPlay = beforeRef.current.play().catch(() => {});
    const aPlay = afterRef.current
      .play()
      .then(() => {
        // Unmute the processed video for audio after play succeeds
        if (afterRef.current) {
          afterRef.current.muted = false;
          afterRef.current.volume = 1;
        }
      })
      .catch(() => {});
    Promise.all([bPlay, aPlay]).then(() => setIsPlaying(true));
  }, []);

  const syncPause = useCallback(() => {
    beforeRef.current?.pause();
    afterRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    isPlaying ? syncPause() : syncPlay();
  }, [isPlaying, syncPause, syncPlay]);

  // Keep videos in sync + track time
  useEffect(() => {
    const after = afterRef.current;
    if (!after) return;
    const onTimeUpdate = () => {
      setCurrentTime(after.currentTime);
      if (
        beforeRef.current &&
        Math.abs(beforeRef.current.currentTime - after.currentTime) > 0.3
      ) {
        beforeRef.current.currentTime = after.currentTime;
      }
    };
    const onEnded = () => setIsPlaying(false);
    const onMeta = () => setDuration(after.duration);
    after.addEventListener("timeupdate", onTimeUpdate);
    after.addEventListener("ended", onEnded);
    after.addEventListener("loadedmetadata", onMeta);
    return () => {
      after.removeEventListener("timeupdate", onTimeUpdate);
      after.removeEventListener("ended", onEnded);
      after.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!afterRef.current || !beforeRef.current || !seekRef.current) return;
      const rect = seekRef.current.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      const time = pct * duration;
      afterRef.current.currentTime = time;
      beforeRef.current.currentTime = time;
      setCurrentTime(time);
    },
    [duration]
  );

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  // Drag handled on the container itself, not on children
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only handle drag on the container background, not on the play button
      setIsDragging(true);
      updatePosition(e.clientX);
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isVideo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full glass rounded-xl overflow-hidden"
    >
      <div
        ref={containerRef}
        className="relative w-full select-none cursor-col-resize"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* After (bottom layer — full, always visible) */}
        <video
          ref={afterRef}
          src={outputUrl}
          className="w-full object-contain bg-black pointer-events-none"
          playsInline
          preload="auto"
          muted
          onLoadedMetadata={handleAfterLoaded}
          onCanPlay={handleCanPlay}
        />

        {/* Before (top layer — clipped via clip-path) */}
        <video
          ref={beforeRef}
          src={originalUrl}
          className="absolute inset-0 w-full h-full object-contain bg-black pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          playsInline
          preload="auto"
          muted
          onLoadedMetadata={handleBeforeLoaded}
          onCanPlay={handleCanPlay}
        />

        {/* Loading state */}
        {ready < 2 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30 pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Loading videos...
            </div>
          </div>
        )}

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 z-10 pointer-events-none"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-0.5 h-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#18181b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="8 4 4 8 8 12" />
              <polyline points="16 4 20 8 16 12" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-2.5 left-3 z-20 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-medium text-zinc-300 uppercase tracking-wider pointer-events-none">
          Original
        </div>
        <div className="absolute top-2.5 right-3 z-20 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-medium text-zinc-300 uppercase tracking-wider pointer-events-none">
          Processed
        </div>

        {/* Play/pause pill button — high z-index, stops pointer propagation */}
        <div
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <button className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-[11px] font-medium text-zinc-200 hover:bg-black/90 transition-colors flex items-center gap-2 cursor-pointer">
            {isPlaying ? (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="white"
                stroke="none"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="white"
                stroke="none"
              >
                <polygon points="8 5 20 12 8 19" />
              </svg>
            )}
            {isPlaying ? "Pause" : "Play"} both
          </button>
        </div>

        {/* Format warning for unplayable videos */}
        {ready >= 2 && !canPlay && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 pointer-events-none whitespace-nowrap">
            Preview may not work for this format
          </div>
        )}
      </div>

      {/* Seek bar */}
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
            <span className="text-[10px] text-zinc-600 tabular-nums">
              {formatDuration(currentTime)}
            </span>
            <span className="text-[10px] text-zinc-600 tabular-nums">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Label */}
      <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/5">
        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
          Before / After
        </span>
        <span className="text-[11px] text-zinc-600">
          Drag to compare &middot; Click to{" "}
          {isPlaying ? "pause" : "play"}
        </span>
      </div>
    </motion.div>
  );
}
