"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import TrimTimeline from "@/components/TrimTimeline";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { useToolProcessing } from "@/lib/processing-context";
import { trimVideo } from "@/lib/ffmpeg";
import { formatTime } from "@/lib/utils";

export default function TrimTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [duration, setDuration] = useState(0);
  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/trim");
  const displayFile = file ?? jobFile;

  const handleDurationLoaded = useCallback((d: number) => {
    setDuration(d);
    setEndTime(Math.min(d, 30));
  }, []);

  const handleProcess = () => {
    if (!file) return;
    startProcessing(
      file,
      "Trimming video...",
      (onProgress) => trimVideo(file, formatTime(startTime), formatTime(endTime), onProgress)
    );
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setStartTime(0);
    setEndTime(30);
    setDuration(0);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      }
      title="Trim & Cut"
      description="Cut out the exact clip you need. Drag the handles to set your range."
      accentColor="#f59e0b"
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
            <FileInfo file={displayFile} onDurationLoaded={handleDurationLoaded} onRemove={reset} showPreview={false} />

            {duration > 0 && (
              <TrimTimeline
                file={displayFile}
                startTime={startTime}
                endTime={endTime}
                duration={duration}
                onStartChange={setStartTime}
                onEndChange={setEndTime}
              />
            )}

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-amber-500 to-orange-500
                hover:from-amber-400 hover:to-orange-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(245,158,11,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Trim Video
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="trim" />
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all"
            >
              Trim another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
