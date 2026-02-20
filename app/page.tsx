"use client";

import StaggerContainer, { staggerItem } from "@/components/StaggerContainer";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRecentTools } from "@/lib/use-recent-tools";

const tools = [
  {
    href: "/compress",
    title: "Compress",
    description: "Reduce file size while maintaining visual quality.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 14 10 14 10 20" />
        <polyline points="20 10 14 10 14 4" />
        <line x1="14" y1="10" x2="21" y2="3" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    ),
    color: "#3b82f6",
  },
  {
    href: "/convert",
    title: "Convert",
    description: "Switch between MP4, WebM, MOV, AVI, and MKV.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
    color: "#3b82f6",
  },
  {
    href: "/trim",
    title: "Trim & Cut",
    description: "Set precise start and end points to extract any segment.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    ),
    color: "#f59e0b",
  },
  {
    href: "/gif",
    title: "Video to GIF",
    description: "Create GIFs with custom FPS, dimensions, and duration.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M10 9.5L8 8H6v8h2l2-1.5" />
        <path d="M14 8h4v3h-3" />
        <line x1="18" y1="12" x2="18" y2="16" />
      </svg>
    ),
    color: "#f472b6",
  },
  {
    href: "/resize",
    title: "Resize",
    description: "Scale to 1080p, 720p, 480p, or any custom resolution.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6" />
        <path d="M9 21H3v-6" />
        <path d="M21 3l-7 7" />
        <path d="M3 21l7-7" />
      </svg>
    ),
    color: "#8b5cf6",
  },
  {
    href: "/speed",
    title: "Change Speed",
    description: "Create slow-motion, timelapse, or fast-forward effects.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    color: "#06b6d4",
  },
  {
    href: "/rotate",
    title: "Rotate & Flip",
    description: "Rotate 90\u00b0, 180\u00b0, 270\u00b0 or flip horizontally and vertically.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
    color: "#f97316",
  },
  {
    href: "/remove-audio",
    title: "Remove Audio",
    description: "Strip the audio track from any video file instantly.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    ),
    color: "#f43f5e",
  },
  {
    href: "/extract-audio",
    title: "Extract Audio",
    description: "Pull the audio track as a high-quality MP3 file.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    color: "#10b981",
  },
  {
    href: "/merge",
    title: "Merge Videos",
    description: "Concatenate multiple video clips into one seamless file.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="8" height="7" rx="1" />
        <rect x="14" y="3" width="8" height="7" rx="1" />
        <rect x="5" y="14" width="14" height="7" rx="1" />
        <line x1="6" y1="10" x2="6" y2="14" />
        <line x1="18" y1="10" x2="18" y2="14" />
      </svg>
    ),
    color: "#6366f1",
  },
  {
    href: "/crop",
    title: "Crop",
    description: "Crop your video to any region or aspect ratio.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
        <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
      </svg>
    ),
    color: "#14b8a6",
    isNew: true,
  },
  {
    href: "/frames",
    title: "Extract Frames",
    description: "Capture still frames from any video as PNG images.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
    color: "#a855f7",
    isNew: true,
  },
  {
    href: "/filters",
    title: "Filters",
    description: "Adjust brightness, contrast, saturation, and apply grayscale.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    ),
    color: "#ec4899",
    isNew: true,
  },
  {
    href: "/batch",
    title: "Batch Process",
    description: "Process multiple videos at once — compress, convert, or strip audio in bulk.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="16" height="12" rx="2" />
        <rect x="6" y="3" width="16" height="12" rx="2" />
      </svg>
    ),
    color: "#6366f1",
    isNew: true,
  },
  {
    href: "/reverse",
    title: "Reverse",
    description: "Play your video backwards with reversed audio.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="19 20 9 12 19 4 19 20" />
        <line x1="5" y1="19" x2="5" y2="5" />
      </svg>
    ),
    color: "#e11d48",
    isNew: true,
  },
  {
    href: "/loop",
    title: "Loop",
    description: "Repeat your video 2x, 3x, or more into one seamless file.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    color: "#0ea5e9",
    isNew: true,
  },
  {
    href: "/flip",
    title: "Flip / Mirror",
    description: "Mirror your video horizontally, vertically, or both.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="3" x2="12" y2="21" />
        <polyline points="8 8 4 12 8 16" />
        <polyline points="16 8 20 12 16 16" />
      </svg>
    ),
    color: "#8b5cf6",
    isNew: true,
  },
  {
    href: "/boomerang",
    title: "Boomerang",
    description: "Create Instagram-style forward-then-reverse loops.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
      </svg>
    ),
    color: "#d946ef",
    isNew: true,
  },
  {
    href: "/watermark",
    title: "Watermark",
    description: "Overlay text on your video for branding and copyright.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
    color: "#f59e0b",
    isNew: true,
  },
  {
    href: "/fade",
    title: "Fade In / Out",
    description: "Add smooth fade-to-black transitions at the start and end.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    color: "#a78bfa",
    isNew: true,
  },
  {
    href: "/volume",
    title: "Adjust Volume",
    description: "Boost or reduce your video's audio volume.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
    color: "#22d3ee",
    isNew: true,
  },
  {
    href: "/replace-audio",
    title: "Replace Audio",
    description: "Swap your video's audio with a different audio file.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    color: "#14b8a6",
    isNew: true,
  },
  {
    href: "/split",
    title: "Split Video",
    description: "Divide your video into equal segments.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="3" x2="12" y2="21" />
        <rect x="2" y="3" width="20" height="18" rx="2" />
      </svg>
    ),
    color: "#6366f1",
    isNew: true,
  },
  {
    href: "/subtitles",
    title: "Burn Subtitles",
    description: "Hardcode SRT subtitles into your video permanently.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="5" y1="14" x2="13" y2="14" />
        <line x1="5" y1="10" x2="19" y2="10" />
      </svg>
    ),
    color: "#fb923c",
    isNew: true,
  },
  {
    href: "/pip",
    title: "Picture-in-Picture",
    description: "Overlay a small video on top of another video.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <rect x="12" y="10" width="8" height="5" rx="1" />
      </svg>
    ),
    color: "#7c3aed",
    isNew: true,
  },
  {
    href: "/background-music",
    title: "Background Music",
    description: "Mix background music while keeping original audio.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    color: "#10b981",
    isNew: true,
  },
  {
    href: "/webp",
    title: "Video to WebP",
    description: "Convert video clips to animated WebP images.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
    color: "#a855f7",
    isNew: true,
  },
  {
    href: "/aspect-ratio",
    title: "Aspect Ratio",
    description: "Change aspect ratio with automatic letterboxing.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 8h20" />
        <path d="M2 16h20" />
      </svg>
    ),
    color: "#8b5cf6",
    isNew: true,
  },
  {
    href: "/sharpen",
    title: "Sharpen",
    description: "Enhance clarity and sharpness of your footage.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2" />
      </svg>
    ),
    color: "#f97316",
    isNew: true,
  },
  {
    href: "/denoise",
    title: "Denoise",
    description: "Remove visual noise and grain from your video.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    color: "#06b6d4",
    isNew: true,
  },
  {
    href: "/chroma-key",
    title: "Chroma Key",
    description: "Remove green screen or any solid color background.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8m-4-4h8" />
      </svg>
    ),
    color: "#22c55e",
    isNew: true,
  },
  {
    href: "/thumbnail",
    title: "Thumbnail",
    description: "Extract the perfect thumbnail from any video.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    color: "#eab308",
    isNew: true,
  },
  {
    href: "/timelapse",
    title: "Timelapse",
    description: "Turn a series of images into a smooth timelapse video.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: "#ec4899",
    isNew: true,
  },
  {
    href: "/split-screen",
    title: "Split Screen",
    description: "Place two videos side by side or stacked.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <line x1="12" y1="3" x2="12" y2="21" />
      </svg>
    ),
    color: "#6366f1",
    isNew: true,
  },
];

