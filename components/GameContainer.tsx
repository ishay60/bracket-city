"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { findPuzzleByDate, neighborPuzzleDate, samplePuzzle } from "@/lib/puzzle/samplePuzzles";
import { computeScore, findNode, RANK_LABEL_HE } from "@/lib/puzzle";
import type { Puzzle } from "@/lib/puzzle";
import { AnswerBank } from "./AnswerBank";
import { Confetti } from "./Confetti";
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
  const previewEnd =
    process.env.NEXT_PUBLIC_WORKSPACE === "local" &&
    params?.get("preview") === "end";
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
      previewEnd={previewEnd}
    />
  );
}

function GameInstance({
  puzzle,
  setDate,
  helpOpen,
  setHelpOpen,
  previewEnd,
}: {
  puzzle: Puzzle;
  setDate: (d: string) => void;
  helpOpen: boolean;
  setHelpOpen: (v: boolean) => void;
  previewEnd: boolean;
}) {
  const game = usePuzzleGame(puzzle);
  const streak = useStreak();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (previewEnd && !game.complete) game.forceComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewEnd, puzzle.id]);

  useEffect(() => {
    if (!game.complete) return;
    const score = computeScore(puzzle, game.game);
    if (!previewEnd) {
      streak.recordCompletion(puzzle.date, score.finalScore, RANK_LABEL_HE[score.rank]);
    }
    setAnnouncement(
      `נפתר! דרגה ${RANK_LABEL_HE[score.rank]}, ניקוד ${score.finalScore}. המשפט המלא: ${puzzle.finalSentence}.`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.complete]);

  useEffect(() => {
    if (!game.popNodeId) return;
    const n = findNode(puzzle.tree, game.popNodeId);
    if (n?.answer) setAnnouncement(`נפתר: ${n.answer}`);
  }, [game.popNodeId, puzzle.tree]);

  useEffect(() => {
    if (!game.shakeNodeId) return;
    setAnnouncement("תשובה שגויה");
  }, [game.shakeNodeId]);

  const prev = neighborPuzzleDate(puzzle.date, "prev");
  const next = neighborPuzzleDate(puzzle.date, "next");

  return (
    <main className="mx-auto max-w-2xl px-2 sm:px-4 py-3 sm:py-10">
      <article
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e7e0d0",
          boxShadow: "0 1px 0 rgba(0,0,0,0.03), 0 12px 30px -18px rgba(0,0,0,0.15)",
        }}
      >
        <div className="px-3 sm:px-6 pt-3 sm:pt-5">
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
        {game.complete ? null : (
          <>
            <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
              <PuzzleBoard tree={puzzle.tree} game={game} />
              <AnswerBank tree={puzzle.tree} game={game} />
            </div>
            <div className="px-3 sm:px-6 pb-3 sm:pb-6 pt-3" style={{ borderTop: "1px solid #e7e0d0" }}>
              <ControlsBar game={game} />
            </div>
          </>
        )}
      </article>

      {game.complete ? (
        <EndGameScreen
          puzzle={puzzle}
          game={game}
          streak={streak.data.current}
          longestStreak={streak.data.longest}
        />
      ) : null}

      <Confetti active={game.complete} />

      <footer className="mt-6 text-center puzzle-mono text-[11px] flex items-center justify-center gap-3" style={{ color: "#6b6356" }}>
        <span>מאמר מוסגר · גרסת עברית</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <a href="/admin" className="underline-offset-4 hover:underline">סטודיו</a>
      </footer>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {announcement}
      </div>
    </main>
  );
}
