"use client";

import type { Puzzle } from "@/lib/puzzle";
import { ControlsBar } from "../ControlsBar";
import { PuzzleBoard } from "../PuzzleBoard";
import { usePuzzleGame } from "../usePuzzleGame";
import { AnswerBank } from "../AnswerBank";

/**
 * Lightweight preview — reuses the player hook + board, skips HUD/nav/streak.
 * Used inside the builder so authors can playtest without leaving the page.
 */
export function GameContainerPreview({ puzzle }: { puzzle: Puzzle }) {
  const game = usePuzzleGame(puzzle);
  return (
    <div
      key={puzzle.id}
      className="rounded-md p-3"
      style={{ backgroundColor: "#fbfaf4", border: "1px dashed #d6d3d1" }}
    >
      <PuzzleBoard tree={puzzle.tree} game={game} />
      <AnswerBank tree={puzzle.tree} game={game} />
      <div className="mt-3">
        <ControlsBar game={game} />
      </div>
      {game.complete ? (
        <div
          className="mt-3 rounded-md p-2 puzzle-mono text-[12px] text-center"
          style={{ backgroundColor: "#ecfdf5", color: "#047857" }}
        >
          ✓ נפתר בהצלחה — המשפט המלא: {puzzle.finalSentence}
        </div>
      ) : null}
    </div>
  );
}
