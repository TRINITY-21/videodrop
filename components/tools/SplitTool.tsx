"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { splitVideo, ProcessResult } from "@/lib/ffmpeg";

export default function SplitTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [segments, setSegments] = useState(2);
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
      const segs = await splitVideo(file, segments, videoDuration, (p) => setProgress(p));
      setResults(segs);
    } catch (e: any) {
      setError(e?.message || "Split failed");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResults([]);
    setProgress(0);
    setError("");
    setSegments(2);
    setVideoDuration(0);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5" />
          <path d="M8 3H3v5" />
          <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
          <path d="m15 9 6-6" />
        </svg>
      }
      title="Split Video"
      description="Divide your video into equal segments."
      accentColor="#6366f1"
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

            {/* Segment count */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Number of segments: <span className="text-indigo-400 font-mono">{segments}</span>
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSegments(count)}
                    className={`
                      flex-1 py-3 rounded-xl text-sm font-semibold transition-all border
                      ${segments === count
                        ? "text-indigo-300"
                        : "bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={segments === count ? {
                      backgroundColor: "color-mix(in srgb, #6366f1 15%, transparent)",
                      borderColor: "color-mix(in srgb, #6366f1 40%, transparent)",
                    } : undefined}
                  >
                    {count}
                  </button>
                ))}
              </div>
              {videoDuration > 0 && (
                <p className="text-[11px] text-zinc-600 mt-1">
                  ~{(videoDuration / segments).toFixed(1)}s each
                </p>
              )}
            </div>

            {processing ? (
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-zinc-400">Splitting video...</span>
                  <span className="text-sm font-mono text-indigo-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleProcess}
                className="
                  w-full py-4 rounded-2xl font-semibold text-white text-base
                  bg-gradient-to-r from-indigo-500 to-violet-500
                  hover:from-indigo-400 hover:to-violet-400
                  active:scale-[0.98] transition-all duration-200
                  shadow-[0_0_30px_rgba(99,102,241,0.2)]
                "
              >
                Split into {segments} Parts
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
            <div className="space-y-3">
              {results.map((r, i) => (
                <DownloadButton
                  key={i}
                  blob={r.blob}
                  filename={r.filename}
                  originalSize={file?.size || 0}
                />
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all"
            >
              Split another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
