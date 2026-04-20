import type { PuzzleNode } from "./types";

/**
 * Returns the raw clue text of a bracket, with nested brackets written back
 * as [their inner clue]. Used for peek display, validation, and debugging.
 */
export function clueText(node: PuzzleNode): string {
  return (node.children ?? [])
    .map((c) => {
      if (c.type === "text") return c.content ?? "";
      if (c.type === "bracket") return `[${clueText(c)}]`;
      return "";
    })
    .join("");
}

/**
 * Returns the clue with nested solved brackets substituted for their answers.
 * Unresolved nested brackets keep their clue in-place.
 */
export function resolvedClueText(node: PuzzleNode, solved: Set<string>): string {
  return (node.children ?? [])
    .map((c) => {
      if (c.type === "text") return c.content ?? "";
      if (c.type === "bracket") {
        if (solved.has(c.id)) return c.answer ?? "";
        return `[${resolvedClueText(c, solved)}]`;
      }
      return "";
    })
    .join("");
}
