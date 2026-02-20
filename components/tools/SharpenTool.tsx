"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { sharpenVideo } from "@/lib/ffmpeg";
import { useToolProcessing } from "@/lib/processing-context";

const SHARPEN_PRESETS = [
  { value: 0.5, label: "Light" },
  { value: 1.5, label: "Medium" },
  { value: 3.0, label: "Strong" },
];

export default function SharpenTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [strength, setStrength] = useState(1.5);

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/sharpen");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file) return;
    startProcessing(file, "Sharpening video...", (onProgress) => sharpenVideo(file, strength, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setStrength(1.5);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      }
      title="Sharpen Video"
      description="Enhance clarity and sharpness of your video."
      accentColor="#f97316"
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

            {/* Strength slider */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Strength</span>
                  <span className="text-sm font-mono text-orange-400">{strength.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={strength}
                  onChange={(e) => setStrength(parseFloat(e.target.value))}
                  className="w-full accent-orange-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Light</span>
                  <span>Medium</span>
                  <span>Strong</span>
                </div>
              </div>
            </div>

            {/* Preset buttons */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">Presets</label>
              <div className="grid grid-cols-3 gap-2">
                {SHARPEN_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setStrength(preset.value)}
                    className={`
                      py-3 rounded-xl text-sm font-semibold transition-all border
                      ${strength === preset.value
                        ? "text-orange-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={strength === preset.value ? {
                      backgroundColor: "color-mix(in srgb, #f97316 15%, transparent)",
                      borderColor: "color-mix(in srgb, #f97316 40%, transparent)",
                    } : undefined}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-orange-500 to-amber-500
                hover:from-orange-400 hover:to-amber-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(249,115,22,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Sharpen Video
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="sharpen" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Sharpen another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
