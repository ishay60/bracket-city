import type { Metadata } from "next";
import Link from "next/link";
import { samplePuzzles } from "@/lib/puzzle/samplePuzzles";

export const metadata: Metadata = {
  title: "לוח שנה",
  description: "לוח חודשי של חידות מתוזמנות ושל ימים חסרים.",
  robots: { index: false, follow: false },
};

/**
 * Monthly calendar of puzzle status — Phase 3 content-management tool.
 * Shows scheduled/published puzzles against gaps so an editor can spot days
 * missing coverage. The "month" is derived from the newest sample puzzle so
 * the grid is always populated during demo/seed state.
 */
export default function CalendarPage({
  searchParams,
}: {
  searchParams?: { month?: string };
}) {
  const byDate = new Map(samplePuzzles.map((p) => [p.date, p]));
  const sorted = [...samplePuzzles].sort((a, b) => b.date.localeCompare(a.date));
  const focus = parseMonth(searchParams?.month) ?? monthOf(sorted[0]?.date ?? todayISO());
  const { year, month } = focus;
  const days = monthGrid(year, month);
  const heMonth = new Date(year, month - 1, 1).toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });
  const prevMonth = stepMonth(year, month, -1);
  const nextMonth = stepMonth(year, month, 1);

  const inMonth = samplePuzzles.filter((p) => p.date.startsWith(monthKey(year, month)));
  const published = inMonth.length;
  const gaps = days.filter((d) => d.inMonth && !byDate.has(d.iso)).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: '"David Libre", serif' }}
          >
            🏙️ לוח השנה של החידות
          </h1>
          <p className="puzzle-mono text-[12px] mt-1" style={{ color: "#6b6356" }}>
            Phase 3 · Calendar · {published} פורסמו · {gaps} חסרים החודש
          </p>
        </div>
        <nav
          className="puzzle-mono text-[13px] flex items-center gap-3"
          style={{ color: "#6b6356" }}
        >
          <Link href="/admin" className="underline-offset-4 hover:underline">
            ← סטודיו
          </Link>
          <span style={{ opacity: 0.4 }}>·</span>
          <Link href="/admin/archive" className="underline-offset-4 hover:underline">
            ארכיון
          </Link>
          <span style={{ opacity: 0.4 }}>·</span>
          <Link href="/" className="underline-offset-4 hover:underline">
            משחק
          </Link>
        </nav>
      </header>

      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          href={`/admin/calendar?month=${prevMonth.year}-${String(prevMonth.month).padStart(2, "0")}`}
          className="puzzle-mono text-[12px] px-3 py-1 rounded-md"
          style={{ border: "1px solid #e7e0d0", color: "#171412" }}
        >
          ← חודש קודם
        </Link>
        <div
          className="text-lg"
          style={{ fontFamily: '"David Libre", serif' }}
          aria-live="polite"
        >
          {heMonth}
        </div>
        <Link
          href={`/admin/calendar?month=${nextMonth.year}-${String(nextMonth.month).padStart(2, "0")}`}
          className="puzzle-mono text-[12px] px-3 py-1 rounded-md"
          style={{ border: "1px solid #e7e0d0", color: "#171412" }}
        >
          חודש הבא →
        </Link>
      </div>

      <div
        className="grid grid-cols-7 gap-1 text-center puzzle-mono text-[11px] mb-1"
        style={{ color: "#6b6356" }}
        aria-hidden
      >
        {["א", "ב", "ג", "ד", "ה", "ו", "ש"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-1"
        role="grid"
        aria-label={`לוח חידות לחודש ${heMonth}`}
      >
        {days.map((d) => {
          const puzzle = byDate.get(d.iso);
          const status: CellStatus = !d.inMonth
            ? "outside"
            : puzzle
            ? "published"
            : "gap";
          return <DayCell key={d.iso} iso={d.iso} day={d.day} status={status} puzzleTitle={puzzle?.finalSentence} brackets={puzzle?.totalBrackets} />;
        })}
      </div>

      <Legend />
    </main>
  );
}

type CellStatus = "outside" | "published" | "gap";

