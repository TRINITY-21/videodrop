"use client";

import { motion } from "framer-motion";

type Quality = "light" | "medium" | "heavy";

interface QualitySliderProps {
  value: Quality;
  onChange: (q: Quality) => void;
}

const options: { value: Quality; label: string; desc: string }[] = [
  { value: "light", label: "Light", desc: "Best quality, smaller reduction" },
  { value: "medium", label: "Medium", desc: "Balanced quality & size" },
  { value: "heavy", label: "Heavy", desc: "Maximum compression" },
];

export default function QualitySlider({ value, onChange }: QualitySliderProps) {
  return (
    <div className="w-full">
      <label className="text-sm font-medium text-zinc-300 mb-3 block">
        Compression Level
      </label>
      <div className="flex gap-2">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`
                relative flex-1 py-3 px-4 rounded-xl text-sm font-medium
                transition-colors duration-200 border
                ${
                  isActive
                    ? "bg-blue-500/15 border-blue-500/40 text-blue-300 shadow-glow-blue"
                    : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/10"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="quality-active"
                  className="absolute inset-0 rounded-xl bg-blue-500/15 border border-blue-500/40"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <div className="font-semibold">{opt.label}</div>
                <div className="text-[11px] mt-0.5 opacity-70">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
