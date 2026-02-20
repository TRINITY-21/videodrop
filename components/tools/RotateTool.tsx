"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { rotateVideo } from "@/lib/ffmpeg";
import { useToolProcessing } from "@/lib/processing-context";

type RotationValue = "90" | "180" | "270" | "hflip" | "vflip";

const ROTATION_OPTIONS: { value: RotationValue; label: string; icon: React.ReactNode }[] = [
  {
    value: "90",
    label: "90° Right",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  {
    value: "180",
    label: "180°",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" />
        <path d="M3.51 15a9 9 0 0 0 14.85 3.36L23 14" />
      </svg>
    ),
  },
  {
    value: "270",
    label: "90° Left",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.12-9.36L1 10" />
      </svg>
    ),
  },
  {
    value: "hflip",
    label: "Flip H",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="3" x2="12" y2="21" />
        <polyline points="8 8 4 12 8 16" />
        <polyline points="16 8 20 12 16 16" />
      </svg>
    ),
  },
  {
    value: "vflip",
    label: "Flip V",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="8 8 12 4 16 8" />
        <polyline points="8 16 12 20 16 16" />
      </svg>
    ),
  },
];

export default function RotateTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [rotation, setRotation] = useState<RotationValue>("90");
  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/rotate");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file) return;
    startProcessing(file, "Transforming video...", (onProgress) => rotateVideo(file, rotation, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
  };

  const selectedOpt = ROTATION_OPTIONS.find((o) => o.value === rotation);

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      }
      title="Rotate & Flip"
      description="Rotate 90°, 180°, 270° or flip your video horizontally and vertically."
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

            {/* Rotation options */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Transform
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ROTATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRotation(opt.value)}
                    className={`
                      py-4 rounded-xl text-xs font-semibold transition-all border
                      flex flex-col items-center gap-2
                      ${rotation === opt.value
                        ? "text-orange-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={rotation === opt.value ? {
                      backgroundColor: "color-mix(in srgb, #f97316 15%, transparent)",
                      borderColor: "color-mix(in srgb, #f97316 40%, transparent)",
                    } : undefined}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
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
              Apply {selectedOpt?.label}
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="rotate" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Transform another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
