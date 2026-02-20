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
import { burnSubtitles } from "@/lib/ffmpeg";
import { formatFileSize } from "@/lib/utils";

export default function SubtitleTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/subtitles");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file || !subtitleFile) return;
    startProcessing(
      file,
      "Burning subtitles...",
      (onProgress) => burnSubtitles(file, subtitleFile!, onProgress)
    );
  };

  const reset = () => {
    setFile(null);
    setSubtitleFile(null);
    clearResult();
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="14" x2="23" y2="14" />
          <path d="M5 18h2" />
          <path d="M9 18h5" />
          <path d="M16 18h3" />
        </svg>
      }
      title="Burn Subtitles"
      description="Hardcode SRT subtitles into your video permanently."
      accentColor="#fb923c"
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

            {/* Subtitle file input */}
            <label className="block w-full p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-orange-500/30 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept=".srt,.ass,.ssa,.vtt"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSubtitleFile(f);
                }}
                className="hidden"
              />
              {subtitleFile ? (
                <div>
                  <p className="text-sm text-orange-400 font-medium">{subtitleFile.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{formatFileSize(subtitleFile.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-zinc-400">Drop or select a subtitle file</p>
                  <p className="text-xs text-zinc-600 mt-1">SRT, ASS, SSA, VTT</p>
                </div>
              )}
            </label>

            <button
              onClick={handleProcess}
              disabled={!subtitleFile || hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-orange-500 to-amber-500
                hover:from-orange-400 hover:to-amber-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(251,146,60,0.2)]
                ${(!subtitleFile || hasActiveJob) ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Burn Subtitles
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="subtitles" />
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
