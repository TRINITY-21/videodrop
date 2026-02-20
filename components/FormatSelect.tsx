"use client";

import { motion } from "framer-motion";
import { FORMATS } from "@/lib/formats";

interface FormatSelectProps {
  value: string;
  onChange: (format: string) => void;
  currentFormat?: string;
}

const formatColors: Record<string, string> = {
  mp4: "#3b82f6",
  webm: "#06b6d4",
  mov: "#14b8a6",
  avi: "#f59e0b",
  mkv: "#10b981",
};

export default function FormatSelect({ value, onChange, currentFormat }: FormatSelectProps) {
  return (
    <div className="w-full">
      <label className="text-sm font-medium text-zinc-300 mb-3 block">
        Output Format
      </label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(FORMATS).map(([key, fmt]) => {
          const isActive = value === key;
          const isCurrent = currentFormat?.toLowerCase().includes(key);
          const hex = formatColors[key] || "#3b82f6";

          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              disabled={isCurrent}
              className={`
                relative px-5 py-3 rounded-xl text-sm font-semibold
                transition-colors duration-200 border
                ${isCurrent
                  ? "bg-white/[0.02] border-white/5 text-zinc-600 cursor-not-allowed"
                  : isActive
                    ? "text-zinc-200"
                    : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/10"
                }
              `}
              style={
                isActive && !isCurrent
                  ? {
                      backgroundColor: `color-mix(in srgb, ${hex} 15%, transparent)`,
                      borderColor: `color-mix(in srgb, ${hex} 40%, transparent)`,
                    }
                  : undefined
              }
            >
              {isActive && !isCurrent && (
                <motion.div
                  layoutId="format-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${hex} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${hex} 30%, transparent)`,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {fmt.label}
                {isCurrent && <span className="ml-1.5 text-[10px] opacity-50">(current)</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
