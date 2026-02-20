"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTime } from "@/lib/utils";

interface TrimTimelineProps {
  file: File;
  startTime: number;
  endTime: number;
  duration: number;
  onStartChange: (t: number) => void;
  onEndChange: (t: number) => void;
}

export default function TrimTimeline({
  file,
  startTime,
  endTime,
  duration,
  onStartChange,
  onEndChange,
}: TrimTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // Generate timeline thumbnails
  useEffect(() => {
    if (!duration || duration <= 0) return;

    const count = 10;
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    const url = URL.createObjectURL(file);
    video.src = url;

    const frames: string[] = [];
    let idx = 0;

    video.onloadeddata = () => {
      const seekNext = () => {
        if (idx >= count) {
          setThumbnails(frames);
          URL.revokeObjectURL(url);
          return;
        }
        video.currentTime = (idx / count) * duration;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 80;
        canvas.height = 45;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, 80, 45);
          frames.push(canvas.toDataURL());
        }
        idx++;
        seekNext();
      };

      seekNext();
    };

    return () => URL.revokeObjectURL(url);
  }, [file, duration]);

  const getPositionFromMouse = useCallback(
    (clientX: number): number => {
      if (!trackRef.current || duration <= 0) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handleMouseDown = useCallback(
    (handle: "start" | "end") => (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(handle);
    },
    []
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pos = getPositionFromMouse(e.clientX);
      if (dragging === "start") {
        onStartChange(Math.min(pos, endTime - 0.1));
      } else {
        onEndChange(Math.max(pos, startTime + 0.1));
      }
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, startTime, endTime, getPositionFromMouse, onStartChange, onEndChange]);

  // Touch support
  useEffect(() => {
    if (!dragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const pos = getPositionFromMouse(touch.clientX);
      if (dragging === "start") {
        onStartChange(Math.min(pos, endTime - 0.1));
      } else {
        onEndChange(Math.max(pos, startTime + 0.1));
      }
    };

    const handleTouchEnd = () => setDragging(null);

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging, startTime, endTime, getPositionFromMouse, onStartChange, onEndChange]);

  const startPct = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPct = duration > 0 ? (endTime / duration) * 100 : 100;

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-zinc-300 mb-3 block">
        Trim Range
      </label>

      {/* Timeline track */}
      <div className="relative" ref={trackRef}>
        {/* Thumbnails strip */}
        <div className="w-full h-16 rounded-xl overflow-hidden flex bg-white/5">
          {thumbnails.length > 0
            ? thumbnails.map((t, i) => (
                <img
                  key={i}
                  src={t}
                  alt=""
                  className="h-full flex-1 object-cover"
                  draggable={false}
                />
              ))
            : Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-full flex-1 bg-white/[0.03] border-r border-white/5 last:border-r-0" />
              ))}
        </div>

        {/* Dim regions outside selection */}
        <div
          className="absolute top-0 left-0 h-16 bg-black/60 rounded-l-xl pointer-events-none"
          style={{ width: `${startPct}%` }}
        />
        <div
          className="absolute top-0 right-0 h-16 bg-black/60 rounded-r-xl pointer-events-none"
          style={{ width: `${100 - endPct}%` }}
        />

        {/* Selected region border */}
        <div
          className="absolute top-0 h-16 border-2 border-amber-400/80 rounded-sm pointer-events-none"
          style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
        />

        {/* Start handle */}
        <div
          className={`
            absolute top-0 h-16 w-4 cursor-col-resize z-10
            flex items-center justify-center
            ${dragging === "start" ? "opacity-100" : "opacity-90 hover:opacity-100"}
          `}
          style={{ left: `calc(${startPct}% - 8px)` }}
          onMouseDown={handleMouseDown("start")}
          onTouchStart={() => setDragging("start")}
        >
          <div className="w-1 h-10 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        </div>

        {/* End handle */}
        <div
          className={`
            absolute top-0 h-16 w-4 cursor-col-resize z-10
            flex items-center justify-center
            ${dragging === "end" ? "opacity-100" : "opacity-90 hover:opacity-100"}
          `}
          style={{ left: `calc(${endPct}% - 8px)` }}
          onMouseDown={handleMouseDown("end")}
          onTouchStart={() => setDragging("end")}
        >
          <div className="w-1 h-10 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        </div>
      </div>

      {/* Time labels */}
      <div className="flex items-center justify-between mt-3">
        <div className="glass rounded-lg px-3 py-1.5">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Start</span>
          <span className="text-sm font-mono text-amber-400 font-medium">{formatTime(startTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-zinc-400 font-medium">{formatTime(endTime - startTime)}</span>
        </div>
        <div className="glass rounded-lg px-3 py-1.5 text-right">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">End</span>
          <span className="text-sm font-mono text-amber-400 font-medium">{formatTime(endTime)}</span>
        </div>
      </div>

      {/* Hidden video for seeking */}
      <video ref={videoRef} src={previewUrl} className="hidden" preload="metadata" />
    </div>
  );
}
