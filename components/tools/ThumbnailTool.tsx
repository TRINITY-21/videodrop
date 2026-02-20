"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import DownloadButton from "@/components/DownloadButton";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { useToolProcessing } from "@/lib/processing-context";
import { generateThumbnail } from "@/lib/ffmpeg";

type ThumbnailMode = "auto" | "manual";

export default function ThumbnailTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [mode, setMode] = useState<ThumbnailMode>("auto");
  const [timestamp, setTimestamp] = useState(0);

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/thumbnail");

  const displayFile = file ?? jobFile;

  const handleProcess = async () => {
    if (!file) return;
    startProcessing(file, "Generating thumbnail...", (onProgress) => generateThumbnail(file, mode, timestamp, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setMode("auto");
    setTimestamp(0);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      }
      title="Thumbnail Generator"
      description="Extract the perfect thumbnail from your video."
      accentColor="#eab308"
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

            {/* Mode selector */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">Capture Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("auto")}
                  className={`
                    flex-1 py-3 rounded-xl text-sm font-semibold transition-all border
                    ${mode === "auto"
                      ? "text-yellow-300"
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                    }
                  `}
                  style={mode === "auto" ? {
                    backgroundColor: "color-mix(in srgb, #eab308 15%, transparent)",
                    borderColor: "color-mix(in srgb, #eab308 40%, transparent)",
                  } : undefined}
                >
                  <div>Auto</div>
                  <div className="text-[10px] opacity-60 mt-0.5">Best frame</div>
                </button>
                <button
                  onClick={() => setMode("manual")}
                  className={`
                    flex-1 py-3 rounded-xl text-sm font-semibold transition-all border
                    ${mode === "manual"
                      ? "text-yellow-300"
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                    }
                  `}
                  style={mode === "manual" ? {
                    backgroundColor: "color-mix(in srgb, #eab308 15%, transparent)",
                    borderColor: "color-mix(in srgb, #eab308 40%, transparent)",
                  } : undefined}
                >
                  <div>Manual</div>
                  <div className="text-[10px] opacity-60 mt-0.5">Pick time</div>
                </button>
              </div>
            </div>

            {/* Mode description */}
            <div className="w-full">
              <div
                className="rounded-xl px-4 py-3 text-sm font-medium text-center transition-all border"
                style={{
                  backgroundColor: "color-mix(in srgb, #eab308 10%, transparent)",
                  borderColor: "color-mix(in srgb, #eab308 30%, transparent)",
                  color: "#facc15",
                }}
              >
                {mode === "auto"
                  ? "Automatically picks the most representative frame"
                  : "Choose exact timestamp to capture"}
              </div>
            </div>

            {/* Timestamp input (manual mode only) */}
            {mode === "manual" && (
              <div className="w-full">
                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Timestamp (seconds)</span>
                    <span className="text-sm font-mono text-yellow-400">{timestamp}s</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={timestamp}
                    onChange={(e) => setTimestamp(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-yellow-500 to-amber-500
                hover:from-yellow-400 hover:to-amber-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(234,179,8,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Generate Thumbnail
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
              Process another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
