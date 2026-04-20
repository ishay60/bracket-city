"use client";

import { useEffect, useRef } from "react";
import type { UsePuzzleGame } from "./usePuzzleGame";

export function ControlsBar({ game }: { game: UsePuzzleGame }) {
  const activeId = game.game.activeNodeId;
  const canAct = !!game.activeNode && !game.complete;
  const alreadyPeeked = !!activeId && game.game.peeks.has(activeId);
  const alreadyRevealed = !!activeId && game.game.reveals.has(activeId);

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
            if (e.key === "Tab") {
              e.preventDefault();
              game.cycleActive(e.shiftKey ? "prev" : "next");
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
          אין צורך ללחוץ — פשוט התחילו להקליד. Enter לשליחה · Tab למעבר · Esc לניקוי
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={game.peek}
          disabled={!canAct || alreadyPeeked || alreadyRevealed}
          className="px-3 py-1 rounded-md border border-amber-300 bg-amber-50 text-amber-800 puzzle-mono text-[12px] hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          [peek −5]
        </button>
        <button
          type="button"
          onClick={game.reveal}
          disabled={!canAct || alreadyRevealed}
          className="px-3 py-1 rounded-md border border-rose-300 bg-rose-50 text-rose-800 puzzle-mono text-[12px] hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          [reveal −20]
        </button>
      </div>
    </div>
  );
}
