# Bracket City — Design Research

First-hand study of the original Bracket City (The Atlantic) on 2026-04-20, captured so the Hebrew port can stay visually and experientially faithful. Update this document any time new observations are made.

## Source

- URL: https://www.theatlantic.com/games/bracket-city/
- Creator: Ben Gross (original), now also Caleb Madison at The Atlantic
- Observed date: 2026-04-20 (today's puzzle, in its SOLVED state)

## Overall aesthetic

The game is unmistakably Atlantic-branded and leans into a **typewriter / teletype** vibe. It looks like raw text that just happens to have brackets in it, rather than a "game UI" with bubbles and pills. That restraint is the single most important design decision.

### Landing page
- Full-bleed **orange background** (#E96B3C-ish vivid orange)
- Black letterpress-style illustration of "ornamented arches"
- Atlantic masthead in its signature serif (Caslon Ital)
- "Bracket City" display in the same Atlantic serif
- Tagline and metadata in **monospace** (Courier-family)
- Black pill "Play" button, outlined "Archive" button

### Game screen
- Cream/off-white page background (~#fbfaf7)
- White puzzle card, rounded corners (~8–12px), subtle shadow, thin border
- Header inside the card:
  - Left: "!" info icon in a circle
  - Center: **🟢 [BRACKET CITY] 🟢** in small-caps monospace
  - Right: "?" help icon in a circle
  - Below title: ← date selector (e.g. "APRIL 20, 2026") ▼ → with **🔥 streak: N**
- Below the card:
  - Large input field with monospace placeholder `type any answer…`
  - Black "[enter]" button (monospace, matches bracket styling)
  - "Answer Bank:" label beneath input (collects solved/peeked words)

## Typography

- **Monospace throughout** — even the title, body, placeholder, and button labels
- Looks like Courier / American Typewriter
- No bold except for the branded title
- Body font-size around 18–20px with ~1.5–1.6 line height
- Emojis appear inline as part of clue text (🎃 🔎 😎 🇯🇲 🏴‍☠️ etc.)

## Bracket rendering — the core visual idea

> Locked/nested brackets are NOT chips. They are **plain characters in the text.** Only solvable leaves get a fill.

| State | Rendering |
|---|---|
| **Locked (has unsolved children)** | Rendered with **literal `[` and `]` characters as part of the text.** No background, no border, no pill — just inline mono text. The brackets are character glyphs, not UI chrome. |
| **Solvable leaf** | The whole `[clue text]` span gets a **light-blue / periwinkle rounded fill** (~`#A6B3F5` background, white or near-white bracket glyphs, dark text on the clue). The `[` and `]` are included inside the fill. |
| **Active (player is typing)** | Same blue fill, slightly stronger; input renders in-place inside the span. |
| **Solved** | The bracket disappears entirely and its answer is inlined as plain text. The surrounding sentence flows around it. |
| **Wrong guess** | Brief shake on the active span; the input clears. |
| **Peeked** | First letter hint appears. |
| **Revealed** | Counts as solved but with a subtle marker (in the Atlantic: Answer Bank flags it). |

This is why the puzzle looks "chaotic but readable" on load: it's literally prose with bracketed fragments, not a gameboard. The visual load is entirely carried by typography.

## Puzzle scale and length

Today's puzzle (2026-04-20) — SOLVED-state extract:

> Crom[water source that Tim[whose Little [animal with one [alternative to treat 🎃]]?] never actually fell into in "L[more vulgar [position vis-à-vis the [something you make when Pizza [Sun[word after stained or magnifying] structure at a mall 😎] refuses to honor your expired coupon]s for a making-of featurette]]ie"] dissolves the [spirit associated with [frustrating traffic or [🔎 fine ➡️ ⬅️ journalism 📰]er situation]aica 🇯🇲 and pirates 🏴‍☠️]p Parliament

- **~15 brackets**, not 3–5.
- **Nesting depth: up to 5 levels** on some branches.
- Final sentence: long and prose-like, ~25–35 words.
- Heavy use of **word-fragment hiding**: e.g. `Crom[…]p Parliament` means the bracket resolves into a fragment that chains into surrounding word pieces. This is the "Russian-doll" mechanic — answers glue together word fragments that stand alone look like garbage (`Crom`, `p Parliament`), but resolve into meaningful phrases.
- Emojis used as clue ingredients, not decoration.
- Clue tone: playful, lateral-thinking, pop-culture-heavy, puns. Not trivia-heavy.

### Implication for the Hebrew port

Our sample puzzle at 5 brackets and 6 words is far too small for the "real" scale. The Hebrew sample (and any production content) should target:
- **8–15 brackets** per puzzle
- **2–4 levels** of nesting on at least some branches
- Final sentence of **15–25 Hebrew words**
- Mix of: full-word brackets, prefix-hiding brackets (ה, ב, ל, מ, ו, ש), root-hiding brackets (3-letter קמ / כרז / etc.), and at least one nested pair that chains meaningfully.

## Header / controls map

- **"!"** → probably puzzle info / date context
- **"?"** → probably how-to-play
- **← April 20 ▼ →** → archive navigation (previous/next day, dropdown to pick a date)
- **🔥 streak: N** → consecutive-days-solved
- Below puzzle: **Answer Bank** accumulates what you've solved / peeked, visible throughout

## Input model

- One input field at the bottom of the card, always visible
- Large "[enter]" black button beside it — same monospace aesthetic as the puzzle itself, so the UI controls look like they belong to the same typographic system
- The plan's "just start typing, no click needed" model is consistent with an always-focused input field

## Sharing / end game

Not captured in this session (the game showed PUZZLE SOLVED! state but end-of-game UI wasn't scrolled to). To revisit on another pass.

## Takeaways for our Hebrew build

1. **Drop pill-styled locked brackets.** Render them as plain `[` `]` inline text. Only color solvable leaves.
2. **Adopt a typewriter/newspaper feel.** For Hebrew, use **David Libre** (serif, Atlantic-adjacent editorial feel) or **Frank Ruehl CLM**. Latin/numeric characters in the same puzzle can use a monospace fallback like IBM Plex Mono.
3. **Bigger puzzles.** Seed content at the 10+ bracket, 2–4 level depth scale.
4. **Minimal chrome.** White card, cream background, black text, thin borders. No heavy colors except the solvable-leaf blue.
5. **Answer Bank is a first-class feature.** Eventually surface solved answers below the input so the player can scan them.
6. **Keep emojis viable as clue ingredients** — the parser already treats them as plain characters, so this works for free.
7. **`[` and `]` characters are part of the TEXT in our rendered output, not decorative.** This has RTL implications (Unicode mirrors them automatically inside `dir="rtl"`, so `[רמז]` opens on the right edge visually). Test on both desktop and mobile.

## Open questions to revisit later

- Answer Bank behavior: does it show peeked/revealed vs. solved differently?
- Mobile-specific adaptations (keyboard docking, font size, padding)
- End-of-game rank reveal + share grid format
- Whether peek/reveal have dedicated buttons or are hidden in the `!` menu
- The builder experience at `builder.bracket.city` — blocked on 403, revisit when/if we can scrape
