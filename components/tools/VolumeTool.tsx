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
import { adjustVolume } from "@/lib/ffmpeg";

const VOLUME_PRESETS = [
  { value: 0, label: "Mute" },
  { value: 0.5, label: "50%" },
  { value: 1, label: "100%" },
  { value: 1.5, label: "150%" },
  { value: 2, label: "200%" },
  { value: 3, label: "300%" },
];

export default function VolumeTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [volume, setVolume] = useState(1.0);

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/volume");

  const displayFile = file ?? jobFile;

  const handleProcess = async () => {
    if (!file) return;
    startProcessing(file, "Adjusting volume...", (onProgress) => adjustVolume(file, volume, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setVolume(1.0);
  };

  const volumePercent = Math.round(volume * 100);
  const isBoosting = volume > 1;
  const isReducing = volume < 1;
  const isMuted = volume === 0;

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          {isMuted ? (
            <>
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : isReducing ? (
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          ) : (
            <>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </>
          )}
        </svg>
      }
      title="Adjust Volume"
      description="Boost or reduce your video's audio volume."
      accentColor="#22d3ee"
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

            {/* Volume slider */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Volume</span>
                  <span className="text-sm font-mono text-cyan-400">{volumePercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Mute</span>
                  <span>100%</span>
                  <span>300%</span>
                </div>
              </div>
            </div>

            {/* Visual indicator */}
            <div className="w-full">
              <div
                className="rounded-xl px-4 py-3 text-sm font-medium text-center transition-all border"
                style={{
                  backgroundColor: isMuted
                    ? "color-mix(in srgb, #ef4444 10%, transparent)"
                    : isBoosting
                    ? "color-mix(in srgb, #22d3ee 10%, transparent)"
                    : isReducing
                    ? "color-mix(in srgb, #f59e0b 10%, transparent)"
                    : "color-mix(in srgb, #22d3ee 5%, transparent)",
                  borderColor: isMuted
                    ? "color-mix(in srgb, #ef4444 30%, transparent)"
                    : isBoosting
                    ? "color-mix(in srgb, #22d3ee 30%, transparent)"
                    : isReducing
                    ? "color-mix(in srgb, #f59e0b 30%, transparent)"
                    : "color-mix(in srgb, #22d3ee 15%, transparent)",
                  color: isMuted ? "#f87171" : isBoosting ? "#67e8f9" : isReducing ? "#fbbf24" : "#a1a1aa",
                }}
              >
                {isMuted
                  ? "Audio will be completely muted"
                  : isBoosting
                  ? `Boosting audio by ${volumePercent - 100}%`
                  : isReducing
                  ? `Reducing audio by ${100 - volumePercent}%`
                  : "Original volume (no change)"}
              </div>
            </div>

            {/* Preset buttons */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">Presets</label>
              <div className="grid grid-cols-3 gap-2">
                {VOLUME_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setVolume(preset.value)}
                    className={`
                      py-3 rounded-xl text-sm font-semibold transition-all border
                      ${volume === preset.value
                        ? "text-cyan-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={volume === preset.value ? {
                      backgroundColor: "color-mix(in srgb, #22d3ee 15%, transparent)",
                      borderColor: "color-mix(in srgb, #22d3ee 40%, transparent)",
                    } : undefined}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-cyan-400 to-teal-500
                hover:from-cyan-300 hover:to-teal-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(34,211,238,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Set Volume to {volumePercent}%
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="volume" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Process another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
