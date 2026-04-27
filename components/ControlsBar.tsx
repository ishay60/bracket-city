"use client";

import { useEffect, useRef } from "react";
import type { UsePuzzleGame } from "./usePuzzleGame";

export function ControlsBar({ game }: { game: UsePuzzleGame }) {
  const activeId = game.game.activeNodeId;
  const canAct = !!game.activeNode && !game.complete;

  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on the input so every keystroke lands here, and re-focus when
  // the active bracket advances (so the player never has to click again).
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId, game.complete]);

  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-stretch gap-2">
        <input
          ref={inputRef}
          type="text"
          dir="auto"
          autoFocus
          value={game.input}
          onChange={(e) => game.setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              game.submit();
              return;
            }
            if (e.key === "Escape") {
              e.preventDefault();
              game.setInputValue("");
              return;
            }
          }}
          disabled={!canAct}
          placeholder="הקלידו תשובה…"
          aria-label="תיבת התשובה"
          className="flex-1 rounded-md px-4 py-3 puzzle-mono text-[15px] min-h-[46px] outline-none disabled:opacity-50"
          style={{
            border: "1px solid #a5b4fc66",
            backgroundColor: "#ffffff",
            color: "#171412",
          }}
        />
        <button
          type="button"
          onClick={() => {
            game.submit();
            inputRef.current?.focus();
          }}
          disabled={!canAct}
          className="px-4 rounded-md puzzle-mono text-[14px] tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition"
          style={{ backgroundColor: "#171412", color: "#fbfaf4" }}
        >
          [enter]
        </button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="puzzle-mono text-[12px]" style={{ color: "#6b6356" }}>
          אין צורך ללחוץ — פשוט התחילו להקליד. Enter לשליחה · Esc לניקוי · לחיצה על סוגר כחול לעזרה
        </span>
        <div className="flex-1" />
      </div>
    </div>
  );
}
