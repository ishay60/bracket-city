/**
 * Hebrew answer normalization for lenient matching.
 * - Trims and collapses whitespace
 * - Strips nikud (vowel points) and cantillation marks (U+0591..U+05C7)
 * - Strips geresh/gershayim and common punctuation
 * - Normalizes final letters (sofiot) to their non-final form
 * - Lowercases any incidental Latin letters
 */
const SOFIT_MAP: Record<string, string> = {
  "ך": "כ",
  "ם": "מ",
  "ן": "נ",
  "ף": "פ",
  "ץ": "צ",
};

const NIKUD_RE = /[\u0591-\u05C7]/g;
const PUNCT_RE = /["'׳״`.,;:!?\-\u2013\u2014()]/g;

export function normalizeHebrew(raw: string): string {
  if (!raw) return "";
  let s = raw.normalize("NFC");
  s = s.replace(NIKUD_RE, "");
  s = s.replace(PUNCT_RE, "");
  s = s.replace(/[ךםןףץ]/g, (m) => SOFIT_MAP[m] ?? m);
  s = s.replace(/\s+/g, " ").trim();
  return s.toLowerCase();
}

/**
 * Validates a guess against a bracket's canonical answer and any accepted
 * alternatives. All comparisons use normalizeHebrew.
 */
export function isCorrectAnswer(
  guess: string,
  answer: string,
  alternatives?: string[],
): boolean {
  const g = normalizeHebrew(guess);
  if (!g) return false;
  if (g === normalizeHebrew(answer)) return true;
  if (alternatives?.some((alt) => normalizeHebrew(alt) === g)) return true;
  return false;
}
