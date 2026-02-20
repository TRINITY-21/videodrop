"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";

// ─── Fun Facts ──────────────────────────────────────────
const funFacts = [
  "1 minute of 4K video is ~375MB uncompressed.",
  "The first video ever uploaded to YouTube was 18 seconds long.",
  "Netflix encodes every title in over 120 different formats.",
  "GIF was invented in 1987 — older than the World Wide Web.",
  "A single frame of 8K video has 33 million pixels.",
  "The human eye can perceive about 1,000 FPS in theory.",
  "VP9 (WebM) can save ~50% bitrate vs H.264 at the same quality.",
  "FFmpeg, the engine behind this tool, was started in the year 2000.",
  "The MP4 format is technically based on Apple's QuickTime.",
  "YouTube processes over 500 hours of video every minute.",
  "WebAssembly runs at near-native speed in your browser.",
  "Your video never leaves your device — zero server uploads.",
  "The word 'pixel' comes from 'picture element'.",
  "Slow-mo cameras can shoot over 1 million frames per second.",
  "H.265 (HEVC) can halve file size compared to H.264.",
  "The first digital video was recorded in 1956 by Ampex.",
  "A Blu-ray disc can hold up to 128GB of data.",
  "VHS tapes had roughly 240 lines of horizontal resolution.",
  "The average TikTok video is viewed 500+ times.",
  "Frame rate was standardized at 24fps for cinema in 1927.",
];

// ─── Memory Game Emojis ─────────────────────────────────
const gameEmojis = ["🎬", "🎥", "🎞️", "📹", "🎵", "🎧", "🔊", "⚡"];

// ─── Types ──────────────────────────────────────────────
type TabId = "facts" | "game" | "stats" | "animation";

interface ProcessingScreenProps {
  progress: number;
  label?: string;
  forceMinimized?: boolean;
}

// ─── Fun Facts Tab ──────────────────────────────────────
function FunFactsTab() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * funFacts.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % funFacts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </div>
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">Did you know?</p>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="text-base text-zinc-300 text-center leading-relaxed max-w-md"
        >
          {funFacts[index]}
        </motion.p>
      </AnimatePresence>
      <div className="flex gap-1.5 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === index % 5 ? "bg-blue-400 scale-110" : "bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Memory Game Tab ────────────────────────────────────
