"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { useToolProcessing } from "@/lib/processing-context";
import { videoToWebP } from "@/lib/ffmpeg";

export default function WebPTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [fps, setFps] = useState(15);
  const [width, setWidth] = useState(480);
  const [startTime, setStartTime] = useState("0");
  const [duration, setDuration] = useState("5");

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/webp");

  const displayFile = file ?? jobFile;

  const handleProcess = async () => {
    if (!file) return;
    startProcessing(file, "Converting to WebP...", (onProgress) => videoToWebP(file, fps, width, startTime, duration, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setFps(15);
    setWidth(480);
    setStartTime("0");
    setDuration("5");
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      }
      title="Video to WebP"
      description="Convert your video to an animated WebP image."
      accentColor="#a855f7"
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

            {/* FPS slider */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Frame Rate</span>
                  <span className="text-sm font-mono text-purple-400">{fps} FPS</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full accent-purple-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>5 FPS</span>
                  <span>15 FPS</span>
                  <span>30 FPS</span>
                </div>
              </div>
            </div>

            {/* Width slider */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Output Width</span>
                  <span className="text-sm font-mono text-purple-400">{width}px</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={800}
                  step={50}
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full accent-purple-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>200px</span>
                  <span>500px</span>
                  <span>800px</span>
                </div>
              </div>
            </div>

            {/* Start time input */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Start Time (seconds)</span>
                  <span className="text-sm font-mono text-purple-400">{startTime}s</span>
                </div>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Duration input */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Duration (seconds)</span>
                  <span className="text-sm font-mono text-purple-400">{duration}s</span>
                </div>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-purple-500 to-fuchsia-500
                hover:from-purple-400 hover:to-fuchsia-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(168,85,247,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Convert to WebP
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
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Convert another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
