"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoDropLogo from "./VideoDropLogo";

const toolCategories = [
  {
    label: "Optimize",
    tools: [
      { href: "/compress", label: "Compress", desc: "Reduce file size", color: "#3b82f6" },
      { href: "/convert", label: "Convert", desc: "Switch formats", color: "#3b82f6" },
      { href: "/resize", label: "Resize", desc: "Scale resolution", color: "#8b5cf6" },
      { href: "/aspect-ratio", label: "Aspect Ratio", desc: "Change with letterboxing", color: "#8b5cf6", isNew: true },
      { href: "/sharpen", label: "Sharpen", desc: "Enhance clarity", color: "#f97316", isNew: true },
      { href: "/denoise", label: "Denoise", desc: "Remove grain & noise", color: "#06b6d4", isNew: true },
    ],
  },
  {
    label: "Edit",
    tools: [
      { href: "/trim", label: "Trim & Cut", desc: "Extract segments", color: "#f59e0b" },
      { href: "/merge", label: "Merge", desc: "Join clips", color: "#6366f1" },
      { href: "/rotate", label: "Rotate & Flip", desc: "Rotate or mirror", color: "#f97316" },
      { href: "/speed", label: "Speed", desc: "Slow-mo or fast-forward", color: "#06b6d4" },
      { href: "/crop", label: "Crop", desc: "Crop to region", color: "#14b8a6" },
      { href: "/flip", label: "Flip / Mirror", desc: "Mirror horizontally", color: "#8b5cf6" },
      { href: "/split", label: "Split Video", desc: "Divide into parts", color: "#f59e0b" },
      { href: "/split-screen", label: "Split Screen", desc: "Side-by-side videos", color: "#6366f1", isNew: true },
      { href: "/pip", label: "Picture-in-Picture", desc: "Overlay video on video", color: "#7c3aed", isNew: true },
    ],
  },
  {
    label: "Effects",
    tools: [
      { href: "/filters", label: "Filters", desc: "Adjust color & tone", color: "#ec4899" },
      { href: "/reverse", label: "Reverse", desc: "Play backwards", color: "#e11d48" },
      { href: "/loop", label: "Loop", desc: "Repeat & loop clips", color: "#0ea5e9" },
      { href: "/boomerang", label: "Boomerang", desc: "Forward & reverse loop", color: "#d946ef" },
      { href: "/fade", label: "Fade In / Out", desc: "Fade to black transitions", color: "#a78bfa" },
      { href: "/watermark", label: "Watermark", desc: "Add text overlay", color: "#f59e0b" },
      { href: "/subtitles", label: "Subtitles", desc: "Burn SRT subtitles", color: "#fb923c" },
      { href: "/chroma-key", label: "Chroma Key", desc: "Remove green screen", color: "#22c55e", isNew: true },
      { href: "/timelapse", label: "Timelapse", desc: "Images to timelapse", color: "#ec4899", isNew: true },
    ],
  },
  {
    label: "Audio & Export",
    tools: [
      { href: "/remove-audio", label: "Remove Audio", desc: "Strip audio track", color: "#f43f5e" },
      { href: "/extract-audio", label: "Extract Audio", desc: "Pull as MP3", color: "#10b981" },
      { href: "/volume", label: "Adjust Volume", desc: "Boost or reduce audio", color: "#22d3ee" },
      { href: "/replace-audio", label: "Replace Audio", desc: "Swap audio track", color: "#14b8a6" },
      { href: "/background-music", label: "Background Music", desc: "Mix music with audio", color: "#10b981", isNew: true },
      { href: "/gif", label: "Video to GIF", desc: "Create animated GIFs", color: "#f472b6" },
      { href: "/webp", label: "Video to WebP", desc: "Animated WebP images", color: "#a855f7", isNew: true },
      { href: "/frames", label: "Extract Frames", desc: "Capture stills", color: "#a855f7" },
      { href: "/thumbnail", label: "Thumbnail", desc: "Extract perfect thumbnail", color: "#eab308", isNew: true },
      { href: "/batch", label: "Batch Process", desc: "Process in bulk", color: "#6366f1" },
    ],
  },
];

const allTools = toolCategories.flatMap((c) => c.tools);

export default function Header() {
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close mega-menu on click outside or Escape
  useEffect(() => {
    if (!megaOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [megaOpen]);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isToolActive = allTools.some((t) => t.href === pathname);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <VideoDropLogo size={30} />
            </motion.div>
            <span className="font-heading text-lg font-bold tracking-tight">
              Video<span className="gradient-text">Drop</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Local Processing badge — subtle pulse animation */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/8 text-zinc-400"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-xs font-medium">Local Processing</span>
            </motion.div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {/* Tools mega-menu */}
              <div className="relative" ref={megaRef}>
                <button
                  onClick={() => setMegaOpen((v) => !v)}
                  aria-expanded={megaOpen}
                  aria-haspopup="true"
                  className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    megaOpen || isToolActive
                      ? "text-white bg-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Tools
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <AnimatePresence>
                  {megaOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-3 w-[720px] rounded-2xl border border-white/10 shadow-2xl shadow-black/50 z-50 overflow-hidden"
                        style={{ background: "#1e1e21" }}
                      >
                        {/* Header */}
                        <div className="px-6 pt-5 pb-3 border-b border-white/6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">All Tools</p>
                            <Link
                              href="/tools"
                              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                            >
                              View all
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </Link>
                          </div>
                        </div>

                        {/* Categories grid */}
                        <div className="grid grid-cols-4 gap-0 p-2">
                          {toolCategories.map((category) => (
                            <div key={category.label} className="p-3">
                              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2 px-2">
                                {category.label}
                              </p>
                              <div className="space-y-0.5">
                                {category.tools.map((tool) => {
                                  const active = pathname === tool.href;
                                  return (
                                    <Link
                                      key={tool.href}
                                      href={tool.href}
                                      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${
                                        active
                                          ? "bg-white/10 text-white"
                                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                                      }`}
                                    >
                                      <div
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{ backgroundColor: tool.color }}
                                      />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[13px] font-medium truncate">{tool.label}</span>
                                          {tool.isNew && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/15 text-[9px] font-bold text-blue-400 uppercase tracking-wide">
                                              New
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[11px] text-zinc-600 block truncate">{tool.desc}</span>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-white/6 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            All tools run locally in your browser
                          </div>
                          <span className="text-[11px] text-zinc-600">{allTools.length} tools</span>
                        </div>
                      </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/tools"
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === "/tools"
                    ? "text-white bg-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                All Tools
              </Link>

              <a
                href="https://github.com/TRINITY-21/videodrop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden="true" />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              aria-label="Mobile navigation"
              className="absolute right-0 top-0 bottom-0 w-80 bg-surface-1/95 backdrop-blur-xl border-l border-white/5 pt-20 px-4 pb-8 overflow-y-auto"
            >
              {toolCategories.map((category) => (
                <div key={category.label} className="mb-6">
                  <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2 px-4">
                    {category.label}
                  </p>
                  <div className="space-y-0.5">
                    {category.tools.map((tool) => {
                      const active = pathname === tool.href;
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            active
                              ? "text-white bg-white/10"
                              : "text-zinc-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: tool.color }}
                          />
                          <span className="text-sm font-medium">{tool.label}</span>
                          {tool.isNew && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/15 text-[9px] font-bold text-blue-400 uppercase tracking-wide">
                              New
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="border-t border-white/5 pt-4 mt-2">
                <Link
                  href="/tools"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  View All Tools
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <a
                  href="https://github.com/TRINITY-21/videodrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  100% Local — files never leave your browser
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
