import type { Puzzle } from "./types";
import type { GameState, Rank } from "./engine";

export const PENALTY = {
  wrong: 2,
  peek: 5,
  reveal: 20,
} as const;

export interface ScoreBreakdown {
  base: number;
  wrongPenalty: number;
  peekPenalty: number;
  revealPenalty: number;
  finalScore: number;
  rank: Rank;
  efficiency: number | null;
}

export function computeLiveScore(puzzle: Puzzle, state: GameState): number {
  const total =
    puzzle.maxScore -
    state.wrongGuesses * PENALTY.wrong -
    state.peeks.size * PENALTY.peek -
    state.reveals.size * PENALTY.reveal;
  return Math.max(0, total);
}

export function computeScore(puzzle: Puzzle, state: GameState): ScoreBreakdown {
  const base = puzzle.maxScore;
  const wrongPenalty = state.wrongGuesses * PENALTY.wrong;
  const peekPenalty = state.peeks.size * PENALTY.peek;
  const revealPenalty = state.reveals.size * PENALTY.reveal;
  const finalScore = Math.max(0, base - wrongPenalty - peekPenalty - revealPenalty);

  let rank: Rank;
  if (state.wrongGuesses === 0 && state.peeks.size === 0 && state.reveals.size === 0) {
    rank = "kingmaker";
  } else if (finalScore >= base * 0.75) {
    rank = "mayor";
  } else if (finalScore >= base * 0.4) {
    rank = "commuter";
  } else {
    rank = "tourist";
  }

  const efficiency =
    state.keystrokes > 0
      ? Math.min(1, minKeystrokes(puzzle) / state.keystrokes)
      : null;

  return { base, wrongPenalty, peekPenalty, revealPenalty, finalScore, rank, efficiency };
}

function minKeystrokes(puzzle: Puzzle): number {
  let sum = 0;
  const visit = (n: import("./types").PuzzleNode) => {
    if (n.type === "bracket" && n.answer) sum += n.answer.replace(/\s/g, "").length + 1;
    n.children?.forEach(visit);
  };
  visit(puzzle.tree);
  return sum;
}

export const RANK_LABEL_HE: Record<Rank, string> = {
  tourist: "תייר",
  commuter: "נוסע יומי",
  mayor: "ראש עיר",
  kingmaker: "בורא המלכים",
};
