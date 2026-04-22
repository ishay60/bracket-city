"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildPuzzle,
  parseBracketString,
  serializePuzzleForExport,
  validatePuzzleAuthoring,
} from "@/lib/puzzle";
import type { BracketSpec, Puzzle } from "@/lib/puzzle";
import { AnswersTable, emptyAnswerRow } from "./AnswersTable";
import type { AnswerRow } from "./AnswersTable";
import { GameContainerPreview } from "./GameContainerPreview";
import { TreeView } from "./TreeView";

const STARTER = {
  title: "חידת בניין לדוגמה",
  date: new Date().toISOString().slice(0, 10),
  finalSentence: "דוד בן גוריון הכריז על הקמת מדינת ישראל",
  historicalContext:
    "ב-14 במאי 1948 הוכרזה מדינת ישראל במוזיאון תל אביב ברחוב רוטשילד.",
  bracketString:
    "[[מלך ישראל הקדום] [מילת יחס לבן] [שם משפחתו של ראש הממשלה הראשון]] [פועל: הצהיר פומבית] על [שם פעולה של התחלת קיום, בסמיכות] [יחידה ריבונית של עם, בסמיכות] [המדינה היהודית]",
  rows: [
    { answer: "דוד בן גוריון", accepted: "", difficulty: "easy", clueType: "trivia" },
    { answer: "דוד", accepted: "", difficulty: "easy", clueType: "trivia" },
    { answer: "בן", accepted: "", difficulty: "easy", clueType: "definition" },
    { answer: "גוריון", accepted: "", difficulty: "medium", clueType: "trivia" },
    { answer: "הכריז", accepted: "", difficulty: "medium", clueType: "definition" },
    { answer: "הקמת", accepted: "", difficulty: "medium", clueType: "definition" },
    { answer: "מדינת", accepted: "", difficulty: "easy", clueType: "definition" },
    { answer: "ישראל", accepted: "", difficulty: "easy", clueType: "trivia" },
  ] as AnswerRow[],
};

