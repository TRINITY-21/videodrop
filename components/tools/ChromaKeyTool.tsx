"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { chromaKey } from "@/lib/ffmpeg";
import { useToolProcessing } from "@/lib/processing-context";

const COLOR_PRESETS: { label: string; value: string }[] = [
  { label: "Green", value: "#00FF00" },
  { label: "Blue", value: "#0000FF" },
  { label: "Red", value: "#FF0000" },
];

export default function ChromaKeyTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [color, setColor] = useState("#00FF00");
  const [customColor, setCustomColor] = useState("#00FF00");
  const [similarity, setSimilarity] = useState(0.3);
  const [blend, setBlend] = useState(0.1);

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/chroma-key");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file) return;
    startProcessing(file, "Applying chroma key...", (onProgress) => chromaKey(file, color, similarity, blend, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setColor("#00FF00");
    setCustomColor("#00FF00");
    setSimilarity(0.3);
    setBlend(0.1);
  };

  const isPresetColor = COLOR_PRESETS.some((p) => p.value === color);

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="7" y="7" width="10" height="10" rx="1" />
          <path d="M3 3l4 4" />
          <path d="M21 3l-4 4" />
          <path d="M3 21l4-4" />
          <path d="M21 21l-4-4" />
        </svg>
      }
      title="Chroma Key"
      description="Remove green screen or any solid color background."
      accentColor="#22c55e"
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

            {/* Color presets */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">Key Color</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setColor(preset.value);
                      setCustomColor(preset.value);
                    }}
                    className={`
                      py-3 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-2
                      ${color === preset.value
                        ? "text-green-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={color === preset.value ? {
                      backgroundColor: "color-mix(in srgb, #22c55e 15%, transparent)",
                      borderColor: "color-mix(in srgb, #22c55e 40%, transparent)",
                    } : undefined}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.value }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom color picker */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Custom Color</span>
                  <span className="text-sm font-mono text-green-400">{color}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCustomColor(val);
                      setColor(val);
                    }}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCustomColor(val);
                      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                        setColor(val);
                      }
                    }}
                    placeholder="#00FF00"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-zinc-200 text-sm font-mono focus:outline-none focus:border-green-500/40 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Similarity slider */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Similarity</span>
                  <span className="text-sm font-mono text-green-400">{similarity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.5}
                  step={0.01}
                  value={similarity}
                  onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                  className="w-full accent-green-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Strict</span>
                  <span>Loose</span>
                </div>
              </div>
            </div>

            {/* Blend slider */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Blend</span>
                  <span className="text-sm font-mono text-green-400">{blend.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={0.3}
                  step={0.01}
                  value={blend}
                  onChange={(e) => setBlend(parseFloat(e.target.value))}
                  className="w-full accent-green-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Sharp</span>
                  <span>Smooth</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-green-500 to-emerald-500
                hover:from-green-400 hover:to-emerald-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(34,197,94,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Apply Chroma Key
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="chroma-key" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Process another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
