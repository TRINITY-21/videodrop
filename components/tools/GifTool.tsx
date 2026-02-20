"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { useToolProcessing } from "@/lib/processing-context";
import { videoToGif } from "@/lib/ffmpeg";
import { formatTime } from "@/lib/utils";

const FPS_OPTIONS = [
  { value: 10, label: "10 FPS", desc: "Smaller file" },
  { value: 15, label: "15 FPS", desc: "Balanced" },
  { value: 24, label: "24 FPS", desc: "Smooth" },
];

const SIZE_OPTIONS = [
  { value: 320, label: "320px", desc: "Small" },
  { value: 480, label: "480px", desc: "Medium" },
  { value: 640, label: "640px", desc: "Large" },
];

export default function GifTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [fps, setFps] = useState(15);
  const [width, setWidth] = useState(480);
  const [startSec, setStartSec] = useState(0);
  const [durationSec, setDurationSec] = useState(5);
  const [videoDuration, setVideoDuration] = useState(0);

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/gif");

  const displayFile = file ?? jobFile;

  const handleDurationLoaded = useCallback((d: number) => {
    setVideoDuration(d);
    setDurationSec(Math.min(d, 10));
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    startProcessing(file, "Creating GIF...", (onProgress) => videoToGif(file, formatTime(startSec), formatTime(durationSec), fps, width, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setStartSec(0);
    setDurationSec(5);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <path d="M10 9.5L8 8H6v8h2l2-1.5" />
          <path d="M14 8h4v3h-3" />
          <line x1="18" y1="12" x2="18" y2="16" />
        </svg>
      }
      title="Video to GIF"
      description="Convert any video clip into a perfect GIF. Control size, FPS, and duration."
      accentColor="#f472b6"
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
            <FileInfo file={displayFile} onDurationLoaded={handleDurationLoaded} onRemove={reset} />

            {/* Start time */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Start at: <span className="text-pink-400 font-mono">{formatTime(startSec)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={Math.max(0, videoDuration - 1)}
                step={0.1}
                value={startSec}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setStartSec(v);
                  if (v + durationSec > videoDuration) {
                    setDurationSec(Math.max(0.5, videoDuration - v));
                  }
                }}
                className="w-full accent-pink-400"
              />
            </div>

            {/* Duration */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Duration: <span className="text-pink-400 font-mono">{durationSec.toFixed(1)}s</span>
              </label>
              <input
                type="range"
                min={0.5}
                max={Math.min(30, videoDuration - startSec)}
                step={0.5}
                value={durationSec}
                onChange={(e) => setDurationSec(parseFloat(e.target.value))}
                className="w-full accent-pink-400"
              />
              <p className="text-[11px] text-zinc-600 mt-1">Recommended: under 10s for best file size</p>
            </div>

            {/* FPS */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">Frame Rate</label>
              <div className="flex gap-2">
                {FPS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFps(opt.value)}
                    className={`
                      flex-1 py-3 rounded-xl text-sm font-semibold transition-all border
                      ${fps === opt.value
                        ? "border-pink-500/40 text-pink-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={fps === opt.value ? {
                      backgroundColor: "color-mix(in srgb, #f472b6 15%, transparent)",
                      borderColor: "color-mix(in srgb, #f472b6 40%, transparent)",
                    } : undefined}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Width */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">Output Width</label>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setWidth(opt.value)}
                    className={`
                      flex-1 py-3 rounded-xl text-sm font-semibold transition-all border
                      ${width === opt.value
                        ? "border-pink-500/40 text-pink-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={width === opt.value ? {
                      backgroundColor: "color-mix(in srgb, #f472b6 15%, transparent)",
                      borderColor: "color-mix(in srgb, #f472b6 40%, transparent)",
                    } : undefined}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-pink-500 to-rose-500
                hover:from-pink-400 hover:to-rose-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(244,114,182,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Create GIF
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
            <DownloadButton blob={result.blob} filename={result.filename} originalSize={displayFile?.size || 0} originalFile={displayFile || undefined} />
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="gif" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Create another GIF
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
