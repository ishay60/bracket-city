"use client";

/**
 * Compact Hebrew on-screen keyboard for mobile. Matches the spirit of
 * bracket.city's mobile flow — every keystroke lands in the answer input
 * without forcing the user to fight a non-Hebrew system layout. Final
 * letters (sofiot) are accessible from a tap-and-hold of their primary key
 * via long-press, but for simplicity the matcher accepts both forms anyway,
 * so the main keyboard exposes only base letters.
 *
 * The keyboard is purely visual on mobile; on sm: it is hidden.
 */

const ROWS_RTL = [
  ["ק", "ר", "א", "ט", "ו", "ן", "ם", "פ"],
  ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף"],
  ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ"],
];

interface Props {
  disabled?: boolean;
  onChar: (ch: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

export function HebrewKeyboard({ disabled, onChar, onBackspace, onEnter }: Props) {
  return (
    <div
      dir="rtl"
      className="select-none"
      role="group"
      aria-label="מקלדת עברית"
      aria-disabled={disabled || undefined}
    >
      <div className="flex flex-col gap-1.5">
        {ROWS_RTL.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => onChar(k)}
                disabled={disabled}
                aria-label={k}
                className="keyboard-key flex-1 max-w-[10%] disabled:opacity-40"
              >
                {k}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-1">
          <button
            type="button"
            onClick={() => onChar(" ")}
            disabled={disabled}
            aria-label="רווח"
            className="keyboard-key is-wide flex-[3] disabled:opacity-40"
          >
            רווח
          </button>
          <button
            type="button"
            onClick={onBackspace}
            disabled={disabled}
            aria-label="מחיקה"
            className="keyboard-key is-wide flex-1 disabled:opacity-40"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={onEnter}
            disabled={disabled}
            aria-label="שליחה"
            className="keyboard-key is-wide flex-[1.5] disabled:opacity-40"
            style={{ backgroundColor: "#171412", color: "#fbfaf4", borderColor: "#171412" }}
          >
            [enter]
          </button>
        </div>
      </div>
    </div>
  );
}
