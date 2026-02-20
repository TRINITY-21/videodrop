"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { denoiseVideo } from "@/lib/ffmpeg";
import { useToolProcessing } from "@/lib/processing-context";

type DenoiseStrength = "light" | "medium" | "heavy";

const DENOISE_OPTIONS: { value: DenoiseStrength; label: string; desc: string }[] = [
  { value: "light", label: "Light", desc: "Subtle noise reduction" },
  { value: "medium", label: "Medium", desc: "Balanced cleanup" },
  { value: "heavy", label: "Heavy", desc: "Maximum smoothing" },
];

export default function DenoiseTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [strength, setStrength] = useState<DenoiseStrength>("medium");

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/denoise");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file) return;
    startProcessing(file, "Denoising video...", (onProgress) => denoiseVideo(file, strength, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setStrength("medium");
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.5 3.2 3.5.5-2.5 2.5.6 3.5L12 11l-3.1 1.7.6-3.5L7 6.7l3.5-.5L12 3z" />
          <path d="M5 17l.8 1.6 1.8.3-1.3 1.2.3 1.8L5 21l-1.6.9.3-1.8-1.3-1.2 1.8-.3L5 17z" />
          <path d="M19 14l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.2 1.8-.3L19 14z" />
        </svg>
      }
      title="Denoise Video"
      description="Remove visual noise and grain from your footage."
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

            {/* Strength selector */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Denoise Strength
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DENOISE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStrength(opt.value)}
                    className={`
                      py-3.5 rounded-xl text-sm font-semibold transition-all border
                      ${strength === opt.value
                        ? "text-cyan-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={strength === opt.value ? {
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
              Denoise Video
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="denoise" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Denoise another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
