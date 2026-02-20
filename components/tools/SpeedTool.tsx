"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { changeSpeed } from "@/lib/ffmpeg";
import { useToolProcessing } from "@/lib/processing-context";

const SPEED_OPTIONS = [
  { value: 0.25, label: "0.25x", desc: "Super Slow" },
  { value: 0.5, label: "0.5x", desc: "Slow Motion" },
  { value: 1.5, label: "1.5x", desc: "Faster" },
  { value: 2, label: "2x", desc: "Double Speed" },
  { value: 3, label: "3x", desc: "Triple Speed" },
  { value: 4, label: "4x", desc: "Hyper Speed" },
];

export default function SpeedTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [speed, setSpeed] = useState(2);
  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/speed");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file) return;
    startProcessing(file, "Changing speed...", (onProgress) => changeSpeed(file, speed, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
  };

  const selectedOpt = SPEED_OPTIONS.find((o) => o.value === speed);

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      }
      title="Change Speed"
      description="Speed up or slow down your video. Create slow-mo, timelapse, or fast-forward effects."
      accentColor="#06b6d4"
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

            {/* Speed selector */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Speed: <span className="text-cyan-400 font-mono">{selectedOpt?.label}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSpeed(opt.value)}
                    className={`
                      py-3.5 rounded-xl text-sm font-semibold transition-all border
                      ${speed === opt.value
                        ? "text-cyan-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={speed === opt.value ? {
                      backgroundColor: "color-mix(in srgb, #06b6d4 15%, transparent)",
                      borderColor: "color-mix(in srgb, #06b6d4 40%, transparent)",
                    } : undefined}
                  >
                    <div className="text-base">{opt.label}</div>
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
                bg-gradient-to-r from-cyan-500 to-sky-500
                hover:from-cyan-400 hover:to-sky-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(6,182,212,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Apply {selectedOpt?.label} Speed
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="speed" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Change speed of another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
