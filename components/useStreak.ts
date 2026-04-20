"use client";

import { useEffect, useState } from "react";

const KEY = "bc-he:streak-v1";

interface StreakData {
  current: number;
  longest: number;
  lastPuzzleDate: string | null; // ISO yyyy-mm-dd of most recently completed puzzle
  completed: Record<string, { score: number; rank: string }>; // per-puzzle-date record
}

const empty: StreakData = { current: 0, longest: 0, lastPuzzleDate: null, completed: {} };

function load(): StreakData {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

function save(data: StreakData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota or disabled — ignore */
  }
}

function daysBetween(a: string, b: string): number {
  const ad = new Date(a + "T00:00:00");
  const bd = new Date(b + "T00:00:00");
  return Math.round((bd.getTime() - ad.getTime()) / 86_400_000);
}

export function useStreak() {
  const [data, setData] = useState<StreakData>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(load());
    setHydrated(true);
  }, []);

  const recordCompletion = (puzzleDate: string, score: number, rank: string) => {
    setData((prev) => {
      if (prev.completed[puzzleDate]) return prev; // already counted
      let current = prev.current;
      if (prev.lastPuzzleDate == null) current = 1;
      else {
        const diff = daysBetween(prev.lastPuzzleDate, puzzleDate);
        if (diff === 1) current = prev.current + 1;
        else if (diff === 0) current = Math.max(1, prev.current); // same day replay
        else current = 1;
      }
      const next: StreakData = {
        current,
        longest: Math.max(prev.longest, current),
        lastPuzzleDate: puzzleDate,
        completed: { ...prev.completed, [puzzleDate]: { score, rank } },
      };
      save(next);
      return next;
    });
  };

  return { data, hydrated, recordCompletion };
}
