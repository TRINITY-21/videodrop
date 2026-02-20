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
import { addBackgroundMusic } from "@/lib/ffmpeg";
import { formatFileSize } from "@/lib/utils";

export default function BackgroundMusicTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [musicVolume, setMusicVolume] = useState(0.3);

  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/background-music");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file || !audioFile) return;
    startProcessing(
      file,
      "Mixing audio...",
      (onProgress) => addBackgroundMusic(file, audioFile!, musicVolume, onProgress)
    );
  };

  const reset = () => {
    setFile(null);
    setAudioFile(null);
    clearResult();
    setMusicVolume(0.3);
  };

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      }
      title="Background Music"
      description="Mix background music into your video while keeping original audio."
      accentColor="#10b981"
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

            {/* Audio file input */}
            <label className="block w-full p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/30 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setAudioFile(f);
                }}
                className="hidden"
              />
              {audioFile ? (
                <div>
                  <p className="text-sm text-emerald-400 font-medium">{audioFile.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{formatFileSize(audioFile.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-zinc-400">Drop or select an audio file</p>
                  <p className="text-xs text-zinc-600 mt-1">MP3, WAV, AAC, OGG</p>
                </div>
              )}
            </label>

            {/* Music volume slider */}
            <div className="w-full">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Music Volume</span>
                  <span className="text-sm font-mono text-emerald-400">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={!audioFile || hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-emerald-500 to-green-500
                hover:from-emerald-400 hover:to-green-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(16,185,129,0.2)]
                ${(!audioFile || hasActiveJob) ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Add Music
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="background-music" />
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
