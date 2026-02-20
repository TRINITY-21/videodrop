"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import StaggerContainer, { staggerItem } from "@/components/StaggerContainer";

interface Tool {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isNew?: boolean;
}

const categories: { label: string; description: string; tools: Tool[] }[] = [
  {
    label: "Optimize",
    description: "Reduce size and change formats without losing quality.",
    tools: [
      {
        href: "/compress",
        title: "Compress",
        description: "Reduce file size while maintaining visual quality. Perfect for sharing or uploading.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        description: "Switch between MP4, WebM, MOV, AVI, and MKV. Full codec support.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        href: "/resize",
        title: "Resize",
        description: "Scale to 1080p, 720p, 480p, or set any custom resolution.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
        ),
        color: "#8b5cf6",
      },
    ],
  },
  {
    label: "Edit",
    description: "Cut, rearrange, and transform your video clips.",
    tools: [
      {
        href: "/trim",
        title: "Trim & Cut",
        description: "Set precise start and end points to extract any segment from your video.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        href: "/merge",
        title: "Merge Videos",
        description: "Concatenate multiple video clips into one seamless file.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        href: "/rotate",
        title: "Rotate & Flip",
        description: "Rotate 90\u00b0, 180\u00b0, 270\u00b0 or flip horizontally and vertically.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        ),
        color: "#f97316",
      },
      {
        href: "/speed",
        title: "Change Speed",
        description: "Create slow-motion, timelapse, or fast-forward effects with ease.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        ),
        color: "#06b6d4",
      },
      {
        href: "/crop",
        title: "Crop",
        description: "Crop your video to any region or aspect ratio. Perfect for reframing content.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
            <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
          </svg>
        ),
        color: "#14b8a6",
        isNew: true,
      },
      {
        href: "/flip",
        title: "Flip / Mirror",
        description: "Mirror your video horizontally, vertically, or both directions.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="3" x2="12" y2="21" />
            <polyline points="8 8 4 12 8 16" />
            <polyline points="16 8 20 12 16 16" />
          </svg>
        ),
        color: "#8b5cf6",
        isNew: true,
      },
      {
        href: "/split",
        title: "Split Video",
        description: "Divide your video into equal segments for easy sharing.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="3" x2="12" y2="21" />
            <rect x="2" y="3" width="20" height="18" rx="2" />
          </svg>
        ),
        color: "#6366f1",
        isNew: true,
      },
      {
        href: "/aspect-ratio",
        title: "Aspect Ratio",
        description: "Change your video's aspect ratio with automatic letterboxing.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 8h20" />
            <path d="M2 16h20" />
          </svg>
        ),
        color: "#8b5cf6",
        isNew: true,
      },
      {
        href: "/pip",
        title: "Picture-in-Picture",
        description: "Overlay a small video on top of another video.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <rect x="12" y="10" width="8" height="5" rx="1" />
          </svg>
        ),
        color: "#7c3aed",
        isNew: true,
      },
      {
        href: "/split-screen",
        title: "Split Screen",
        description: "Place two videos side by side or stacked vertically.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="2" />
            <line x1="12" y1="3" x2="12" y2="21" />
          </svg>
        ),
        color: "#6366f1",
        isNew: true,
      },
    ],
  },
  {
    label: "Effects",
    description: "Add creative effects, transitions, and transformations.",
    tools: [
      {
        href: "/reverse",
        title: "Reverse",
        description: "Play your video backwards with reversed audio included.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        href: "/boomerang",
        title: "Boomerang",
        description: "Create Instagram-style forward-then-reverse loop effects.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
          </svg>
        ),
        color: "#d946ef",
        isNew: true,
      },
      {
        href: "/fade",
        title: "Fade In / Out",
        description: "Add smooth fade-to-black transitions at the start and end of your video.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
          </svg>
        ),
        color: "#a78bfa",
        isNew: true,
      },
      {
        href: "/watermark",
        title: "Add Watermark",
        description: "Overlay text on your video for branding and copyright protection.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        ),
        color: "#f59e0b",
        isNew: true,
      },
      {
        href: "/subtitles",
        title: "Burn Subtitles",
        description: "Hardcode SRT subtitles into your video permanently.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="5" y1="14" x2="13" y2="14" />
            <line x1="5" y1="10" x2="19" y2="10" />
          </svg>
        ),
        color: "#fb923c",
        isNew: true,
      },
      {
        href: "/chroma-key",
        title: "Chroma Key",
        description: "Remove green screen or any solid color background from video.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8m-4-4h8" />
          </svg>
        ),
        color: "#22c55e",
        isNew: true,
      },
    ],
  },
  {
    label: "Enhance",
    description: "Improve video quality with sharpening, denoising, and more.",
    tools: [
      {
        href: "/sharpen",
        title: "Sharpen",
        description: "Enhance clarity and sharpness of your video footage.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2" />
          </svg>
        ),
        color: "#f97316",
        isNew: true,
      },
      {
        href: "/denoise",
        title: "Denoise",
        description: "Remove visual noise and grain from your footage.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        ),
        color: "#06b6d4",
        isNew: true,
      },
    ],
  },
  {
    label: "Audio & Export",
    description: "Work with audio tracks, extract frames, and create animated exports.",
    tools: [
      {
        href: "/remove-audio",
        title: "Remove Audio",
        description: "Strip the audio track from any video file. Perfect for silent loops.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        description: "Pull the audio track as a high-quality MP3 file from any video.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ),
        color: "#10b981",
      },
      {
        href: "/volume",
        title: "Adjust Volume",
        description: "Boost or reduce your video's audio volume with precise control.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        description: "Swap your video's audio track with a different audio file.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ),
        color: "#14b8a6",
        isNew: true,
      },
      {
        href: "/background-music",
        title: "Background Music",
        description: "Mix background music into your video while keeping original audio.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ),
        color: "#10b981",
        isNew: true,
      },
      {
        href: "/gif",
        title: "Video to GIF",
        description: "Create animated GIFs with custom FPS, dimensions, and duration.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <path d="M10 9.5L8 8H6v8h2l2-1.5" />
            <path d="M14 8h4v3h-3" />
            <line x1="18" y1="12" x2="18" y2="16" />
          </svg>
        ),
        color: "#f472b6",
      },
      {
        href: "/frames",
        title: "Extract Frames",
        description: "Capture still frames from any video as high-quality PNG images.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        description: "Adjust brightness, contrast, saturation, and apply grayscale effects.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        href: "/webp",
        title: "Video to WebP",
        description: "Convert video clips to animated WebP images.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        ),
        color: "#a855f7",
        isNew: true,
      },
      {
        href: "/thumbnail",
        title: "Thumbnail Generator",
        description: "Extract the perfect thumbnail from any video as a JPG image.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        ),
        color: "#eab308",
        isNew: true,
      },
      {
        href: "/timelapse",
        title: "Timelapse from Images",
        description: "Turn a series of images into a smooth timelapse video.",
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="16" height="12" rx="2" />
            <rect x="6" y="3" width="16" height="12" rx="2" />
          </svg>
        ),
        color: "#6366f1",
        isNew: true,
      },
    ],
  },
];

