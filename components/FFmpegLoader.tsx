"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isFFmpegLoaded, onFFmpegLoadStart } from "@/lib/ffmpeg";

export default function FFmpegLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isFFmpegLoaded()) return;

    const unsub = onFFmpegLoadStart(() => {
      setVisible(true);
    });

    return unsub;
  }, []);

  // Hide once loaded
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      if (isFFmpegLoaded()) {
        setTimeout(() => setVisible(false), 600);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-6 z-[90] flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </motion.div>
          <div>
            <p className="text-sm font-medium text-zinc-200">Loading FFmpeg</p>
            <p className="text-[11px] text-zinc-500">Downloading video engine (~30MB, cached after first load)</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
