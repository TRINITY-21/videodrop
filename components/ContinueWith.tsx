"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useChain, blobToFile } from "@/lib/chain-context";

interface ContinueWithProps {
  blob: Blob;
  filename: string;
  currentTool: string;
}

const chainableTools = [
  { href: "/compress", label: "Compress", color: "#3b82f6" },
  { href: "/convert", label: "Convert", color: "#3b82f6" },
  { href: "/trim", label: "Trim", color: "#f59e0b" },
  { href: "/resize", label: "Resize", color: "#8b5cf6" },
  { href: "/speed", label: "Speed", color: "#06b6d4" },
  { href: "/rotate", label: "Rotate", color: "#f97316" },
  { href: "/remove-audio", label: "Remove Audio", color: "#f43f5e" },
  { href: "/gif", label: "GIF", color: "#f472b6" },
  { href: "/crop", label: "Crop", color: "#14b8a6" },
  { href: "/filters", label: "Filters", color: "#ec4899" },
  { href: "/reverse", label: "Reverse", color: "#e11d48" },
  { href: "/loop", label: "Loop", color: "#0ea5e9" },
  { href: "/flip", label: "Flip", color: "#8b5cf6" },
  { href: "/boomerang", label: "Boomerang", color: "#d946ef" },
  { href: "/watermark", label: "Watermark", color: "#f59e0b" },
  { href: "/fade", label: "Fade", color: "#a78bfa" },
  { href: "/volume", label: "Volume", color: "#22d3ee" },
  { href: "/replace-audio", label: "Replace Audio", color: "#14b8a6" },
  { href: "/subtitles", label: "Subtitles", color: "#fb923c" },
  { href: "/pip", label: "PiP", color: "#7c3aed" },
  { href: "/background-music", label: "Background Music", color: "#10b981" },
  { href: "/aspect-ratio", label: "Aspect Ratio", color: "#8b5cf6" },
  { href: "/sharpen", label: "Sharpen", color: "#f97316" },
  { href: "/denoise", label: "Denoise", color: "#06b6d4" },
  { href: "/chroma-key", label: "Chroma Key", color: "#22c55e" },
  { href: "/split-screen", label: "Split Screen", color: "#6366f1" },
  { href: "/webp", label: "WebP", color: "#a855f7" },
  { href: "/thumbnail", label: "Thumbnail", color: "#eab308" },
  { href: "/timelapse", label: "Timelapse", color: "#ec4899" },
];

export default function ContinueWith({ blob, filename, currentTool }: ContinueWithProps) {
  const router = useRouter();
  const { setChainedFile } = useChain();

  const tools = chainableTools.filter((t) => t.href !== `/${currentTool}`);

  const handleChain = (href: string) => {
    const file = blobToFile(blob, filename);
    setChainedFile({ file, from: currentTool });
    router.push(href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="w-full"
    >
      <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3 text-center font-medium">
        Continue with another tool
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {tools.map((tool) => (
          <button
            key={tool.href}
            onClick={() => handleChain(tool.href)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-white/6 text-zinc-400 hover:text-zinc-200 hover:border-white/12 hover:bg-white/5 transition-all"
          >
            {tool.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
