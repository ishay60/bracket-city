"use client";

/**
 * Compact Hebrew on-screen keyboard for mobile, modeled on Hebrew Wordle
 * (וורדעל) rather than a full QWERTY clone:
 *
 *   row 1:  ק ר א ט ו פ              ⌫
 *   row 2:  ש ד ג כ ע י ח ל
 *   row 3:  ז ס ב ה נ מ צ ת          ↵
 *   row 4:  ───── רווח ─────
 *
 * Final letters (sofiot) are intentionally absent — `normalizeHebrew`
 * folds them to their base form, so the user never has to find ך / ם / ן
 * / ף / ץ on the keyboard. The space row is a thin strip because the
 * primary keyboard surface should be the three letter rows.
 */

const ROW_1 = ["ק", "ר", "א", "ט", "ו", "פ"];
const ROW_2 = ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל"];
const ROW_3 = ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת"];

interface Props {
  disabled?: boolean;
  onChar: (ch: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

export function HebrewKeyboard({ disabled, onChar, onBackspace, onEnter }: Props) {
  const letterBtn = (k: string) => (
    <button
      key={k}
      type="button"
      onClick={() => onChar(k)}
      disabled={disabled}
      aria-label={k}
      className="keyboard-key flex-1 disabled:opacity-40"
    >
      {k}
    </button>
  );

  return (
    <div
      dir="rtl"
      className="select-none"
      role="group"
      aria-label="מקלדת עברית"
      aria-disabled={disabled || undefined}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-center gap-1">
          {ROW_1.map(letterBtn)}
          <button
            type="button"
            onClick={onBackspace}
            disabled={disabled}
            aria-label="מחיקה"
            className="keyboard-key is-special flex-[1.4] disabled:opacity-40"
          >
            ⌫
          </button>
        </div>
        <div className="flex justify-center gap-1">{ROW_2.map(letterBtn)}</div>
        <div className="flex justify-center gap-1">
          {ROW_3.map(letterBtn)}
          <button
            type="button"
            onClick={onEnter}
            disabled={disabled}
            aria-label="שליחה"
            className="keyboard-key is-special is-enter flex-[1.4] disabled:opacity-40"
          >
            ↵
          </button>
        </div>
        <button
          type="button"
          onClick={() => onChar(" ")}
          disabled={disabled}
          aria-label="רווח"
          className="keyboard-key is-space disabled:opacity-40"
        >
          רווח
        </button>
      </div>
    </div>
  );
}
