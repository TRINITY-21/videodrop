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
import { splitScreenVideo } from "@/lib/ffmpeg";
import { formatFileSize } from "@/lib/utils";

type SplitLayout = "horizontal" | "vertical";

const LAYOUT_OPTIONS: { value: SplitLayout; label: string }[] = [
  { value: "horizontal", label: "Side by Side" },
  { value: "vertical", label: "Top & Bottom" },
];

export default function SplitScreenTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);
  const [secondFile, setSecondFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [layout, setLayout] = useState<SplitLayout>("horizontal");

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/split-screen");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file || !secondFile) return;
    startProcessing(
      file,
      "Creating split screen...",
      (onProgress) => splitScreenVideo(file, secondFile!, layout, onProgress)
    );
  };

  const reset = () => {
    setFile(null);
    setSecondFile(null);
    clearResult();
    setLayout("horizontal");
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      }
      title="Split Screen"
      description="Place two videos side by side or stacked."
      accentColor="#6366f1"
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

            {/* Second video file input */}
            <label className="block w-full p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/30 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSecondFile(f);
                }}
                className="hidden"
              />
              {secondFile ? (
                <div>
                  <p className="text-sm text-indigo-400 font-medium">{secondFile.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{formatFileSize(secondFile.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-zinc-400">Drop or select the second video</p>
                  <p className="text-xs text-zinc-600 mt-1">MP4, MOV, WebM, AVI</p>
                </div>
              )}
            </label>

            {/* Layout selector */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Layout: <span className="text-indigo-400 font-mono">{LAYOUT_OPTIONS.find((l) => l.value === layout)?.label}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LAYOUT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLayout(opt.value)}
                    className={`
                      py-3 rounded-xl text-sm font-semibold transition-all border
                      ${layout === opt.value
                        ? "text-indigo-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={layout === opt.value ? {
                      backgroundColor: "color-mix(in srgb, #6366f1 15%, transparent)",
                      borderColor: "color-mix(in srgb, #6366f1 40%, transparent)",
                    } : undefined}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={!secondFile || hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-indigo-500 to-blue-500
                hover:from-indigo-400 hover:to-blue-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(99,102,241,0.2)]
                ${(!secondFile || hasActiveJob) ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Create Split Screen
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
            <DownloadButton
              blob={result.blob}
              filename={result.filename}
              originalSize={displayFile?.size || 0}
              originalFile={displayFile || undefined}
            />
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="split-screen" />
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all"
            >
              Process another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
