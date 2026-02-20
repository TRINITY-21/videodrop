"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import VideoDropLogo from "./VideoDropLogo";

const footerNav = [
  {
    label: "Optimize",
    links: [
      { href: "/compress", label: "Compress" },
      { href: "/convert", label: "Convert" },
      { href: "/resize", label: "Resize" },
      { href: "/aspect-ratio", label: "Aspect Ratio" },
      { href: "/sharpen", label: "Sharpen" },
      { href: "/denoise", label: "Denoise" },
    ],
  },
  {
    label: "Edit",
    links: [
      { href: "/trim", label: "Trim & Cut" },
      { href: "/merge", label: "Merge" },
      { href: "/rotate", label: "Rotate & Flip" },
      { href: "/speed", label: "Speed" },
      { href: "/crop", label: "Crop" },
      { href: "/flip", label: "Flip / Mirror" },
      { href: "/split", label: "Split Video" },
      { href: "/split-screen", label: "Split Screen" },
      { href: "/pip", label: "Picture-in-Picture" },
    ],
  },
  {
    label: "Effects",
    links: [
      { href: "/filters", label: "Filters" },
      { href: "/reverse", label: "Reverse" },
      { href: "/loop", label: "Loop" },
      { href: "/boomerang", label: "Boomerang" },
      { href: "/fade", label: "Fade In / Out" },
      { href: "/watermark", label: "Watermark" },
      { href: "/subtitles", label: "Subtitles" },
      { href: "/chroma-key", label: "Chroma Key" },
      { href: "/timelapse", label: "Timelapse" },
    ],
  },
  {
    label: "Audio & Export",
    links: [
      { href: "/remove-audio", label: "Remove Audio" },
      { href: "/extract-audio", label: "Extract Audio" },
      { href: "/volume", label: "Adjust Volume" },
      { href: "/replace-audio", label: "Replace Audio" },
      { href: "/background-music", label: "Background Music" },
      { href: "/gif", label: "Video to GIF" },
      { href: "/webp", label: "Video to WebP" },
      { href: "/frames", label: "Extract Frames" },
      { href: "/thumbnail", label: "Thumbnail" },
      { href: "/batch", label: "Batch Process" },
    ],
  },
];

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="border-t border-white/5 mt-auto"
    >
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 md:gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <VideoDropLogo size={26} />
              <span className="font-heading text-sm font-bold tracking-tight">
                Video<span className="gradient-text">Drop</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-5 max-w-xs">
              Free, private video tools that run entirely in your browser. No uploads, no servers, no accounts.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/TRINITY-21/videodrop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/8 text-xs text-zinc-400 hover:text-white hover:border-white/15 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Open Source
              </a>
              <a
                href="https://buymeacoffee.com/trinity_21"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                  alt="Buy Me A Coffee"
                  height="36"
                  width="130"
                  className="h-8 w-auto"
                />
              </a>
            </div>
          </div>

          {/* Tool columns */}
          {footerNav.map((section) => (
            <nav key={section.label} aria-label={`${section.label} tools`}>
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
                {section.label}
              </p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>Built by Joe. Powered by FFmpeg.wasm</p>
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Your files never leave your browser</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
