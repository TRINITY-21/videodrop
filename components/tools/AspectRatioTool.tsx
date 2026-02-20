"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { changeAspectRatio } from "@/lib/ffmpeg";
import { useToolProcessing } from "@/lib/processing-context";

type AspectPreset = { label: string; w: number; h: number };

const ASPECT_PRESETS: AspectPreset[] = [
  { label: "16:9", w: 1920, h: 1080 },
  { label: "9:16", w: 1080, h: 1920 },
  { label: "4:3", w: 1440, h: 1080 },
  { label: "1:1", w: 1080, h: 1080 },
  { label: "21:9", w: 2560, h: 1080 },
];

export default function AspectRatioTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedPreset, setSelectedPreset] = useState(0);

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/aspect-ratio");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file) return;
    const preset = ASPECT_PRESETS[selectedPreset];
    startProcessing(file, "Changing aspect ratio...", (onProgress) => changeAspectRatio(file, preset.w, preset.h, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setSelectedPreset(0);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 4l4 4" />
          <path d="M22 4l-4 4" />
          <path d="M2 20l4-4" />
          <path d="M22 20l-4-4" />
        </svg>
      }
      title="Aspect Ratio"
      description="Change your video's aspect ratio with letterboxing."
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
            <FileInfo file={displayFile} onRemove={reset} />

            {/* Aspect ratio presets */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() => setSelectedPreset(i)}
                    className={`
                      py-4 rounded-xl text-sm font-semibold transition-all border
                      ${selectedPreset === i
                        ? "text-violet-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={selectedPreset === i ? {
                      backgroundColor: "color-mix(in srgb, #8b5cf6 15%, transparent)",
                      borderColor: "color-mix(in srgb, #8b5cf6 40%, transparent)",
                    } : undefined}
                  >
                    <div className="text-base">{preset.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">
                      {preset.w} x {preset.h}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-violet-500 to-purple-500
                hover:from-violet-400 hover:to-purple-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(139,92,246,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Change Aspect Ratio
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="aspect-ratio" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Change aspect ratio of another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
