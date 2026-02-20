"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { useToolProcessing } from "@/lib/processing-context";
import { addFade } from "@/lib/ffmpeg";

export default function FadeTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [fadeIn, setFadeIn] = useState(1);
  const [fadeOut, setFadeOut] = useState(1);
  const [videoDuration, setVideoDuration] = useState(0);

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/fade");

  const displayFile = file ?? jobFile;

  const handleDurationLoaded = useCallback((d: number) => {
    setVideoDuration(d);
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    startProcessing(file, "Applying fade...", (onProgress) => addFade(file, fadeIn, fadeOut, videoDuration, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setFadeIn(1);
    setFadeOut(1);
    setVideoDuration(0);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      }
      title="Fade In / Out"
      description="Add smooth fade-to-black transitions at the start and end."
      accentColor="#a78bfa"
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
            <FileInfo file={displayFile} onDurationLoaded={handleDurationLoaded} onRemove={reset} />

            {/* Fade In duration */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Fade In Duration</span>
                  <span className="text-sm font-mono text-violet-400">{fadeIn.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={fadeIn}
                  onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                  className="w-full accent-violet-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>0s</span>
                  <span>5s</span>
                </div>
              </div>
            </div>

            {/* Fade Out duration */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Fade Out Duration</span>
                  <span className="text-sm font-mono text-violet-400">{fadeOut.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={fadeOut}
                  onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                  className="w-full accent-violet-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>0s</span>
                  <span>5s</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-violet-400 to-purple-500
                hover:from-violet-300 hover:to-purple-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(167,139,250,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Apply Fade
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="fade" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Process another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
