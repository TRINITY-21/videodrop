"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import VideoDropLogo from "@/components/VideoDropLogo";

const suggestedTools = [
  { href: "/compress", label: "Compress", desc: "Reduce file size", color: "#3b82f6" },
  { href: "/convert", label: "Convert", desc: "Switch formats", color: "#3b82f6" },
  { href: "/trim", label: "Trim & Cut", desc: "Extract segments", color: "#f59e0b" },
  { href: "/gif", label: "Video to GIF", desc: "Create GIFs", color: "#f472b6" },
];

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Animated logo */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center mb-6"
          >
            <VideoDropLogo size={64} />
          </motion.div>

          {/* 404 text */}
          <h1 className="font-heading text-6xl font-bold text-white mb-2">404</h1>
          <p className="text-lg text-zinc-400 mb-2">Page not found</p>
          <p className="text-sm text-zinc-600 mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Primary CTA */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-medium text-sm bg-white text-zinc-900 hover:bg-zinc-200 transition-colors mb-10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Home
          </Link>

          {/* Suggested tools */}
          <div className="mt-10">
            <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-4">
              Or try a tool
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-center gap-2.5 p-3 rounded-xl border border-white/6 hover:border-white/10 bg-surface-1 hover:bg-surface-2 transition-all"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: tool.color }}
                  />
                  <div className="text-left min-w-0">
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors block truncate">
                      {tool.label}
                    </span>
                    <span className="text-[11px] text-zinc-600 block truncate">{tool.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
