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
import { pictureInPicture } from "@/lib/ffmpeg";
import { formatFileSize } from "@/lib/utils";

type PiPPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const POSITION_OPTIONS: { value: PiPPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

export default function PiPTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [position, setPosition] = useState<PiPPosition>("bottom-right");
  const [scale, setScale] = useState(0.25);

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/pip");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file || !overlayFile) return;
    startProcessing(
      file,
      "Creating PiP...",
      (onProgress) => pictureInPicture(file, overlayFile!, position, scale, onProgress)
    );
  };

  const reset = () => {
    setFile(null);
    setOverlayFile(null);
    clearResult();
    setPosition("bottom-right");
    setScale(0.25);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <rect x="12" y="9" width="8" height="6" rx="1" ry="1" />
        </svg>
      }
      title="Picture-in-Picture"
      description="Overlay a small video on top of another."
      accentColor="#7c3aed"
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

            {/* Overlay video file input */}
            <label className="block w-full p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/30 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setOverlayFile(f);
                }}
                className="hidden"
              />
              {overlayFile ? (
                <div>
                  <p className="text-sm text-violet-400 font-medium">{overlayFile.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{formatFileSize(overlayFile.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-zinc-400">Drop or select an overlay video</p>
                  <p className="text-xs text-zinc-600 mt-1">MP4, MOV, WebM, AVI</p>
                </div>
              )}
            </label>

            {/* Position selector */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Position: <span className="text-violet-400 font-mono">{POSITION_OPTIONS.find((p) => p.value === position)?.label}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {POSITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPosition(opt.value)}
                    className={`
                      py-3 rounded-xl text-sm font-semibold transition-all border
                      ${position === opt.value
                        ? "text-violet-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={position === opt.value ? {
                      backgroundColor: "color-mix(in srgb, #7c3aed 15%, transparent)",
                      borderColor: "color-mix(in srgb, #7c3aed 40%, transparent)",
                    } : undefined}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale slider */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Overlay Scale</span>
                  <span className="text-sm font-mono text-violet-400">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.5}
                  step={0.05}
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>10%</span>
                  <span>30%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={!overlayFile || hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-violet-500 to-purple-500
                hover:from-violet-400 hover:to-purple-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(124,58,237,0.2)]
                ${(!overlayFile || hasActiveJob) ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Create PiP Video
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="pip" />
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