function DayCell({
  iso,
  day,
  status,
  puzzleTitle,
  brackets,
}: {
  iso: string;
  day: number;
  status: CellStatus;
  puzzleTitle?: string;
  brackets?: number;
}) {
  const base =
    "relative rounded-md min-h-[78px] p-2 text-right border transition-colors";
  if (status === "outside") {
    return (
      <div
        className={base}
        style={{ borderColor: "#f3f4f6", backgroundColor: "#fbfaf4", opacity: 0.35 }}
        aria-hidden
      >
        <div className="puzzle-mono text-[11px]" style={{ color: "#9ca3af" }}>
          {day}
        </div>
      </div>
    );
  }
  if (status === "published") {
    return (
      <Link
        href={`/?date=${iso}`}
        className={base + " hover:shadow-sm"}
        style={{ borderColor: "#86efac", backgroundColor: "#ecfdf5" }}
        role="gridcell"
        aria-label={`${iso} — פורסם: ${puzzleTitle ?? ""}`}
      >
        <div className="flex items-center justify-between">
          <span
            className="puzzle-mono text-[10px] px-1 rounded-sm"
            style={{ backgroundColor: "#059669", color: "#ecfdf5" }}
          >
            ✓
          </span>
          <span className="puzzle-mono text-[12px]" style={{ color: "#047857" }}>
            {day}
          </span>
        </div>
        {puzzleTitle ? (
          <div
            className="text-[11px] mt-1 line-clamp-2 leading-tight"
            style={{ color: "#065f46", fontFamily: '"David Libre", serif' }}
          >
            {puzzleTitle}
          </div>
        ) : null}
        {brackets != null ? (
          <div className="puzzle-mono text-[10px] mt-1" style={{ color: "#047857", opacity: 0.7 }}>
            {brackets} סוגרים
          </div>
        ) : null}
      </Link>
    );
  }
  return (
    <Link
      href={`/admin?date=${iso}`}
      className={base + " hover:border-[#c7d2fe]"}
      style={{ borderColor: "#e7e0d0", backgroundColor: "#ffffff" }}
      role="gridcell"
      aria-label={`${iso} — אין חידה, לחצו להוספה`}
    >
      <div className="flex items-center justify-between">
        <span
          className="puzzle-mono text-[10px]"
          style={{ color: "#b91c1c" }}
        >
          ✕ חסר
        </span>
        <span className="puzzle-mono text-[12px]" style={{ color: "#6b6356" }}>
          {day}
        </span>
      </div>
      <div
        className="text-[11px] mt-1"
        style={{ color: "#9ca3af", fontFamily: '"David Libre", serif' }}
      >
        + הוספת חידה
      </div>
    </Link>
  );
}

function Legend() {
  return (
    <div
      className="mt-4 puzzle-mono text-[11px] flex items-center gap-4 flex-wrap"
      style={{ color: "#6b6356" }}
    >
      <span className="inline-flex items-center gap-1">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: "#ecfdf5", border: "1px solid #86efac" }}
        />
        פורסם
      </span>
      <span className="inline-flex items-center gap-1">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e7e0d0" }}
        />
        חסר / להוספה
      </span>
    </div>
  );
}

function parseMonth(s: string | undefined): { year: number; month: number } | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{1,2})$/.exec(s);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

function monthOf(iso: string): { year: number; month: number } {
  const [y, m] = iso.split("-");
  return { year: Number(y), month: Number(m) };
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function todayISO(): string {
  return formatISO(new Date());
}

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function stepMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

interface Day {
  iso: string;
  day: number;
  inMonth: boolean;
}

/**
 * 6-row grid of days starting on Sunday (Hebrew calendars read the week as
 * Sun–Sat, matching Google Calendar's Hebrew locale).
 */
function monthGrid(year: number, month: number): Day[] {
  const first = new Date(year, month - 1, 1);
  const startDow = first.getDay();
  const out: Day[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month - 1, i - startDow + 1);
    out.push({
      iso: formatISO(d),
      day: d.getDate(),
      inMonth: d.getMonth() === month - 1,
    });
  }
  return out;
}
