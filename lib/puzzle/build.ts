import type { BracketSpec, Puzzle } from "./types";
import { attachAnswers, parseBracketString, reconstructSentence } from "./parser";

export interface BuildPuzzleInput {
  id: string;
  date: string;
  title: string;
  bracketString: string;
  specs: BracketSpec[];
  finalSentence: string;
  historicalContext?: string;
  maxScore?: number;
  tags?: string[];
}

export function buildPuzzle(input: BuildPuzzleInput): Puzzle {
  const { tree, bracketOrder } = parseBracketString(input.bracketString);
  attachAnswers(bracketOrder, input.specs);
  const reconstructed = reconstructSentence(tree);
  if (reconstructed.trim() !== input.finalSentence.trim()) {
    throw new Error(
      `Final sentence mismatch.\n  expected: "${input.finalSentence}"\n  got:      "${reconstructed}"`,
    );
  }
  return {
    id: input.id,
    date: input.date,
    title: input.title,
    finalSentence: input.finalSentence,
    historicalContext: input.historicalContext,
    tree,
    totalBrackets: bracketOrder.length,
    maxScore: input.maxScore ?? 100,
    language: "he",
    tags: input.tags ?? [],
  };
}
