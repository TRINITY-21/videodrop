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
import { applyFilters, FilterSettings } from "@/lib/ffmpeg";

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 1,
  grayscale: false,
};

export default function FiltersTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [filters, setFilters] = useState<FilterSettings>({ ...DEFAULT_FILTERS });

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/filters");

  const displayFile = file ?? jobFile;

  const updateFilter = <K extends keyof FilterSettings>(key: K, value: FilterSettings[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const handleProcess = async () => {
    if (!file) return;
    startProcessing(file, "Applying filters...", (onProgress) => applyFilters(file, filters, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setFilters({ ...DEFAULT_FILTERS });
  };

  const isDefault =
    filters.brightness === DEFAULT_FILTERS.brightness &&
    filters.contrast === DEFAULT_FILTERS.contrast &&
    filters.saturation === DEFAULT_FILTERS.saturation &&
    filters.grayscale === DEFAULT_FILTERS.grayscale;

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      }
      title="Filters & Adjustments"
      description="Adjust brightness, contrast, saturation and apply grayscale to your video."
      accentColor="#ec4899"
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

            {/* Filter controls */}
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">
                  Adjustments
                </label>
                {!isDefault && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Brightness */}
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Brightness</span>
                  <span className="text-sm font-mono text-pink-400">{filters.brightness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={filters.brightness}
                  onChange={(e) => updateFilter("brightness", parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              {/* Contrast */}
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Contrast</span>
                  <span className="text-sm font-mono text-pink-400">{filters.contrast.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={filters.contrast}
                  onChange={(e) => updateFilter("contrast", parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              {/* Saturation */}
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Saturation</span>
                  <span className="text-sm font-mono text-pink-400">{filters.saturation.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={filters.saturation}
                  onChange={(e) => updateFilter("saturation", parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              {/* Grayscale toggle */}
              <button
                onClick={() => updateFilter("grayscale", !filters.grayscale)}
                className={`
                  w-full py-3.5 rounded-xl text-sm font-semibold transition-all border
                  ${filters.grayscale
                    ? "text-pink-300"
                    : "bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5"
                  }
                `}
                style={filters.grayscale ? {
                  backgroundColor: "color-mix(in srgb, #ec4899 15%, transparent)",
                  borderColor: "color-mix(in srgb, #ec4899 40%, transparent)",
                } : undefined}
              >
                {filters.grayscale ? "Grayscale On" : "Grayscale Off"}
              </button>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-pink-500 to-rose-500
                hover:from-pink-400 hover:to-rose-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(236,72,153,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Apply Filters
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="filters" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Apply filters to another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
