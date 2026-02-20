"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { flipVideo } from "@/lib/ffmpeg";
import { useToolProcessing } from "@/lib/processing-context";

type FlipDirection = "horizontal" | "vertical" | "both";

const FLIP_OPTIONS: { value: FlipDirection; label: string }[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
  { value: "both", label: "Both" },
];

export default function FlipTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [direction, setDirection] = useState<"horizontal" | "vertical" | "both">("horizontal");
  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/flip");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file) return;
    startProcessing(file, "Flipping video...", (onProgress) => flipVideo(file, direction, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
  };

  const selectedOpt = FLIP_OPTIONS.find((o) => o.value === direction);

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" />
          <path d="M16 7l4 5-4 5" />
          <path d="M8 7L4 12l4 5" />
        </svg>
      }
      title="Flip / Mirror"
      description="Mirror your video horizontally, vertically, or both."
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

            {/* Direction selector */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Direction: <span className="text-violet-400 font-mono">{selectedOpt?.label}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FLIP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDirection(opt.value)}
                    className={`
                      py-3.5 rounded-xl text-sm font-semibold transition-all border
                      ${direction === opt.value
                        ? "text-violet-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={direction === opt.value ? {
                      backgroundColor: "color-mix(in srgb, #8b5cf6 15%, transparent)",
                      borderColor: "color-mix(in srgb, #8b5cf6 40%, transparent)",
                    } : undefined}
                  >
                    <div className="text-base">{opt.label}</div>
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
              Flip {selectedOpt?.label}
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="flip" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Process another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