export function PuzzleBuilder({ initialDate }: { initialDate?: string } = {}) {
  const [title, setTitle] = useState(STARTER.title);
  const [date, setDate] = useState(initialDate ?? STARTER.date);
  const [finalSentence, setFinalSentence] = useState(STARTER.finalSentence);
  const [historicalContext, setHistoricalContext] = useState(STARTER.historicalContext);
  const [bracketString, setBracketString] = useState(STARTER.bracketString);
  const [rows, setRows] = useState<AnswerRow[]>(STARTER.rows);

  const parsed = useMemo(() => {
    try {
      return parseBracketString(bracketString);
    } catch {
      return null;
    }
  }, [bracketString]);

  // Keep the rows array length in sync with the parsed bracket count.
  useEffect(() => {
    const target = parsed?.bracketOrder.length ?? 0;
    if (rows.length === target) return;
    setRows((prev) => {
      if (prev.length === target) return prev;
      if (prev.length < target) {
        return [...prev, ...Array.from({ length: target - prev.length }, emptyAnswerRow)];
      }
      return prev.slice(0, target);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed]);

  const answers = useMemo(() => rows.map((r) => r.answer), [rows]);

  const specs: BracketSpec[] = useMemo(
    () =>
      rows.map((r) => ({
        answer: r.answer,
        acceptedAnswers: r.accepted
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        difficulty: r.difficulty || undefined,
        clueType: r.clueType || undefined,
      })),
    [rows],
  );

  const validation = useMemo(
    () => validatePuzzleAuthoring({ bracketString, answers, finalSentence }),
    [bracketString, answers, finalSentence],
  );

  const builtPuzzle: Puzzle | null = useMemo(() => {
    if (!validation.ok) return null;
    try {
      return buildPuzzle({
        id: `draft-${date}`,
        date,
        title,
        finalSentence,
        historicalContext,
        bracketString,
        specs,
      });
    } catch {
      return null;
    }
  }, [validation.ok, date, title, finalSentence, historicalContext, bracketString, specs]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: '"David Libre", serif' }}
          >
            🏙️ עיר הסוגריים · סטודיו החידות
          </h1>
          <p className="puzzle-mono text-[12px] mt-1" style={{ color: "#6b6356" }}>
            Phase 3 · Puzzle Builder
          </p>
        </div>
        <nav className="puzzle-mono text-[13px] flex items-center gap-3" style={{ color: "#6b6356" }}>
          <Link href="/admin/calendar" className="underline-offset-4 hover:underline">
            לוח שנה →
          </Link>
          <span style={{ opacity: 0.4 }}>·</span>
          <Link href="/admin/archive" className="underline-offset-4 hover:underline">
            ארכיון →
          </Link>
          <span style={{ opacity: 0.4 }}>·</span>
          <Link href="/" className="underline-offset-4 hover:underline">
            ← חזרה לחידה
          </Link>
        </nav>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <section className="space-y-4">
          <Card title="מטא־דאטה">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="כותרת">
                <TextInput value={title} onChange={setTitle} />
              </Field>
              <Field label="תאריך (ISO)">
                <TextInput value={date} onChange={setDate} className="puzzle-mono" />
              </Field>
            </div>
          </Card>

          <Card title="המשפט הסופי">
            <TextArea
              value={finalSentence}
              onChange={setFinalSentence}
              rows={2}
              placeholder="המשפט המלא שייחשף בסוף"
            />
          </Card>

          <Card title="מחרוזת הסוגריים (הסתרות וקינון)">
            <TextArea
              value={bracketString}
              onChange={setBracketString}
              rows={5}
              mono
              placeholder="כתבו את המשפט עם סוגרי רמז. לדוגמה: [מלך ישראל] המלך [פועל] ב[עיר]"
            />
            <div className="puzzle-mono text-[11px] mt-1" style={{ color: "#6b6356" }}>
              {validation.bracketCount} סוגרים · DFS
            </div>
          </Card>

          <Card title="תשובות וקושי (בסדר DFS)">
            <AnswersTable
              brackets={parsed?.bracketOrder ?? []}
              rows={rows}
              onChange={setRows}
            />
          </Card>

          <Card title="הקשר היסטורי (אופציונלי)">
            <TextArea
              value={historicalContext}
              onChange={setHistoricalContext}
              rows={3}
            />
          </Card>

          <ValidationPanel validation={validation} />

          <ExportPanel puzzle={builtPuzzle} />
        </section>

        <aside className="space-y-4">
          <Card title="עץ הפירוק">
            <TreeView tree={parsed?.tree ?? null} answers={answers} />
          </Card>
          <Card title="תצוגה מקדימה (אינטראקטיבית)">
            {builtPuzzle ? (
              <GameContainerPreview puzzle={builtPuzzle} />
            ) : (
              <div
                className="puzzle-mono text-[12px] text-center py-6"
                style={{ color: "#9ca3af" }}
              >
                תקנו את השגיאות מטה כדי לצפות בתצוגה החיה
              </div>
            )}
          </Card>
        </aside>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl p-4"
      style={{ backgroundColor: "#ffffff", border: "1px solid #e7e0d0" }}
    >
      <div
        className="puzzle-mono text-[11px] tracking-wider uppercase mb-2"
        style={{ color: "#6b6356" }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div
        className="puzzle-mono text-[11px] mb-1"
        style={{ color: "#6b6356" }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <input
      type="text"
      dir="auto"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-md px-3 py-2 text-[14px] ${className}`}
      style={{ border: "1px solid #e7e0d0", backgroundColor: "#fbfaf4" }}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
  mono = false,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
}) {
  return (
    <textarea
      dir="auto"
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-md px-3 py-2 text-[14px] ${mono ? "puzzle-mono" : ""}`}
      style={{
        border: "1px solid #e7e0d0",
        backgroundColor: "#fbfaf4",
        fontFamily: mono
          ? '"IBM Plex Mono", monospace'
          : '"David Libre", serif',
        lineHeight: 1.55,
      }}
    />
  );
}

function ValidationPanel({ validation }: { validation: ReturnType<typeof validatePuzzleAuthoring> }) {
  const errors = validation.issues.filter((i) => i.severity === "error");
  const warnings = validation.issues.filter((i) => i.severity === "warning");
  const statusColor = validation.ok ? "#047857" : errors.length > 0 ? "#b91c1c" : "#b45309";
  return (
    <section
      className="rounded-xl p-4"
      style={{
        backgroundColor: validation.ok ? "#ecfdf5" : "#fffbeb",
        border: `1px solid ${validation.ok ? "#86efac" : "#fde68a"}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="puzzle-mono text-[11px] tracking-wider uppercase"
          style={{ color: statusColor }}
        >
          {validation.ok ? "✓ תקין — מוכן לפרסום" : `✕ ${errors.length} שגיאות, ${warnings.length} אזהרות`}
        </div>
        <div className="puzzle-mono text-[11px]" style={{ color: "#6b6356" }}>
          סוגרים: {validation.bracketCount}
        </div>
      </div>
      {validation.issues.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {validation.issues.map((i, idx) => (
            <li
              key={idx}
              className="puzzle-mono text-[12px] whitespace-pre-wrap"
              style={{
                color: i.severity === "error" ? "#991b1b" : "#92400e",
              }}
            >
              <span style={{ fontWeight: 700 }}>
                {i.severity === "error" ? "ERR" : "WARN"}
              </span>{" "}
              [{i.code}] {i.message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ExportPanel({ puzzle }: { puzzle: Puzzle | null }) {
  const [copied, setCopied] = useState<string | null>(null);
  const json = puzzle ? serializePuzzleForExport(puzzle) : "// תקנו שגיאות לפני ייצוא";
  const tsSnippet = puzzle
    ? buildTsSnippet(puzzle)
    : "// תקנו שגיאות לפני ייצוא";

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      className="rounded-xl p-4"
      style={{ backgroundColor: "#ffffff", border: "1px solid #e7e0d0" }}
    >
      <div
        className="puzzle-mono text-[11px] tracking-wider uppercase mb-2"
        style={{ color: "#6b6356" }}
      >
        ייצוא
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => copy("json", json)}
          disabled={!puzzle}
          className="px-3 py-1.5 rounded-md puzzle-mono text-[12px] disabled:opacity-40"
          style={{ backgroundColor: "#171412", color: "#fbfaf4" }}
        >
          {copied === "json" ? "✓ הועתק" : "[copy JSON]"}
        </button>
        <button
          type="button"
          onClick={() => copy("ts", tsSnippet)}
          disabled={!puzzle}
          className="px-3 py-1.5 rounded-md puzzle-mono text-[12px] disabled:opacity-40"
          style={{ backgroundColor: "#171412", color: "#fbfaf4" }}
        >
          {copied === "ts" ? "✓ הועתק" : "[copy TypeScript]"}
        </button>
      </div>
      <pre
        className="mt-3 rounded-md p-3 puzzle-mono text-[11px] overflow-auto max-h-64"
        style={{ backgroundColor: "#fbfaf4", border: "1px solid #e7e0d0", lineHeight: 1.5 }}
        dir="ltr"
      >
        {json}
      </pre>
    </section>
  );
}

function buildTsSnippet(puzzle: Puzzle): string {
  const specs: string[] = [];
  const walk = (n: import("@/lib/puzzle").PuzzleNode) => {
    if (n.type === "bracket") {
      const parts: string[] = [`answer: ${JSON.stringify(n.answer ?? "")}`];
      if (n.acceptedAnswers?.length) {
        parts.push(`acceptedAnswers: ${JSON.stringify(n.acceptedAnswers)}`);
      }
      if (n.difficulty) parts.push(`difficulty: ${JSON.stringify(n.difficulty)}`);
      if (n.clueType) parts.push(`clueType: ${JSON.stringify(n.clueType)}`);
      specs.push(`    { ${parts.join(", ")} },`);
    }
    n.children?.forEach(walk);
  };
  walk(puzzle.tree);
  return [
    `buildPuzzle({`,
    `  id: ${JSON.stringify(puzzle.id)},`,
    `  date: ${JSON.stringify(puzzle.date)},`,
    `  title: ${JSON.stringify(puzzle.title)},`,
    `  finalSentence: ${JSON.stringify(puzzle.finalSentence)},`,
    puzzle.historicalContext != null
      ? `  historicalContext: ${JSON.stringify(puzzle.historicalContext)},`
      : null,
    `  bracketString:`,
    `    ${JSON.stringify(reconstructBracketString(puzzle))},`,
    `  specs: [`,
    ...specs,
    `  ],`,
    `  tags: ${JSON.stringify(puzzle.tags ?? [])},`,
    `})`,
  ]
    .filter((l): l is string => !!l)
    .join("\n");
}

function reconstructBracketString(puzzle: Puzzle): string {
  const walk = (n: import("@/lib/puzzle").PuzzleNode): string => {
    if (n.type === "text") return n.content ?? "";
    if (n.type === "bracket") {
      const inner = (n.children ?? []).map(walk).join("");
      return `[${inner}]`;
    }
    return (n.children ?? []).map(walk).join("");
  };
  return walk(puzzle.tree);
}
