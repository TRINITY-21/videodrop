"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import FileInfo from "@/components/FileInfo";
import FormatSelect from "@/components/FormatSelect";
import DownloadButton from "@/components/DownloadButton";
import ContinueWith from "@/components/ContinueWith";
import ToolPageLayout from "@/components/ToolPageLayout";
import { useChain } from "@/lib/chain-context";
import { useToolProcessing } from "@/lib/processing-context";
import { convertVideo } from "@/lib/ffmpeg";
import { getExtension } from "@/lib/utils";

export default function ConvertTool() {
  const { consumeChainedFile } = useChain();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const chained = consumeChainedFile();
    if (chained) setFile(chained.file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [outputFormat, setOutputFormat] = useState("mp4");
  const { processing, progress, result, error, jobFile, startProcessing, clearResult, hasActiveJob } = useToolProcessing("/convert");
  const displayFile = file ?? jobFile;

  const handleProcess = () => {
    if (!file) return;
    startProcessing(
      file,
      "Converting video...",
      (onProgress) => convertVideo(file, outputFormat, onProgress)
    );
  };

  const reset = () => {
    setFile(null);
    clearResult();
  };

  const currentFormat = displayFile ? getExtension(displayFile.name).replace(".", "") : "";

  return (
    <ToolPageLayout
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      }
      title="Convert Format"
      description="Convert between MP4, WebM, MOV, AVI, and MKV — right in your browser."
      accentColor="#3b82f6"
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
            <FormatSelect
              value={outputFormat}
              onChange={setOutputFormat}
              currentFormat={currentFormat}
            />

            <button
              onClick={handleProcess}
              disabled={hasActiveJob}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-blue-500 to-cyan-500
                hover:from-blue-400 hover:to-cyan-400
                active:scale-[0.98] transition-all duration-200
                shadow-[0_0_30px_rgba(59,130,246,0.2)]
                ${hasActiveJob ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Convert to {outputFormat.toUpperCase()}
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
            <ContinueWith blob={result.blob} filename={result.filename} currentTool="convert" />
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 glass hover:bg-white/5 transition-all"
            >
              Convert another video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
