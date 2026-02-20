"use client";

interface TrimControlsProps {
  startTime: string;
  endTime: string;
  onStartChange: (t: string) => void;
  onEndChange: (t: string) => void;
  maxDuration?: number;
}

export default function TrimControls({
  startTime,
  endTime,
  onStartChange,
  onEndChange,
}: TrimControlsProps) {
  return (
    <div className="w-full">
      <label className="text-sm font-medium text-zinc-300 mb-3 block">
        Trim Range
      </label>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-[11px] text-zinc-500 mb-1.5 block uppercase tracking-wider">
            Start
          </label>
          <input
            type="text"
            value={startTime}
            onChange={(e) => onStartChange(e.target.value)}
            placeholder="00:00:00"
            className="
              w-full px-4 py-3 rounded-xl text-sm font-mono
              bg-white/[0.03] border border-white/10
              text-zinc-200 placeholder-zinc-600
              focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]
              transition-all
            "
          />
        </div>

        <div className="pt-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>

        <div className="flex-1">
          <label className="text-[11px] text-zinc-500 mb-1.5 block uppercase tracking-wider">
            End
          </label>
          <input
            type="text"
            value={endTime}
            onChange={(e) => onEndChange(e.target.value)}
            placeholder="00:01:00"
            className="
              w-full px-4 py-3 rounded-xl text-sm font-mono
              bg-white/[0.03] border border-white/10
              text-zinc-200 placeholder-zinc-600
              focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]
              transition-all
            "
          />
        </div>
      </div>
      <p className="text-[11px] text-zinc-600 mt-2">
        Format: HH:MM:SS (e.g. 00:00:30 to 00:01:45)
      </p>
    </div>
  );
}
