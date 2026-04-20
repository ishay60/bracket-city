"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { findPuzzleByDate, neighborPuzzleDate, samplePuzzle } from "@/lib/puzzle/samplePuzzles";
import { computeScore, RANK_LABEL_HE } from "@/lib/puzzle";
import type { Puzzle } from "@/lib/puzzle";
import { AnswerBank } from "./AnswerBank";
import { ControlsBar } from "./ControlsBar";
import { EndGameScreen } from "./EndGameScreen";
import { HelpDialog } from "./HelpDialog";
import { HUD } from "./HUD";
import { PuzzleBoard } from "./PuzzleBoard";
import { usePuzzleGame } from "./usePuzzleGame";
import { useStreak } from "./useStreak";

export function GameContainer() {
  const params = useSearchParams();
  const initialDate = params?.get("date") && findPuzzleByDate(params.get("date")!)
    ? params.get("date")!
    : samplePuzzle.date;
  const [date, setDate] = useState(initialDate);
  const [helpOpen, setHelpOpen] = useState(false);
  const puzzle = useMemo(() => findPuzzleByDate(date) ?? samplePuzzle, [date]);

  // Keying the instance on puzzle.id gives us a clean hook mount per puzzle,
  // so switching dates fully resets the game state.
  return (
    <GameInstance
      key={puzzle.id}
      puzzle={puzzle}
      setDate={setDate}
      helpOpen={helpOpen}
      setHelpOpen={setHelpOpen}
    />
  );
}

function GameInstance({
  puzzle,
  setDate,
  helpOpen,
  setHelpOpen,
}: {
  puzzle: Puzzle;
  setDate: (d: string) => void;
  helpOpen: boolean;
  setHelpOpen: (v: boolean) => void;
}) {
  const game = usePuzzleGame(puzzle);
  const streak = useStreak();

  useEffect(() => {
    if (!game.complete) return;
    const score = computeScore(puzzle, game.game);
    streak.recordCompletion(puzzle.date, score.finalScore, RANK_LABEL_HE[score.rank]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.complete]);

  const prev = neighborPuzzleDate(puzzle.date, "prev");
  const next = neighborPuzzleDate(puzzle.date, "next");

  return (
    <main className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-10">
      <article
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e7e0d0",
          boxShadow: "0 1px 0 rgba(0,0,0,0.03), 0 12px 30px -18px rgba(0,0,0,0.15)",
        }}
      >
        <div className="px-4 sm:px-6 pt-5">
          <HUD
            puzzle={puzzle}
            game={game}
            streak={streak.data.current}
            hasPrev={!!prev}
            hasNext={!!next}
            onPrev={() => prev && setDate(prev)}
            onNext={() => next && setDate(next)}
            onShowHelp={() => setHelpOpen(true)}
          />
        </div>
        <div className="px-4 sm:px-6 pt-6 pb-2">
          <PuzzleBoard tree={puzzle.tree} game={game} />
          <AnswerBank tree={puzzle.tree} game={game} />
        </div>
        <div className="px-4 sm:px-6 pb-6 pt-3" style={{ borderTop: "1px solid #e7e0d0" }}>
          <ControlsBar game={game} />
        </div>
      </article>

      {game.complete ? (
        <EndGameScreen puzzle={puzzle} game={game} streak={streak.data.current} />
      ) : null}

      <footer className="mt-6 text-center puzzle-mono text-[11px] flex items-center justify-center gap-3" style={{ color: "#6b6356" }}>
        <span>עיר הסוגריים · גרסת עברית · פאזה 3 · השראה: Bracket City מאת בן גרוס / The Atlantic</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <a href="/admin" className="underline-offset-4 hover:underline">סטודיו</a>
      </footer>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>
  );
}
