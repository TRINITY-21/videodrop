"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import ProcessingScreen from "@/components/ProcessingScreen";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { extractFrames, ProcessResult } from "@/lib/ffmpeg";
import { formatFileSize } from "@/lib/utils";

export default function FrameExtractTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [timestamp, setTimestamp] = useState(0);
  const [frameCount, setFrameCount] = useState(4);
  const [videoDuration, setVideoDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [error, setError] = useState("");

  const handleDurationLoaded = useCallback((d: number) => {
    setVideoDuration(d);
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError("");
    setResults([]);

    try {
      const res = await extractFrames(file, String(timestamp), frameCount, setProgress);
      if (res.length === 0) {
        setError("No frames could be extracted. Try a different timestamp.");
      } else {
        setResults(res);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Frame extraction failed. Try a different file.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadFrame = (result: ProcessResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    results.forEach((result) => {
      downloadFrame(result);
    });
  };

  const reset = () => {
    setFile(null);
    setResults([]);
    setProgress(0);
    setError("");
    setTimestamp(0);
    setFrameCount(4);
    setVideoDuration(0);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <line x1="2" y1="8" x2="22" y2="8" />
          <line x1="2" y1="16" x2="22" y2="16" />
          <line x1="8" y1="2" x2="8" y2="22" />
          <line x1="16" y1="2" x2="16" y2="22" />
        </svg>
      }
      title="Extract Frames"
      description="Capture still frames from any video. Choose a start time and how many frames to grab."
      accentColor="#a855f7"
    >
      <AnimatePresence mode="wait">
        {!file && results.length === 0 && (
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

        {file && results.length === 0 && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <FileInfo file={file} onDurationLoaded={handleDurationLoaded} onRemove={reset} />

            {/* Timestamp */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Start at: <span className="text-purple-400 font-mono">{timestamp.toFixed(1)}s</span>
              </label>
              <input
                type="range"
                min={0}
                max={Math.max(0, videoDuration - 1)}
                step={0.1}
                value={timestamp}
                onChange={(e) => setTimestamp(parseFloat(e.target.value))}
                className="w-full accent-purple-400"
              />
              {videoDuration > 0 && (
                <p className="text-[11px] text-zinc-600 mt-1">
                  Video duration: {videoDuration.toFixed(1)}s
                </p>
              )}
            </div>

            {/* Frame count */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Frames to extract: <span className="text-purple-400 font-mono">{frameCount}</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 4, 6, 8, 10].map((count) => (
                  <button
                    key={count}
                    onClick={() => setFrameCount(count)}
                    className={`
                      flex-1 py-3 rounded-xl text-sm font-semibold transition-all border
                      ${frameCount === count
                        ? "text-purple-300"
                        : "bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={frameCount === count ? {
                      backgroundColor: "color-mix(in srgb, #a855f7 15%, transparent)",
                      borderColor: "color-mix(in srgb, #a855f7 40%, transparent)",
                    } : undefined}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-600 mt-1">
                Frames are extracted 0.5s apart starting from the timestamp
              </p>
            </div>

            {processing ? (
              <ProcessingScreen progress={progress} label="Extracting frames..." />
            ) : (
              <button
                onClick={handleProcess}
                className="
                  w-full py-4 rounded-2xl font-semibold text-white text-base
                  bg-gradient-to-r from-purple-500 to-fuchsia-500
                  hover:from-purple-400 hover:to-fuchsia-400
                  active:scale-[0.98] transition-all duration-200
                  shadow-[0_0_30px_rgba(168,85,247,0.2)]
                "
              >
                Extract Frames
              </button>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="space-y-5"
          >
            {/* Frame grid */}
            <div className="grid grid-cols-2 gap-3">
              {results.map((result, i) => (
                <div
                  key={i}
                  className="glass rounded-xl overflow-hidden border border-white/8"
                >
                  <img
                    src={URL.createObjectURL(result.blob)}
                    alt={`Frame ${i + 1}`}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-300 font-medium truncate">
                        Frame {i + 1}
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        {formatFileSize(result.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadFrame(result)}
                      className="
                        flex-shrink-0 p-2 rounded-lg bg-white/5 border border-white/8
                        hover:bg-white/10 transition-all text-purple-400
                      "
                      title={`Download ${result.filename}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Download all */}
            <button
              onClick={downloadAll}
              className="
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-purple-500 to-fuchsia-500
                hover:from-purple-400 hover:to-fuchsia-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(168,85,247,0.2)]
                flex items-center justify-center gap-2
              "
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download All ({results.length} frame{results.length !== 1 ? "s" : ""})
            </button>

            {/* Reset */}
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all"
            >
              Extract from another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
