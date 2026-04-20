"use client";

import type { UsePuzzleGame } from "./usePuzzleGame";

export function ControlsBar({ game }: { game: UsePuzzleGame }) {
  const activeId = game.game.activeNodeId;
  const canAct = !!game.activeNode && !game.complete;
  const alreadyPeeked = !!activeId && game.game.peeks.has(activeId);
  const alreadyRevealed = !!activeId && game.game.reveals.has(activeId);

  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-stretch gap-2">
        <div
          className="flex-1 rounded-md px-4 py-3 puzzle-mono text-[15px] min-h-[46px]"
          style={{ border: "1px solid #a5b4fc66", backgroundColor: "#ffffff", color: "#171412" }}
          aria-label="מה שאתם מקלידים כעת"
        >
          {game.input ? (
            <span>{game.input}</span>
          ) : (
            <span style={{ color: "#6b6356", opacity: 0.8 }}>הקלידו תשובה…</span>
          )}
          <span className="caret" />
        </div>
        <button
          type="button"
          onClick={game.submit}
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
