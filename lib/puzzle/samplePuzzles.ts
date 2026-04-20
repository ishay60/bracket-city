import { buildPuzzle } from "./build";
import type { Puzzle } from "./types";

/**
 * Sample Hebrew puzzles for demo. Scaled to the real Bracket City ballpark
 * (see docs/design-research.md): ~8-13 brackets, 1-2 levels of nesting,
 * ~8-15 word final sentence. Hebrew-specific mechanics in use:
 *   - Nested compound names (דוד בן גוריון, תל אביב)
 *   - Construct-state (סמיכות) inside clues
 *   - Trivia/definition/association blends typical of the genre
 */

const puzzle1 = buildPuzzle({
  id: "he-2026-04-20",
  date: "2026-04-20",
  title: "חידת הסוגריים היומית",
  finalSentence: "דוד בן גוריון הכריז על הקמת מדינת ישראל בתל אביב",
  historicalContext:
    "ב-14 במאי 1948, במוזיאון תל אביב ברחוב רוטשילד, הכריז דוד בן־גוריון על הקמת מדינת ישראל.",
  bracketString:
    "[[מלך ישראל הקדום מהשבט יהודה, הורג גוליית] [מילת יחס לבן, המציינת קרבת משפחה] [שם משפחתו של ראש הממשלה הראשון]] [פועל בלשון עבר: הודיע פומבית, מהשורש כ.ר.ז] על [שם פעולה של התחלת קיום, בסמיכות] [יחידה ריבונית של עם, בסמיכות] [שם המדינה היהודית, מולדת העם] ב[[גבעה מלאכותית שמכסה חורבות עיר עתיקה] [עונת פריחה בין החורף לקיץ]]",
  specs: [
    { answer: "דוד בן גוריון", clueType: "trivia", difficulty: "easy" },
    { answer: "דוד", clueType: "trivia", difficulty: "easy" },
    { answer: "בן", clueType: "definition", difficulty: "easy" },
    { answer: "גוריון", clueType: "trivia", difficulty: "medium" },
    { answer: "הכריז", clueType: "definition", difficulty: "medium" },
    { answer: "הקמת", clueType: "definition", difficulty: "medium" },
    { answer: "מדינת", clueType: "definition", difficulty: "easy" },
    { answer: "ישראל", clueType: "trivia", difficulty: "easy" },
    { answer: "תל אביב", clueType: "trivia", difficulty: "medium" },
    { answer: "תל", clueType: "definition", difficulty: "hard" },
    { answer: "אביב", clueType: "definition", difficulty: "easy" },
  ],
  tags: ["היסטוריה", "תש״ח", "ישראל"],
});

const puzzle2 = buildPuzzle({
  id: "he-2026-04-19",
  date: "2026-04-19",
  title: "חידת הסוגריים",
  finalSentence: "אליעזר בן יהודה החיה את השפה העברית בירושלים",
  historicalContext:
    "אליעזר בן־יהודה (1858–1922) היה המחייה המודרני של השפה העברית וקבע את ביתו בירושלים ככור היצירה של הלשון.",
  bracketString:
    "[[שם פרטי עברי קצר, הוגה שקבע את שפת היומיום] [מילת יחס לבן, קרבת משפחה] [שם של שבט דרומי ומלכות קדומה]] [פועל: החזיר לחיים, בלשון עבר] את [ה־שפה של עם ישראל, בסמיכות] [שם התואר של השפה המדוברת בישראל] ב[עיר הבירה של מדינת ישראל]",
  specs: [
    { answer: "אליעזר בן יהודה", clueType: "trivia", difficulty: "medium" },
    { answer: "אליעזר", clueType: "trivia", difficulty: "medium" },
    { answer: "בן", clueType: "definition", difficulty: "easy" },
    { answer: "יהודה", clueType: "trivia", difficulty: "easy" },
    { answer: "החיה", clueType: "definition", difficulty: "medium" },
    { answer: "השפה", clueType: "definition", difficulty: "easy" },
    { answer: "העברית", clueType: "association", difficulty: "easy" },
    { answer: "ירושלים", clueType: "trivia", difficulty: "easy" },
  ],
  tags: ["היסטוריה", "שפה"],
});