const steps = [
  {
    num: "01",
    title: "Drop your file",
    description: "Drag and drop any video into the browser. Supports MP4, WebM, MOV, AVI, MKV, and more.",
  },
  {
    num: "02",
    title: "Configure & process",
    description: "Pick a tool, adjust settings, and hit process. Everything runs locally on your device.",
  },
  {
    num: "03",
    title: "Download result",
    description: "Your processed file is ready instantly. Download it directly — nothing stored anywhere.",
  },
];

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Private by design",
    description: "Every operation runs in your browser using WebAssembly. Files are never uploaded to any server. We can't see your data because it never reaches us.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Near-native speed",
    description: "Built on FFmpeg compiled to WebAssembly. Processing runs at near-native speed on your hardware. No server queues, no network latency.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Free, no strings",
    description: "No account required. No watermarks on your output. No usage limits. No premium tiers. Open source and completely free.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left p-5 rounded-2xl border border-white/6 hover:border-white/10 bg-surface-1 transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-zinc-200">{question}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-zinc-500 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-zinc-500 leading-relaxed mt-3 pr-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// Tool lookup map for recent tools display
const toolMap = Object.fromEntries(tools.map((t) => [t.href, t]));

export default function Home() {
  const { recent } = useRecentTools();
  const recentTools = recent.map((href) => toolMap[href]).filter(Boolean);

  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-60"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 40%, transparent 70%)" }}
      />

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-16 px-6">
        <StaggerContainer className="max-w-3xl mx-auto text-center" staggerDelay={0.08}>
          {/* Badge */}
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/8 text-[13px] text-zinc-400 mb-8"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Powered by WebAssembly &mdash; runs entirely in your browser
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={staggerItem}
            className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            <span className="text-white">The fastest way to edit video</span>
            <br />
            <span className="text-zinc-500">without leaving your browser.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={staggerItem}
            className="text-base sm:text-lg text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Compress, convert, trim, resize, and more. No uploads, no accounts,
            no watermarks. Your files stay on your device.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/compress"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-medium text-sm bg-white text-zinc-900 hover:bg-zinc-200 transition-colors"
            >
              Compress a Video
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center justify-center px-7 py-3 rounded-xl font-medium text-zinc-400 text-sm border border-white/8 hover:border-white/15 hover:text-zinc-300 transition-all"
            >
              Browse All Tools
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={staggerItem}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-zinc-600"
          >
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              No uploads
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              No signups
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              No watermarks
            </span>
            <a
              href="https://github.com/TRINITY-21/videodrop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-zinc-400 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Open Source
            </a>
          </motion.div>
        </StaggerContainer>

        {/* ─── RECENTLY USED ─── */}
        {recentTools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="max-w-md mx-auto mt-8"
          >
            <p className="text-[11px] text-zinc-600 text-center mb-2.5 uppercase tracking-wider font-medium">
              Pick up where you left off
            </p>
            <div className="flex items-center justify-center gap-2">
              {recentTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/6 hover:border-white/12 bg-surface-1 hover:bg-surface-2 transition-all"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: tool.color }}
                  />
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {tool.title}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── BROWSER MOCKUP ─── */}
        <StaggerContainer className="max-w-2xl mx-auto mt-16" delay={0.4}>
          <motion.div
            variants={staggerItem}
            className="rounded-2xl border border-white/8 overflow-hidden shadow-2xl shadow-black/40"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 h-9 bg-[#1c1c1f] border-b border-white/6">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3f]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3f]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3f]" />
              </div>
              <div className="flex-1 ml-3">
                <div className="mx-auto max-w-[220px] h-5 rounded-md bg-surface-1 flex items-center justify-center">
                  <span className="text-[10px] text-zinc-600 font-mono">videodrop.app/compress</span>
                </div>
              </div>
            </div>

            {/* Workflow visualization */}
            <div className="p-5 sm:p-8 bg-surface-1">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Input */}
                <div className="flex-1 p-3 sm:p-4 rounded-xl border border-white/6 bg-[#232326]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-lg bg-[#1c1c1f] flex items-center justify-center text-zinc-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div className="text-[10px] sm:text-xs text-zinc-400 text-center font-medium">input.mp4</div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-600 text-center mt-0.5">124 MB</div>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>

                {/* Processing */}
                <div className="flex-1 p-3 sm:p-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.04]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 14 10 14 10 20" />
                      <polyline points="20 10 14 10 14 4" />
                      <line x1="14" y1="10" x2="21" y2="3" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </div>
                  <div className="text-[10px] sm:text-xs text-blue-400 text-center font-medium">Compressing</div>
                  <div className="mt-2 h-1 rounded-full bg-[#1c1c1f] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "72%" }}
                      transition={{ duration: 2.5, ease: "easeOut", delay: 0.8 }}
                    />
                  </div>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>

                {/* Output */}
                <div className="flex-1 p-3 sm:p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="text-[10px] sm:text-xs text-emerald-400 text-center font-medium">Done</div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-500 text-center mt-0.5">41 MB (-67%)</div>
                </div>
              </div>
            </div>
          </motion.div>
        </StaggerContainer>
      </section>

      {/* ─── TOOLS ─── */}
      <section id="tools" className="py-24 px-6 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

        <div className="max-w-5xl mx-auto">
          <StaggerContainer className="text-center mb-14">
            <motion.p variants={staggerItem} className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
              Tools
            </motion.p>
            <motion.h2 variants={staggerItem} className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
              Everything you need
            </motion.h2>
            <motion.p variants={staggerItem} className="text-sm text-zinc-500 max-w-md mx-auto">
              Thirty-four professional-grade video tools. All free, all private, all running locally in your browser.
            </motion.p>
          </StaggerContainer>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" staggerDelay={0.04}>
            {tools.slice(0, 9).map((tool) => (
              <motion.div
                key={tool.href}
                variants={staggerItem}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={tool.href}
                  className="group relative block p-5 rounded-2xl border border-white/6 hover:border-white/10 bg-surface-1 hover:bg-surface-2 transition-all overflow-hidden"
                >
                  {/* Gradient top accent on hover */}
                  <div
                    className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${tool.color}50, transparent)` }}
                  />

                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${tool.color} 10%, transparent)`,
                      color: tool.color,
                    }}
                  >
                    {tool.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-semibold text-white">
                      {tool.title}
                    </h3>
                    {tool.isNew && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-500/15 text-[9px] font-bold text-blue-400 uppercase tracking-wide">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Arrow */}
                  <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-50 transition-opacity text-zinc-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </StaggerContainer>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-white/8 hover:border-white/15 hover:text-zinc-300 transition-all"
            >
              View all {tools.length} tools
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

        <div className="max-w-3xl mx-auto">
          <StaggerContainer className="text-center mb-14">
            <motion.p variants={staggerItem} className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
              How it works
            </motion.p>
            <motion.h2 variants={staggerItem} className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Three simple steps
            </motion.h2>
          </StaggerContainer>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.1}>
            {steps.map((step, i) => (
              <motion.div key={step.num} variants={staggerItem} className="text-center relative">
                {/* Connecting line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/8 to-transparent" />
                )}

                <div className="w-10 h-10 rounded-full border border-white/10 bg-surface-1 flex items-center justify-center mx-auto mb-4 text-sm font-mono text-zinc-500 relative z-10">
                  {step.num}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[240px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── WHY VIDEODROP ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

        <div className="max-w-4xl mx-auto">
          <StaggerContainer className="text-center mb-14">
            <motion.p variants={staggerItem} className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
              Why VideoDrop
            </motion.p>
            <motion.h2 variants={staggerItem} className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Built different
            </motion.h2>
          </StaggerContainer>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4" staggerDelay={0.08}>
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="relative p-6 rounded-2xl border border-white/6 bg-surface-1 overflow-hidden group"
              >
                {/* Subtle corner glow */}
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-white/[0.02] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="w-10 h-10 rounded-xl border border-white/8 flex items-center justify-center mb-4 text-zinc-400">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

        <div className="max-w-2xl mx-auto">
          <StaggerContainer className="text-center mb-14">
            <motion.p variants={staggerItem} className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
              FAQ
            </motion.p>
            <motion.h2 variants={staggerItem} className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Common questions
            </motion.h2>
          </StaggerContainer>

          <StaggerContainer className="space-y-2" staggerDelay={0.05}>
            {[
              {
                q: "Is it really free?",
                a: "Yes, completely free. No hidden costs, no premium tiers, no usage limits. VideoDrop is open source and will stay free forever.",
              },
              {
                q: "Are my files uploaded to a server?",
                a: "No. All processing happens locally in your browser using FFmpeg compiled to WebAssembly. Your files never leave your device — we literally have no server to receive them.",
              },
              {
                q: "What formats are supported?",
                a: "VideoDrop supports MP4, WebM, MOV, AVI, MKV, WMV, 3GP, FLV, and more. If FFmpeg can read it, VideoDrop can process it.",
              },
              {
                q: "Why is the first load slow?",
                a: "On your first visit, VideoDrop downloads the FFmpeg WebAssembly binary (~30MB). This is cached by your browser, so subsequent visits are instant.",
              },
              {
                q: "Is there a file size limit?",
                a: "There's a 2GB hard limit. Files over 500MB will show a warning since processing large files in the browser can be memory-intensive. For best results, ensure you have at least 4GB of free RAM.",
              },
              {
                q: "Does it work on mobile?",
                a: "VideoDrop works on modern mobile browsers, but performance depends on your device. Desktop browsers generally offer a smoother experience for larger files.",
              },
            ].map((item) => (
              <motion.div key={item.q} variants={staggerItem}>
                <FAQItem question={item.q} answer={item.a} />
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

        <StaggerContainer className="max-w-xl mx-auto text-center">
          <motion.h2 variants={staggerItem} className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to edit your video?
          </motion.h2>
          <motion.p variants={staggerItem} className="text-sm text-zinc-500 mb-8">
            Drop your file and get results in seconds. No signup, no waiting.
          </motion.p>
          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/compress"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium bg-white text-zinc-900 hover:bg-zinc-200 transition-colors"
            >
              Compress a Video
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium text-zinc-400 border border-white/8 hover:border-white/15 hover:text-zinc-300 transition-all"
            >
              Browse All Tools
            </Link>
          </motion.div>
        </StaggerContainer>
      </section>
    </div>
  );
}
