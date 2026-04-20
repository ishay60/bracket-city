"use client";

import type { PuzzleNode } from "@/lib/puzzle";

/**
 * Compact DFS tree visualization for the authoring surface. Each bracket row
 * shows its DFS index, clue skeleton, and answer (if provided). Nested
 * brackets indent. Non-bracket text nodes are rendered dim.
 */
export function TreeView({
  tree,
  answers,
}: {
  tree: PuzzleNode | null;
  answers: string[];
}) {
  if (!tree) return <Empty />;

  const rows: JSX.Element[] = [];
  let bracketIdx = 0;
  const walk = (n: PuzzleNode, depth: number) => {
    if (n.type === "root") {
      (n.children ?? []).forEach((c) => walk(c, depth));
      return;
    }
    if (n.type === "text") {
      const content = (n.content ?? "").trim();
      if (!content) return;
      rows.push(
        <div
          key={`t-${rows.length}`}
          className="puzzle-mono text-[12px] whitespace-pre-wrap"
          style={{ paddingInlineStart: depth * 14, color: "#9ca3af" }}
        >
          <span style={{ opacity: 0.7 }}>·</span> {content}
        </div>,
      );
      return;
    }
    // bracket
    const idx = bracketIdx++;
    const answer = answers[idx] ?? "";
    const clueSummary = (n.children ?? [])
      .map((c) => (c.type === "text" ? c.content ?? "" : "[…]"))
      .join("");
    rows.push(
      <div
        key={`b-${idx}`}
        className="puzzle-mono text-[12px] flex items-baseline gap-1 leading-relaxed"
        style={{ paddingInlineStart: depth * 14 }}
      >
        <span
          className="inline-block rounded-sm px-1"
          style={{ backgroundColor: "#ede9fe", color: "#4c1d95", minWidth: 28, textAlign: "center" }}
        >
          {idx}
        </span>
        <span className="flex-1 truncate" style={{ color: "#374151" }} title={clueSummary}>
          {clueSummary || <span style={{ opacity: 0.4 }}>[ריק]</span>}
        </span>
        <span style={{ color: "#6b6356" }}>→</span>
        <span
          style={{
            color: answer ? "#065f46" : "#b45309",
            fontWeight: 600,
            minWidth: 60,
          }}
        >
          {answer || "חסר"}
        </span>
      </div>,
    );
    (n.children ?? []).forEach((c) => walk(c, depth + 1));
  };
  walk(tree, 0);

  if (rows.length === 0) return <Empty />;
  return <div className="space-y-0.5">{rows}</div>;
}

function Empty() {
  return (
    <div className="puzzle-mono text-[12px] text-center py-6" style={{ color: "#9ca3af" }}>
      אין עץ פירוק — ודאו שהסוגריים מאוזנים
    </div>
  );
}