const puzzle3 = buildPuzzle({
  id: "he-2026-04-18",
  date: "2026-04-18",
  title: "חידת הסוגריים",
  finalSentence: "הרצל חלם על מדינה יהודית באירופה",
  historicalContext:
    "בנימין זאב הרצל, מייסד הציונות המדינית, פרסם ב-1896 את 'מדינת היהודים' וקרא להקמת בית לאומי לעם היהודי.",
  bracketString:
    "[שם משפחה של החוזה הציוני, מחבר 'מדינת היהודים'] [פועל: דמיין בשינה] על [יחידה ריבונית של עם, שם עצם] [שם תואר של הדת של עם ישראל] ב[יבשת שבין אסיה ואפריקה, ערש המערב]",
  specs: [
    { answer: "הרצל", clueType: "trivia", difficulty: "easy" },
    { answer: "חלם", clueType: "definition", difficulty: "easy" },
    { answer: "מדינה", clueType: "definition", difficulty: "easy" },
    { answer: "יהודית", clueType: "definition", difficulty: "easy" },
    { answer: "אירופה", clueType: "trivia", difficulty: "easy" },
  ],
  tags: ["היסטוריה", "ציונות"],
});

const puzzle4 = buildPuzzle({
  id: "he-2026-04-17",
  date: "2026-04-17",
  title: "חידת הסוגריים",
  finalSentence: "נעמי שמר כתבה את השיר ירושלים של זהב",
  historicalContext:
    "נעמי שמר כתבה את 'ירושלים של זהב' ב-1967, לפני מלחמת ששת הימים. השיר הפך לסמל השיבה לעיר העתיקה.",
  bracketString:
    "[[שם פרטי של אם האומה בתנ\"ך, נשוי ליעקב] [שם משפחה של המשוררת שחיברה 'ירושלים של זהב']] [פועל עבר נקבה: חיברה טקסט] את [ה־יצירה מלודית עם מילים, מיודע] [שם העיר הקדושה] של [מתכת יקרה צבעה צהוב]",
  specs: [
    { answer: "נעמי שמר", clueType: "trivia", difficulty: "medium" },
    { answer: "נעמי", clueType: "trivia", difficulty: "medium" },
    { answer: "שמר", clueType: "trivia", difficulty: "easy" },
    { answer: "כתבה", clueType: "definition", difficulty: "easy" },
    { answer: "השיר", clueType: "definition", difficulty: "easy" },
    { answer: "ירושלים", clueType: "trivia", difficulty: "easy" },
    { answer: "זהב", clueType: "definition", difficulty: "easy" },
  ],
  tags: ["מוזיקה", "ירושלים"],
});

const puzzle5 = buildPuzzle({
  id: "he-2026-04-16",
  date: "2026-04-16",
  title: "חידת הסוגריים",
  finalSentence: "גולדה מאיר הייתה ראש הממשלה הרביעית של ישראל",
  historicalContext:
    "גולדה מאיר כיהנה כראש הממשלה הרביעית של ישראל בין השנים 1969 ל-1974, האישה הראשונה בתפקיד.",
  bracketString:
    "[[שם פרטי שמקורו יידיש, פירושו 'זהב'] [שם משפחה מעוברת של ראשת הממשלה האישה היחידה בישראל]] [פועל עבר נקבה: התקיימה, 'היה' בנקבה] [התפקיד הבכיר ביותר בממשלה, שני מילים בסמיכות] [מספר סידורי: אחרי השלישית] של [המדינה היהודית]",
  specs: [
    { answer: "גולדה מאיר", clueType: "trivia", difficulty: "medium" },
    { answer: "גולדה", clueType: "definition", difficulty: "hard" },
    { answer: "מאיר", clueType: "trivia", difficulty: "medium" },
    { answer: "הייתה", clueType: "definition", difficulty: "easy" },
    { answer: "ראש הממשלה", clueType: "association", difficulty: "easy" },
    { answer: "הרביעית", clueType: "definition", difficulty: "easy" },
    { answer: "ישראל", clueType: "trivia", difficulty: "easy" },
  ],
  tags: ["היסטוריה", "פוליטיקה"],
});

export const samplePuzzles: Puzzle[] = [puzzle5, puzzle4, puzzle3, puzzle2, puzzle1];

/** The "current" puzzle (newest date). */
export const samplePuzzle: Puzzle = puzzle1;

export function findPuzzleByDate(date: string): Puzzle | null {
  return samplePuzzles.find((p) => p.date === date) ?? null;
}

export function neighborPuzzleDate(
  date: string,
  direction: "prev" | "next",
): string | null {
  const sorted = [...samplePuzzles].sort((a, b) => a.date.localeCompare(b.date));
  const idx = sorted.findIndex((p) => p.date === date);
  if (idx === -1) return null;
  const j = direction === "prev" ? idx - 1 : idx + 1;
  return sorted[j]?.date ?? null;
}
