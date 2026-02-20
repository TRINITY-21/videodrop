"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { resizeVideo } from "@/lib/ffmpeg";
import { useToolProcessing } from "@/lib/processing-context";

const PRESETS = [
  { label: "1080p", desc: "Full HD", width: 1920, height: 1080 },
  { label: "720p", desc: "HD", width: 1280, height: 720 },
  { label: "480p", desc: "SD", width: 854, height: 480 },
  { label: "360p", desc: "Low", width: 640, height: 360 },
];

export default function ResizeTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [selected, setSelected] = useState(1); // default 720p
  const [customWidth, setCustomWidth] = useState("1280");
  const [customHeight, setCustomHeight] = useState("720");
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [localError, setLocalError] = useState("");
  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/resize");
  const displayFile = file ?? jobFile;

  const handleWidthChange = (val: string) => {
    setCustomWidth(val);
    if (lockAspect && val) {
      const w = parseInt(val);
      if (!isNaN(w) && w > 0) {
        setCustomHeight(String(Math.round(w / aspectRatio)));
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setCustomHeight(val);
    if (lockAspect && val) {
      const h = parseInt(val);
      if (!isNaN(h) && h > 0) {
        setCustomWidth(String(Math.round(h * aspectRatio)));
      }
    }
  };

  const handleProcess = () => {
    if (!file) return;
    setLocalError("");
    let w: number, h: number;
    if (mode === "preset") {
      const preset = PRESETS[selected];
      w = preset.width;
      h = preset.height;
    } else {
      w = parseInt(customWidth) || 1280;
      h = parseInt(customHeight) || 720;
      if (w < 16 || h < 16 || w > 7680 || h > 4320) {
        setLocalError("Resolution must be between 16x16 and 7680x4320.");
        return;
      }
      w = w % 2 === 0 ? w : w + 1;
      h = h % 2 === 0 ? h : h + 1;
    }
    startProcessing(file, "Resizing video...", (onProgress) => resizeVideo(file, w, h, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setLocalError("");
  };

  const getButtonLabel = () => {
    if (mode === "preset") return `Resize to ${PRESETS[selected].label}`;
    const w = parseInt(customWidth) || 0;
    const h = parseInt(customHeight) || 0;
    return `Resize to ${w}x${h}`;
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6" />
          <path d="M9 21H3v-6" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
        </svg>
      }
      title="Resize Video"
      description="Scale your video to any resolution. Perfect for social media and uploading."
      accentColor="#8b5cf6"
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
            <FileInfo
              file={displayFile}
              onRemove={reset}
              onDurationLoaded={() => {}}
            />

            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode("preset")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                  mode === "preset"
                    ? "text-purple-300 bg-purple-500/10 border-purple-500/30"
                    : "text-zinc-500 border-white/5 hover:bg-white/5"
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setMode("custom")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                  mode === "custom"
                    ? "text-purple-300 bg-purple-500/10 border-purple-500/30"
                    : "text-zinc-500 border-white/5 hover:bg-white/5"
                }`}
              >
                Custom Size
              </button>
            </div>

            {mode === "preset" ? (
              <div className="w-full">
                <label className="text-sm font-medium text-zinc-300 mb-3 block">
                  Output Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset, i) => (
                    <button
                      key={preset.label}
                      onClick={() => setSelected(i)}
                      className={`
                        py-4 rounded-xl text-sm font-semibold transition-all border
                        ${selected === i
                          ? "text-purple-300"
                          : "bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5"
                        }
                      `}
                      style={selected === i ? {
                        backgroundColor: "color-mix(in srgb, #8b5cf6 15%, transparent)",
                        borderColor: "color-mix(in srgb, #8b5cf6 40%, transparent)",
                      } : undefined}
                    >
                      <div className="text-base">{preset.label}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">
                        {preset.width} x {preset.height} — {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full space-y-3">
                <label className="text-sm font-medium text-zinc-300 block">
                  Custom Resolution
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1 block">Width</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      min={16}
                      max={7680}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-zinc-200 text-sm font-mono focus:outline-none focus:border-purple-500/40 transition-colors"
                      placeholder="1280"
                    />
                  </div>

                  <button
                    onClick={() => setLockAspect((v) => !v)}
                    className={`mt-5 p-2 rounded-lg transition-colors ${
                      lockAspect ? "text-purple-400 bg-purple-500/10" : "text-zinc-600 hover:text-zinc-400"
                    }`}
                    title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {lockAspect ? (
                        <>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </>
                      ) : (
                        <>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        </>
                      )}
                    </svg>
                  </button>

                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1 block">Height</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      min={16}
                      max={4320}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-zinc-200 text-sm font-mono focus:outline-none focus:border-purple-500/40 transition-colors"
                      placeholder="720"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600">
                  Dimensions will be adjusted to even numbers for H.264 compatibility.
                </p>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-purple-500 to-indigo-500
                hover:from-purple-400 hover:to-indigo-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(139,92,246,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {getButtonLabel()}
            </button>

            {(error || localError) && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error || localError}
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="resize" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Resize another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