function MemoryGameTab() {
  const [cards, setCards] = useState<{ emoji: string; id: number; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const lockRef = useRef(false);

  const initGame = useCallback(() => {
    const shuffled = [...gameEmojis, ...gameEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ emoji, id: i, flipped: false, matched: false }));
    setCards(shuffled);
    setSelected([]);
    setMoves(0);
    setWon(false);
    lockRef.current = false;
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (id: number) => {
    if (lockRef.current) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    const newSelected = [...selected, id];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      lockRef.current = true;
      setMoves((m) => m + 1);
      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c) =>
              c.id === a || c.id === b ? { ...c, matched: true } : c
            );
            if (updated.every((c) => c.matched)) setWon(true);
            return updated;
          });
          setSelected([]);
          lockRef.current = false;
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c))
          );
          setSelected([]);
          lockRef.current = false;
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-6">
      {won ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-emerald-400 mb-2">You won!</p>
          <p className="text-sm text-zinc-500 mb-4">{moves} moves</p>
          <button
            onClick={initGame}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 glass hover:bg-white/10 transition-all"
          >
            Play Again
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-between w-full max-w-[320px] mb-4 px-1">
            <p className="text-sm text-zinc-400 font-medium">Match the pairs</p>
            <p className="text-sm text-zinc-500">
              Moves: <span className="text-zinc-200 font-semibold">{moves}</span>
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3 w-full max-w-[320px]">
            {cards.map((card) => (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                whileTap={{ scale: 0.9 }}
                className={`
                  aspect-square rounded-2xl text-2xl flex items-center justify-center
                  transition-all duration-200
                  ${card.flipped || card.matched
                    ? "bg-white/10 border border-white/15 shadow-lg"
                    : "bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.06] cursor-pointer"
                  }
                  ${card.matched ? "opacity-40" : ""}
                `}
              >
                <span className={`transition-all duration-200 ${card.flipped || card.matched ? "scale-100" : "scale-0"}`}>
                  {card.emoji}
                </span>
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Stats Tab ──────────────────────────────────────────
function StatsTab({ progress }: { progress: number }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const estimatedTotal = progress > 5 ? Math.round(elapsed / (progress / 100)) : null;
  const remaining = estimatedTotal ? Math.max(0, estimatedTotal - elapsed) : null;

  const milestones = [25, 50, 75, 100];

  return (
    <div className="flex flex-col flex-1 justify-center gap-6 py-6 px-2">
      {/* Time stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">Elapsed</p>
          <p className="text-2xl font-bold text-zinc-200 tabular-nums">{formatElapsed(elapsed)}</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">Remaining</p>
          <p className="text-2xl font-bold text-zinc-200 tabular-nums">
            {remaining !== null ? `~${formatElapsed(remaining)}` : "..."}
          </p>
        </div>
      </div>

      {/* Milestones */}
      <div className="flex items-center justify-between px-4">
        {milestones.map((m, i) => {
          const reached = progress >= m;
          return (
            <div key={m} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={false}
                  animate={{
                    scale: reached ? [1, 1.3, 1] : 1,
                    backgroundColor: reached ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                  }}
                  transition={{ duration: 0.4 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                >
                  {reached ? (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  ) : (
                    <span className="text-xs text-zinc-600 font-semibold">{m}%</span>
                  )}
                </motion.div>
                <span className={`text-[11px] font-semibold ${reached ? "text-emerald-400" : "text-zinc-600"}`}>
                  {m}%
                </span>
              </div>
              {i < milestones.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 rounded-full mb-6 ${progress >= milestones[i + 1] ? "bg-emerald-500/30" : "bg-white/5"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Animation Tab ──────────────────────────────────────
function AnimationTab({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-8">
      <div className="relative w-40 h-40">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-cyan-500/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner ring */}
        <motion.div
          className="absolute inset-8 rounded-full border-2 border-teal-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbiting dots */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.7)]" />
        </motion.div>
        <motion.div
          className="absolute inset-4"
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.7)]" />
        </motion.div>
        <motion.div
          className="absolute inset-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.7)]" />
        </motion.div>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center backdrop-blur-sm"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </motion.div>
        </div>
      </div>

      <div className="text-center">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-base text-zinc-400 font-medium"
        >
          {progress < 30 ? "Warming up the engine..." :
           progress < 60 ? "Crunching frames..." :
           progress < 90 ? "Almost there..." :
           "Finalizing..."}
        </motion.p>
      </div>
    </div>
  );
}

// ─── Tabs ───────────────────────────────────────────────
const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "animation",
    label: "Vibes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
  },
  {
    id: "facts",
    label: "Fun Facts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  {
    id: "game",
    label: "Game",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <circle cx="17" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "stats",
    label: "Stats",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

// ─── Minimized Pip ───────────────────────────────────────
function MinimizedPip({
  progress,
  label,
  elapsed,
  onExpand,
}: {
  progress: number;
  label?: string;
  elapsed: number;
  onExpand: () => void;
}) {
  const estimatedTotal = progress > 5 ? Math.round(elapsed / (progress / 100)) : null;
  const remaining = estimatedTotal ? Math.max(0, estimatedTotal - elapsed) : null;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      onClick={onExpand}
      className="fixed bottom-5 right-5 z-50 w-72 rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl cursor-pointer group hover:border-white/20 transition-colors"
    >
      <div className="px-4 pt-3.5 pb-3">
        {/* Top row: spinner + label + percentage + expand */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin shrink-0">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span className="text-xs font-medium text-zinc-400 truncate">
              {label || "Processing..."}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AnimatedCounter value={progress} className="text-xs font-bold text-zinc-100" />
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 group-hover:bg-white/10 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              background: "linear-gradient(90deg, #3b82f6, #06b6d4, #14b8a6)",
            }}
          />
        </div>

        {/* Time stats */}
        <div className="flex items-center justify-between text-[11px] text-zinc-600">
          <span>Elapsed {fmt(elapsed)}</span>
          <span>{remaining !== null ? `~${fmt(remaining)} left` : "Estimating..."}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component — Full-screen Modal ─────────────────
export default function ProcessingScreen({ progress, label, forceMinimized }: ProcessingScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>("animation");
  const [userMinimized, setUserMinimized] = useState(false);
  const minimized = forceMinimized || userMinimized;
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const modalRef = useRef<HTMLDivElement>(null);

  // Elapsed timer (lifted to parent so it persists across minimize/expand)
  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Prevent body scroll while modal is expanded
  useEffect(() => {
    if (minimized) {
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [minimized]);

  // Focus trap — keep focus inside the modal (only when expanded)
  useEffect(() => {
    if (minimized) return;
    const modal = modalRef.current;
    if (!modal) return;

    modal.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [minimized]);

  return (
    <AnimatePresence mode="wait">
      {minimized ? (
        <MinimizedPip
          key="pip"
          progress={progress}
          label={label}
          elapsed={elapsed}
          onExpand={() => setUserMinimized(false)}
        />
      ) : (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={label || "Processing video"}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" aria-hidden="true" />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] outline-none"
          >
            {/* Minimize button */}
            <button
              onClick={() => setUserMinimized(true)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-all"
              aria-label="Minimize to corner"
              title="Minimize"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>

            {/* ── Progress Section (top) ── */}
            <div className="px-6 pt-6 pb-4 border-b border-white/5">
              {/* Label + percentage */}
              <div className="flex items-center justify-between mb-3 pr-10">
                <div className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span className="text-sm font-medium text-zinc-300">
                    {label || "Processing locally..."}
                  </span>
                </div>
                <AnimatedCounter value={progress} className="text-sm font-bold text-zinc-100" />
              </div>

              {/* Progress bar */}
              <div
                className="w-full h-3 rounded-full bg-white/5 overflow-hidden"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Processing: ${progress}%`}
              >
                <motion.div
                  className="h-full rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    background: "linear-gradient(90deg, #3b82f6, #06b6d4, #14b8a6)",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s linear infinite",
                    }}
                  />
                  <motion.div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      background: "radial-gradient(circle, rgba(6,182,212,0.8), transparent)",
                      filter: "blur(4px)",
                    }}
                  />
                </motion.div>
              </div>

              {/* Time estimate + privacy badge */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-[11px] text-zinc-600">
                    Your file stays on your device
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 tabular-nums" aria-live="polite">
                  {(() => {
                    const est = progress > 5 ? Math.round(elapsed / (progress / 100)) : null;
                    const rem = est ? Math.max(0, est - elapsed) : null;
                    if (rem === null) return "Estimating...";
                    const m = Math.floor(rem / 60);
                    const s = rem % 60;
                    return `~${m}:${s.toString().padStart(2, "0")} left`;
                  })()}
                </span>
              </div>
            </div>

            {/* ── Tab Selector ── */}
            <div className="flex px-4 pt-3 pb-0 gap-1" role="tablist" aria-label="Processing entertainment">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold
                    transition-all duration-200 flex-1 justify-center
                    ${activeTab === tab.id
                      ? "text-zinc-100 bg-white/10 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-400 hover:bg-white/[0.03]"
                    }
                  `}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ── Entertainment Content ── */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-[280px] flex flex-col" role="tabpanel" aria-label={activeTab}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
                >
                  {activeTab === "facts" && <FunFactsTab />}
                  {activeTab === "game" && <MemoryGameTab />}
                  {activeTab === "stats" && <StatsTab progress={progress} />}
                  {activeTab === "animation" && <AnimationTab progress={progress} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