const allTools = categories.flatMap((c) => c.tools);

export default function ToolsClient() {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        tools: cat.tools.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.tools.length > 0);
  }, [search]);

  return (
    <div className="relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-50"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 40%, transparent 70%)" }}
      />

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-12 px-6">
        <StaggerContainer className="max-w-3xl mx-auto text-center">
          {/* Icon cluster illustration */}
          <motion.div variants={staggerItem} className="flex items-center justify-center gap-3 mb-8">
            {[
              { color: "#3b82f6", d: "M4 14l6 0 0 6M20 10l-6 0 0-6M14 10l7-7M3 21l7-7" },
              { color: "#f59e0b", d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
              { color: "#10b981", d: "M9 18V5l12-2v13M6 18a3 3 0 100-6 3 3 0 000 6zM18 16a3 3 0 100-6 3 3 0 000 6z" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 + i * 0.1 }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/8"
                style={{
                  backgroundColor: `color-mix(in srgb, ${item.color} 10%, transparent)`,
                  color: item.color,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.d} />
                </svg>
              </motion.div>
            ))}
          </motion.div>

          <motion.h1
            variants={staggerItem}
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4"
          >
            <span className="text-white">All Tools</span>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="text-base sm:text-lg text-zinc-500 max-w-lg mx-auto leading-relaxed mb-6"
          >
            {allTools.length} professional-grade video tools. All free, all private,
            all running locally in your browser.
          </motion.p>

          {/* Stats row */}
          <motion.div variants={staggerItem} className="flex items-center justify-center gap-8 text-center mb-10">
            {[
              { value: allTools.length.toString(), label: "Tools" },
              { value: "0", label: "Uploads" },
              { value: "100%", label: "Free" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-bold text-white font-heading">{stat.value}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Search bar */}
          <motion.div variants={staggerItem} className="max-w-md mx-auto relative">
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-1 border border-white/8 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </motion.div>
        </StaggerContainer>
      </section>

      {/* ─── CATEGORIES ─── */}
      {filteredCategories.length === 0 && (
        <div className="py-20 text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-surface-1 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-sm text-zinc-500 mb-1">No tools found for &ldquo;{search}&rdquo;</p>
          <p className="text-xs text-zinc-600">Try a different search term</p>
        </div>
      )}

      {filteredCategories.map((category, catIdx) => (
        <section key={category.label} className="py-16 px-6 relative">
          {catIdx === 0 && (
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />
          )}

          <div className="max-w-5xl mx-auto">
            <StaggerContainer className="mb-10">
              <motion.div variants={staggerItem} className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  {category.label}
                </p>
              </motion.div>
              <motion.p variants={staggerItem} className="text-sm text-zinc-600 max-w-md">
                {category.description}
              </motion.p>
            </StaggerContainer>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" staggerDelay={0.06}>
              {category.tools.map((tool) => (
                <motion.div
                  key={tool.href}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link
                    href={tool.href}
                    className="group relative block p-6 rounded-2xl border border-white/6 hover:border-white/12 bg-surface-1 hover:bg-surface-2 transition-all overflow-hidden h-full"
                  >
                    {/* Gradient top accent on hover */}
                    <div
                      className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(90deg, transparent, ${tool.color}50, transparent)` }}
                    />

                    {/* Subtle corner glow on hover */}
                    <div
                      className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `color-mix(in srgb, ${tool.color} 6%, transparent)` }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${tool.color} 10%, transparent)`,
                            color: tool.color,
                          }}
                        >
                          {tool.icon}
                        </div>
                        {tool.isNew && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                            New
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-zinc-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>

          {/* Section divider */}
          {catIdx < filteredCategories.length - 1 && (
            <div className="max-w-5xl mx-auto mt-16">
              <div className="h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />
            </div>
          )}
        </section>
      ))}

      {/* ─── BOTTOM BANNER ─── */}
      <section className="py-20 px-6 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />

        <StaggerContainer className="max-w-2xl mx-auto">
          <motion.div
            variants={staggerItem}
            className="relative rounded-2xl border border-white/6 bg-surface-1 p-8 sm:p-10 text-center overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px]"
                style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)" }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">100% Local Processing</span>
              </div>

              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
                Your files never leave your device
              </h2>
              <p className="text-sm text-zinc-500 mb-8 max-w-md mx-auto leading-relaxed">
                Every tool runs directly in your browser using FFmpeg compiled to WebAssembly. No servers, no uploads, no data collection.
              </p>

              <Link
                href="/compress"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium bg-white text-zinc-900 hover:bg-zinc-200 transition-colors"
              >
                Start with Compress
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </StaggerContainer>
      </section>
    </div>
  );
}
