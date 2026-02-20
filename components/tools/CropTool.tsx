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
import { cropVideo } from "@/lib/ffmpeg";

const CROP_PRESETS = [
  { label: "16:9", desc: "Widescreen", ratio: 16 / 9 },
  { label: "4:3", desc: "Classic", ratio: 4 / 3 },
  { label: "1:1", desc: "Square", ratio: 1 },
  { label: "9:16", desc: "Vertical", ratio: 9 / 16 },
];

export default function CropTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);
  const [cropW, setCropW] = useState("");
  const [cropH, setCropH] = useState("");
  const [cropX, setCropX] = useState("");
  const [cropY, setCropY] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [localError, setLocalError] = useState("");

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/crop");

  const displayFile = file ?? jobFile;

  // Load video dimensions via hidden video element
  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      setVideoWidth(video.videoWidth);
      setVideoHeight(video.videoHeight);
      setCropW(String(video.videoWidth));
      setCropH(String(video.videoHeight));
      setCropX("0");
      setCropY("0");
      URL.revokeObjectURL(url);
    };

    video.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const applyPreset = (index: number) => {
    if (!videoWidth || !videoHeight) return;

    setSelectedPreset(index);
    const { ratio } = CROP_PRESETS[index];

    let w: number;
    let h: number;

    if (ratio >= videoWidth / videoHeight) {
      // Width-constrained
      w = videoWidth;
      h = Math.round(videoWidth / ratio);
    } else {
      // Height-constrained
      h = videoHeight;
      w = Math.round(videoHeight * ratio);
    }

    // Ensure even dimensions for h264
    w = w % 2 === 0 ? w : w - 1;
    h = h % 2 === 0 ? h : h - 1;

    // Center the crop
    const x = Math.round((videoWidth - w) / 2);
    const y = Math.round((videoHeight - h) / 2);

    setCropW(String(w));
    setCropH(String(h));
    setCropX(String(x));
    setCropY(String(y));
  };

  const handleProcess = async () => {
    if (!file) return;
    setLocalError("");

    const w = parseInt(cropW) || 0;
    const h = parseInt(cropH) || 0;
    const x = parseInt(cropX) || 0;
    const y = parseInt(cropY) || 0;

    if (w < 16 || h < 16) {
      setLocalError("Crop dimensions must be at least 16x16.");
      return;
    }

    if (videoWidth && videoHeight) {
      if (x + w > videoWidth || y + h > videoHeight) {
        setLocalError("Crop area exceeds video dimensions.");
        return;
      }
    }

    startProcessing(file, "Cropping video...", (onProgress) => cropVideo(file, x, y, w, h, onProgress));
  };

  const reset = () => {
    setFile(null);
    clearResult();
    setVideoWidth(0);
    setVideoHeight(0);
    setCropW("");
    setCropH("");
    setCropX("");
    setCropY("");
    setSelectedPreset(null);
    setLocalError("");
  };

  const handleCustomChange = () => {
    setSelectedPreset(null);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
          <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
        </svg>
      }
      title="Crop Video"
      description="Crop your video to any size. Use presets for common aspect ratios or set custom dimensions."
      accentColor="#14b8a6"
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

            {/* Video dimensions info */}
            {videoWidth > 0 && videoHeight > 0 && (
              <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-xs text-zinc-400">
                Source: <span className="text-zinc-200 font-mono">{videoWidth} x {videoHeight}</span>
              </div>
            )}

            {/* Crop ratio presets */}
            <div className="w-full">
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CROP_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(i)}
                    className={`
                      py-4 rounded-xl text-sm font-semibold transition-all border
                      ${selectedPreset === i
                        ? "text-teal-300"
                        : "bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5"
                      }
                    `}
                    style={selectedPreset === i ? {
                      backgroundColor: "color-mix(in srgb, #14b8a6 15%, transparent)",
                      borderColor: "color-mix(in srgb, #14b8a6 40%, transparent)",
                    } : undefined}
                  >
                    <div className="text-base">{preset.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom crop dimensions */}
            <div className="w-full space-y-3">
              <label className="text-sm font-medium text-zinc-300 block">
                Crop Dimensions
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1 block">Width</label>
                  <input
                    type="number"
                    value={cropW}
                    onChange={(e) => { setCropW(e.target.value); handleCustomChange(); }}
                    min={16}
                    max={videoWidth || 7680}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-zinc-200 text-sm font-mono focus:outline-none focus:border-teal-500/40 transition-colors"
                    placeholder="1920"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1 block">Height</label>
                  <input
                    type="number"
                    value={cropH}
                    onChange={(e) => { setCropH(e.target.value); handleCustomChange(); }}
                    min={16}
                    max={videoHeight || 4320}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-zinc-200 text-sm font-mono focus:outline-none focus:border-teal-500/40 transition-colors"
                    placeholder="1080"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1 block">X Offset</label>
                  <input
                    type="number"
                    value={cropX}
                    onChange={(e) => { setCropX(e.target.value); handleCustomChange(); }}
                    min={0}
                    max={videoWidth || 7680}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-zinc-200 text-sm font-mono focus:outline-none focus:border-teal-500/40 transition-colors"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1 block">Y Offset</label>
                  <input
                    type="number"
                    value={cropY}
                    onChange={(e) => { setCropY(e.target.value); handleCustomChange(); }}
                    min={0}
                    max={videoHeight || 4320}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-zinc-200 text-sm font-mono focus:outline-none focus:border-teal-500/40 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
              <p className="text-[11px] text-zinc-600">
                Dimensions will be adjusted to even numbers for H.264 compatibility.
              </p>
            </div>

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-teal-500 to-emerald-500
                hover:from-teal-400 hover:to-emerald-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(20,184,166,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Crop Video
            </button>

            {(error || localError) && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error || localError}
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="crop" />
            <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all">
              Crop another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
