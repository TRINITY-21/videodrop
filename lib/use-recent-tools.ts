"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "videodrop-recent-tools";
const MAX_RECENT = 3;

export function useRecentTools() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  const trackTool = useCallback((href: string) => {
    setRecent((prev) => {
      const next = [href, ...prev.filter((h) => h !== href)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { recent, trackTool };
}
