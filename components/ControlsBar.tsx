"use client";

import { useEffect, useRef, useState } from "react";
import type { UsePuzzleGame } from "./usePuzzleGame";
import { HebrewKeyboard } from "./HebrewKeyboard";

export function ControlsBar({ game }: { game: UsePuzzleGame }) {
  const activeId = game.game.activeNodeId;
  const canAct = !!game.activeNode && !game.complete;

  const inputRef = useRef<HTMLInputElement>(null);
  const [wrongFlash, setWrongFlash] = useState(false);

  // Keep focus on the input so every keystroke lands here, and re-focus when
  // the active bracket advances (so the player never has to click again).
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId, game.complete]);

  // Flash the input red on a wrong guess. shakeNodeId is the on-board signal.
  useEffect(() => {
    if (!game.shakeNodeId) return;
    setWrongFlash(true);
    const t = setTimeout(() => setWrongFlash(false), 480);
    return () => clearTimeout(t);
  }, [game.shakeNodeId, game.tick]);

  const onKeyboardChar = (ch: string) => {
    if (!canAct) return;
    game.setInputValue(game.input + ch);
    inputRef.current?.focus();
  };
  const onKeyboardBackspace = () => {
    if (!canAct) return;
    game.setInputValue(game.input.slice(0, -1));
    inputRef.current?.focus();
  };
  const onKeyboardEnter = () => {
    if (!canAct) return;
    game.submit();
    inputRef.current?.focus();
  };

  return (
    <div className="mt-4 sm:mt-5 space-y-2">
      <div className="flex items-stretch gap-2">
        <input
          ref={inputRef}
          type="text"
          dir="auto"
          autoFocus
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
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
          aria-invalid={wrongFlash || undefined}
          className={
            "flex-1 rounded-md px-3 sm:px-4 py-2.5 sm:py-3 puzzle-mono text-[16px] sm:text-[15px] min-h-[44px] outline-none disabled:opacity-50 " +
            (wrongFlash ? "input-wrong" : "")
          }
          style={{
            border: wrongFlash ? "1px solid #f87171" : "1px solid #a5b4fc66",
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
          className="px-3 sm:px-4 rounded-md puzzle-mono text-[14px] tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition"
          style={{ backgroundColor: "#171412", color: "#fbfaf4" }}
        >
          [enter]
        </button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="puzzle-mono text-[11px] sm:text-[12px]" style={{ color: "#6b6356" }}>
          <span className="hidden sm:inline">
            אין צורך ללחוץ — פשוט התחילו להקליד. Enter לשליחה · Esc לניקוי · לחיצה על סוגר כחול לעזרה
          </span>
          <span className="sm:hidden">
            הקלידו תשובה · לחצו [enter] · לחיצה על סוגר כחול לרמז
          </span>
        </span>
        <div className="flex-1" />
        {wrongFlash ? (
          <span
            className="puzzle-mono text-[11px]"
            style={{ color: "#b91c1c" }}
            role="status"
            aria-live="polite"
          >
            תשובה שגויה
          </span>
        ) : null}
      </div>

      <div className="sm:hidden pt-1">
        <HebrewKeyboard
          disabled={!canAct}
          onChar={onKeyboardChar}
          onBackspace={onKeyboardBackspace}
          onEnter={onKeyboardEnter}
        />
      </div>
    </div>
  );
}
