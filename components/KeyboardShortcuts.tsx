"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // Cmd/Ctrl + Enter → click the primary action button
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        const btn = document.querySelector<HTMLButtonElement>(
          'button[class*="bg-gradient-to-r"]'
        );
        if (btn && !btn.disabled) btn.click();
      }

      // Escape → click reset/remove button or close modal
      if (e.key === "Escape") {
        // Don't handle if processing modal handles it
        const modal = document.querySelector('[role="dialog"]');
        if (modal) return;

        const removeBtn = document.querySelector<HTMLButtonElement>('button[title="Change file"]');
        if (removeBtn) {
          e.preventDefault();
          removeBtn.click();
        }
      }

      // ? → show shortcuts help
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHelp((v) => !v);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const shortcuts = [
    { keys: ["Cmd", "Enter"], desc: "Process / Execute" },
    { keys: ["Esc"], desc: "Reset / Go back" },
    { keys: ["?"], desc: "Toggle shortcuts help" },
  ];

  return (
    <AnimatePresence>
      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl p-6 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-3">
              {shortcuts.map((s) => (
                <div key={s.desc} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-white/8 hover:bg-white/5 transition-all"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
