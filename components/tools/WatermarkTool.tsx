"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { useToolProcessing } from "@/lib/processing-context";
import { addWatermark } from "@/lib/ffmpeg";

type WatermarkPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

const POSITION_OPTIONS: { value: WatermarkPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

const COLOR_OPTIONS = [
  { value: "white", label: "White", hex: "#ffffff" },
  { value: "black", label: "Black", hex: "#000000" },
  { value: "red", label: "Red", hex: "#ef4444" },
  { value: "yellow", label: "Yellow", hex: "#eab308" },
];

export default function WatermarkTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [text, setText] = useState("VideoDrop");
  const [position, setPosition] = useState<"top-left" | "top-right" | "bottom-left" | "bottom-right" | "center">("bottom-right");
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState("white");

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/watermark");

  const displayFile = file ?? jobFile;

  const handleProcess = async () => {
    if (!file) return;
    startProcessing(file, "Adding watermark...", (onProgress) => addWatermark(file, text, position, fontSize, color, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setText("VideoDrop");
    setPosition("bottom-right");
    setFontSize(24);
    setColor("white");
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      }
      title="Add Watermark"
      description="Overlay text on your video. Perfect for branding and copyright."
      accentColor="#f59e0b"
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
            <FileInfo file={displayFile} onRemove={reset} />

            {/* Watermark text */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Watermark Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter watermark text..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-colors"
              />
            </div>

            {/* Position selector */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Position: <span className="text-amber-400 font-mono">{POSITION_OPTIONS.find((p) => p.value === position)?.label}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {POSITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPosition(opt.value)}
                    className={`
                      py-3 rounded-xl text-sm font-semibold transition-all border
                      ${position === opt.value
                        ? "text-amber-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={position === opt.value ? {
                      backgroundColor: "color-mix(in srgb, #f59e0b 15%, transparent)",
                      borderColor: "color-mix(in srgb, #f59e0b 40%, transparent)",
                    } : undefined}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size slider */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Font Size</span>
                  <span className="text-sm font-mono text-amber-400">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={16}
                  max={72}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Color picker */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">Color</label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setColor(opt.value)}
                    className={`
                      flex-1 py-3 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-2
                      ${color === opt.value
                        ? "text-amber-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={color === opt.value ? {
                      backgroundColor: "color-mix(in srgb, #f59e0b 15%, transparent)",
                      borderColor: "color-mix(in srgb, #f59e0b 40%, transparent)",
                    } : undefined}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: opt.hex }}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-amber-500 to-orange-500
                hover:from-amber-400 hover:to-orange-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(245,158,11,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Add Watermark
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="watermark" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Process another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
