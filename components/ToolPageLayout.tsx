"use client";

import { ReactNode, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useRecentTools } from "@/lib/use-recent-tools";

const allTools = [
  { href: "/compress", title: "Compress", desc: "Reduce file size", color: "#3b82f6", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )},
  { href: "/convert", title: "Convert", desc: "Switch video formats", color: "#3b82f6", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  )},
  { href: "/trim", title: "Trim & Cut", desc: "Extract any segment", color: "#f59e0b", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )},
  { href: "/gif", title: "Video to GIF", desc: "Create animated GIFs", color: "#f472b6", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" /><path d="M10 9.5L8 8H6v8h2l2-1.5" /><path d="M14 8h4v3h-3" /><line x1="18" y1="12" x2="18" y2="16" />
    </svg>
  )},
  { href: "/resize", title: "Resize", desc: "Scale to any resolution", color: "#8b5cf6", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" />
    </svg>
  )},
  { href: "/speed", title: "Change Speed", desc: "Slow-mo or fast-forward", color: "#06b6d4", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )},
  { href: "/rotate", title: "Rotate & Flip", desc: "Rotate or mirror video", color: "#f97316", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )},
  { href: "/remove-audio", title: "Remove Audio", desc: "Strip the audio track", color: "#f43f5e", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )},
  { href: "/extract-audio", title: "Extract Audio", desc: "Pull audio as MP3", color: "#10b981", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  )},
  { href: "/merge", title: "Merge Videos", desc: "Join clips together", color: "#6366f1", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="8" height="7" rx="1" /><rect x="14" y="3" width="8" height="7" rx="1" /><rect x="5" y="14" width="14" height="7" rx="1" /><line x1="6" y1="10" x2="6" y2="14" /><line x1="18" y1="10" x2="18" y2="14" />
    </svg>
  )},
  { href: "/crop", title: "Crop", desc: "Crop to any region", color: "#14b8a6", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" /><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
    </svg>
  )},
  { href: "/frames", title: "Extract Frames", desc: "Capture still images", color: "#a855f7", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </svg>
  )},
  { href: "/filters", title: "Filters", desc: "Adjust color & tone", color: "#ec4899", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )},
  { href: "/batch", title: "Batch Process", desc: "Process multiple videos", color: "#6366f1", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="16" height="12" rx="2" /><rect x="6" y="3" width="16" height="12" rx="2" />
    </svg>
  )},
  { href: "/reverse", title: "Reverse", desc: "Play video backwards", color: "#e11d48", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
    </svg>
  )},
  { href: "/loop", title: "Loop", desc: "Repeat video multiple times", color: "#0ea5e9", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )},
  { href: "/flip", title: "Flip / Mirror", desc: "Mirror video horizontally", color: "#8b5cf6", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21" /><polyline points="8 8 4 12 8 16" /><polyline points="16 8 20 12 16 16" />
    </svg>
  )},
  { href: "/boomerang", title: "Boomerang", desc: "Forward-then-reverse loop", color: "#d946ef", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
    </svg>
  )},
  { href: "/watermark", title: "Watermark", desc: "Overlay text on video", color: "#f59e0b", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  )},
  { href: "/fade", title: "Fade In / Out", desc: "Smooth fade transitions", color: "#a78bfa", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )},
  { href: "/volume", title: "Adjust Volume", desc: "Boost or reduce audio", color: "#22d3ee", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )},
  { href: "/replace-audio", title: "Replace Audio", desc: "Swap audio track", color: "#14b8a6", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  )},
  { href: "/split", title: "Split Video", desc: "Divide into segments", color: "#6366f1", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21" /><rect x="2" y="3" width="20" height="18" rx="2" />
    </svg>
  )},
  { href: "/subtitles", title: "Burn Subtitles", desc: "Hardcode SRT subtitles", color: "#fb923c", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="5" y1="14" x2="13" y2="14" /><line x1="5" y1="10" x2="19" y2="10" />
    </svg>
  )},
  { href: "/pip", title: "Picture-in-Picture", desc: "Overlay video on video", color: "#7c3aed", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><rect x="12" y="10" width="8" height="5" rx="1" />
    </svg>
  )},
  { href: "/background-music", title: "Background Music", desc: "Mix music with audio", color: "#10b981", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  )},
  { href: "/webp", title: "Video to WebP", desc: "Animated WebP images", color: "#a855f7", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </svg>
  )},
  { href: "/aspect-ratio", title: "Aspect Ratio", desc: "Change with letterboxing", color: "#8b5cf6", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8h20" /><path d="M2 16h20" />
    </svg>
  )},
  { href: "/sharpen", title: "Sharpen", desc: "Enhance clarity", color: "#f97316", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2" />
    </svg>
  )},
  { href: "/denoise", title: "Denoise", desc: "Remove grain & noise", color: "#06b6d4", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" /><circle cx="12" cy="12" r="4" />
    </svg>
  )},
  { href: "/chroma-key", title: "Chroma Key", desc: "Remove green screen", color: "#22c55e", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8m-4-4h8" />
    </svg>
  )},
  { href: "/thumbnail", title: "Thumbnail", desc: "Extract perfect thumbnail", color: "#eab308", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  )},
  { href: "/timelapse", title: "Timelapse", desc: "Images to timelapse video", color: "#ec4899", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )},
  { href: "/split-screen", title: "Split Screen", desc: "Side-by-side videos", color: "#6366f1", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  )},
];

interface ToolPageLayoutProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentColor: string;
  children: ReactNode;
}

export default function ToolPageLayout({
  icon,
  title,
  description,
  accentColor,
  children,
}: ToolPageLayoutProps) {
  const pathname = usePathname();
  const bottomRef = useRef(null);
  const isInView = useInView(bottomRef, { once: true, margin: "-40px" });
  const { trackTool } = useRecentTools();

  useEffect(() => {
    trackTool(pathname);
  }, [pathname, trackTool]);

  const suggestedTools = useMemo(
    () =>
      allTools
        .filter((t) => t.href !== pathname)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4),
    [pathname]
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-600 mb-6 justify-center">
          <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <Link href="/tools" className="hover:text-zinc-400 transition-colors">Tools</Link>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-zinc-400" aria-current="page">{title}</span>
        </nav>

        {/* Tool header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)` }}
          >
            {icon}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="font-heading text-3xl font-bold text-white mb-2"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="text-zinc-400 text-base"
          >
            {description}
          </motion.p>
        </div>

        {/* Tool content */}
        <div className="space-y-5">{children}</div>
      </div>

      {/* ─── Bottom section ─── */}
      <div ref={bottomRef} className="max-w-3xl mx-auto px-6 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-16">
            {[
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                text: "100% local processing",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                ),
                text: "Powered by FFmpeg.wasm",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                ),
                text: "No uploads, ever",
              },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-xs text-zinc-500">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/6 to-transparent mb-12" />

          {/* More tools */}
          <div className="text-center mb-8">
            <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-1">More tools</p>
            <p className="text-sm text-zinc-500">Try another tool on your video</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {suggestedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative flex items-center gap-4 p-5 rounded-2xl border border-white/6 hover:border-white/10 bg-surface-1 hover:bg-surface-2 transition-all overflow-hidden"
              >
                {/* Gradient top accent on hover */}
                <div
                  className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${tool.color}50, transparent)` }}
                />

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${tool.color} 10%, transparent)`,
                    color: tool.color,
                  }}
                >
                  {tool.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {tool.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{tool.desc}</p>
                </div>

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 border border-white/6 hover:border-white/10 transition-all"
            >
              View all tools
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
