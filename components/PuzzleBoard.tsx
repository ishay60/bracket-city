"use client";

import type { PuzzleNode } from "@/lib/puzzle";
import { isNodeSolvable } from "@/lib/puzzle";
import type { UsePuzzleGame } from "./usePuzzleGame";

interface Props {
  tree: PuzzleNode;
  game: UsePuzzleGame;
}

/**
 * Design reference: docs/design-research.md.
 * Core rule: locked brackets render as plain inline `[` `]` characters in the
 * prose. Only solvable leaves get the periwinkle fill. Solved brackets
 * disappear entirely.
 */
export function PuzzleBoard({ tree, game }: Props) {
  return (
    <div
      className="font-hebrew text-[19px] sm:text-[21px] leading-[1.9] text-[#171412]"
      style={{ fontFamily: '"David Libre", "Frank Ruhl Libre", "Times New Roman", serif' }}
    >
      <div className="whitespace-normal break-words">
        {tree.children?.map((n) => (
          <NodeView key={n.id} node={n} game={game} />
        ))}
      </div>
    </div>
  );
}

function NodeView({ node, game }: { node: PuzzleNode; game: UsePuzzleGame }) {
  if (node.type === "text") return <TextRun content={node.content ?? ""} />;
  if (node.type === "bracket") return <BracketView node={node} game={game} />;
  return null;
}

/** Hebrew letters in serif; Latin + digits rendered monospace for typewriter feel. */
function TextRun({ content }: { content: string }) {
  const parts: { kind: "he" | "mono"; text: string }[] = [];
  let cur: { kind: "he" | "mono"; text: string } | null = null;
  for (const ch of content) {
    const isLatinOrDigit = /[A-Za-z0-9]/.test(ch);
    const kind: "he" | "mono" = isLatinOrDigit ? "mono" : "he";
    if (!cur || cur.kind !== kind) {
      cur = { kind, text: ch };
      parts.push(cur);
    } else {
      cur.text += ch;
    }
  }
  return (
    <>
      {parts.map((p, i) =>
        p.kind === "mono" ? (
          <span key={i} className="puzzle-mono text-[0.92em]">
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

function BracketView({ node, game }: { node: PuzzleNode; game: UsePuzzleGame }) {
  const { game: state, popNodeId, shakeNodeId, setActive } = game;
  const solved = state.solved.has(node.id);
  const solvable = isNodeSolvable(node, state.solved);
  const active = state.activeNodeId === node.id;
  const peeked = state.peeks.has(node.id);
  const revealed = state.reveals.has(node.id);
  const justSolved = popNodeId === node.id;
  const shaking = shakeNodeId === node.id;

  if (solved) {
    return (
      <span
        className={justSolved ? "inline-block animate-solvePop" : "inline"}
        aria-label={revealed ? `נחשף: ${node.answer}` : `נפתר: ${node.answer}`}
      >
        {revealed ? (
          <span className="underline decoration-dotted decoration-rose-400/70 underline-offset-2">
            <TextRun content={node.answer ?? ""} />
          </span>
        ) : (
          <TextRun content={node.answer ?? ""} />
        )}
      </span>
    );
  }

  // Active solvable bracket — the player's input lives in the ControlsBar box,
  // not inside the prose. The active bracket is a brighter pill that still
  // shows its clue, marking "this is what you're answering right now."
  if (active && solvable) {
    return (
      <span
        className={
          "inline rounded-[4px] px-[3px] " +
          (shaking ? "animate-shake inline-block" : "")
        }
        style={{
          backgroundColor: "#a5b4fc",
          color: "#1e1b4b",
          boxShadow: "0 0 0 2px #6366f1",
        }}
        role="group"
        aria-current="true"
        aria-label={`סוגר פעיל — רמז: ${node.clue ?? ""}${peeked ? " (הוצץ)" : ""}`}
      >
        <span aria-hidden style={{ opacity: 0.65 }}>[</span>
        <span>{peeked ? renderPeek(node) : renderLeafClue(node, state.solved)}</span>
        <span aria-hidden style={{ opacity: 0.65 }}>]</span>
      </span>
    );
  }

  if (solvable) {
    return (
      <button
        type="button"
        onClick={() => setActive(node.id)}
        className="inline rounded-[4px] px-[3px] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
        style={{ backgroundColor: "#c7d2fe", color: "#1e1b4b", fontFamily: "inherit", fontSize: "inherit" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a5b4fc")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c7d2fe")}
        aria-label={`סוגר פתיר — רמז: ${node.clue ?? ""}${peeked ? " (הוצץ)" : ""}. לחצו להפעלה.`}
      >
        <span aria-hidden style={{ opacity: 0.65 }}>[</span>
        <span>{peeked ? renderPeek(node) : renderLeafClue(node, state.solved)}</span>
        <span aria-hidden style={{ opacity: 0.65 }}>]</span>
      </button>
    );
  }

  // LOCKED — plain inline `[` `]` as part of the prose
  return (
    <span role="group" aria-label="סוגר נעול — השלימו את הסוגרים שבפנים">
      <span>[</span>
      {(node.children ?? []).map((c) => (
        <NodeView key={c.id} node={c} game={game} />
      ))}
      <span>]</span>
    </span>
  );
}

function renderLeafClue(node: PuzzleNode, solved: Set<string>): React.ReactNode {
  return (node.children ?? []).map((c) => {
    if (c.type === "text") return <TextRun key={c.id} content={c.content ?? ""} />;
    if (c.type === "bracket") {
      if (solved.has(c.id)) {
        return (
          <span key={c.id} style={{ fontWeight: 600 }}>
            <TextRun content={c.answer ?? ""} />
          </span>
        );
      }
      return null;
    }
    return null;
  });
}

function renderPeek(node: PuzzleNode): React.ReactNode {
  const ans = node.answer ?? "";
  const first = ans[0] ?? "";
  const rest = ans.slice(1);
  return (
    <span>
      <span style={{ fontWeight: 700 }}>{first}</span>
      <span style={{ opacity: 0.4 }}>{rest.replace(/\S/g, "·")}</span>
    </span>
  );
}

