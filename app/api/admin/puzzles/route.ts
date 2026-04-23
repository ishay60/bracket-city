import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { buildPuzzle } from "@/lib/puzzle/build";
import type { BuildPuzzleInput } from "@/lib/puzzle/build";

export const dynamic = "force-dynamic";

const DATA_FILE = path.join(process.cwd(), "data", "puzzles.json");

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { ok: false, error: "Puzzle saving is only enabled in development." },
      { status: 403 },
    );
  }

  let input: BuildPuzzleInput;
  try {
    const body = await request.json();
    input = parseBuildPuzzleInput(body);
    buildPuzzle(input);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid puzzle payload.",
      },
      { status: 400 },
    );
  }

  const saved = await readSavedPuzzleInputs();
  const idx = saved.findIndex((p) => p.id === input.id || p.date === input.date);
  const next = saved.slice();
  if (idx >= 0) {
    next[idx] = input;
  } else {
    next.push(input);
  }
  next.sort((a, b) => a.date.localeCompare(b.date));

  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  return NextResponse.json({
    ok: true,
    id: input.id,
    date: input.date,
    count: next.length,
    path: "data/puzzles.json",
  });
}

async function readSavedPuzzleInputs(): Promise<BuildPuzzleInput[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseBuildPuzzleInput);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }
}

function parseBuildPuzzleInput(value: unknown): BuildPuzzleInput {
  if (!isRecord(value)) throw new Error("Puzzle payload must be an object.");
  const id = requiredString(value.id, "id");
  const date = requiredString(value.date, "date");
  const title = requiredString(value.title, "title");
  const bracketString = requiredString(value.bracketString, "bracketString");
  const finalSentence = requiredString(value.finalSentence, "finalSentence");
  const specs = parseSpecs(value.specs);

  return {
    id,
    date,
    title,
    bracketString,
    specs,
    finalSentence,
    historicalContext:
      typeof value.historicalContext === "string" ? value.historicalContext : undefined,
    maxScore: typeof value.maxScore === "number" ? value.maxScore : undefined,
    tags: Array.isArray(value.tags)
      ? value.tags.filter((tag): tag is string => typeof tag === "string")
      : undefined,
  };
}

function parseSpecs(value: unknown): BuildPuzzleInput["specs"] {
  if (!Array.isArray(value)) throw new Error("specs must be an array.");
  return value.map((spec, idx) => {
    if (!isRecord(spec)) throw new Error(`specs[${idx}] must be an object.`);
    return {
      answer: requiredString(spec.answer, `specs[${idx}].answer`),
      acceptedAnswers: Array.isArray(spec.acceptedAnswers)
        ? spec.acceptedAnswers.filter((a): a is string => typeof a === "string")
        : undefined,
      clueType:
        typeof spec.clueType === "string"
          ? (spec.clueType as BuildPuzzleInput["specs"][number]["clueType"])
          : undefined,
      difficulty:
        typeof spec.difficulty === "string"
          ? (spec.difficulty as BuildPuzzleInput["specs"][number]["difficulty"])
          : undefined,
      hint: typeof spec.hint === "string" ? spec.hint : undefined,
    };
  });
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
