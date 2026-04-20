# Bracket City Hebrew — Full Implementation Plan

## 1. Project Overview

### What We're Building
A Hebrew (RTL) port of Bracket City — The Atlantic's nested-clue word puzzle game — with a full admin/backoffice system for riddle creators. The product is designed to be sold to Israeli media outlets (Haaretz, Ynet, Maariv, etc.) as a daily word game feature.

### What Is Bracket City?
Bracket City is a daily word puzzle created by Ben Gross (launched January 1, 2025, licensed to The Atlantic April 2025). Players solve nested bracketed clues, working from the innermost brackets outward, to reveal a complete sentence — typically a historical fact tied to the current date. The game has no timer, works on desktop and mobile, and has a scoring/rank system based on accuracy.

### Why Hebrew?
- No Hebrew version exists
- Hebrew's 3-letter root system (שורש) is a *natural* fit for nested word fragments — arguably better than English
- Israel has a strong word game culture (תשבץ/crosswords are hugely popular)
- Existing Hebrew Wordle clones (וורדל׳ה, Meduyeket, Wordly) proved the market appetite
- Israeli newspapers actively look for digital engagement tools

---

## 2. The Original Game — Complete Rules & Mechanics

### 2.1 Core Concept
A paragraph of text with certain words replaced by bracketed clues. Clues can be nested inside other clues, forming a tree structure. The player solves leaf-level clues first, which reveals text that may contain new solvable clues, until the entire sentence is uncovered.

### 2.2 Tutorial Example (from the Atlantic)
The original tutorial uses this structure:

```
[where [opposite of clean] dishes pile up] or [exercise in a [game played with a cue ball]]
```

**Solve order:**
1. `[opposite of clean]` → **DIRTY** (leaf — solvable immediately)
2. `[game played with a cue ball]` → **POOL** (leaf — solvable immediately)
3. Now the parent clues are unlocked:
   - `[where dirty dishes pile up]` → **SINK**
   - `[exercise in a pool]` → **LAP**
4. Final revealed text: **"sink or lap"**

### 2.3 Nesting Rules (Critical — the heart of the game)

The puzzle is a **tree**. Each bracket pair `[...]` is a node. Here are the iron-clad rules:

| Rule | Description |
|------|-------------|
| **Leaf-first solving** | Only brackets with ZERO unsolved children accept input |
| **Sibling independence** | Siblings (brackets under the same parent) are independent — solvable in any order |
| **Parent lock** | A parent bracket is LOCKED until ALL its children are solved |
| **Chain reaction** | Solving a leaf may promote its parent to a solvable leaf (if parent has no other unsolved children) |
| **Answer rejection** | The UI MUST refuse input on any bracket that still has unsolved children, even if the player knows the answer |

**Concrete example (from project brief):**

Final sentence: `"bring the beat"`

Nested form: `B[lord of the _] the b[what you do with food]`

- `[lord of the _]` → **RING** (leaf, solvable)
- `[what you do with food]` → **EAT** (leaf, solvable)
- RING and EAT are **siblings** — independent, any order
- The **parent** bracket containing both is LOCKED until both children solve
- Once both solve → parent reveals `"bring the beat"` → parent may itself become a solvable leaf if it's nested inside a grandparent

### 2.4 Player Interaction

- **Input method:** Just start typing — no clicking required. Press Enter to submit.
- **No timer.** Solve at your own pace.
- **Daily puzzle.** New puzzle at midnight (local time for Hebrew version — midnight IST).
- **Desktop + mobile.** Responsive, touch-friendly.

### 2.5 Visual States of Brackets

| State | Visual | Behavior |
|-------|--------|----------|
| **Solvable leaf** | Highlighted bracket with clue text, pulsing/glowing border | Accepts keyboard input |
| **Locked parent** | Dimmed or neutral bracket, shows partial text with child brackets visible inside | Does NOT accept input |
| **Solved** | Bracket disappears, answer word appears in-place with a brief animation (expand/fade-in), text flows naturally into surrounding sentence | No further interaction |
| **Active (focused)** | The specific leaf bracket the player is currently typing into — distinct highlight color | Shows typed text, submit on Enter |

### 2.6 Scoring System

**Base score:** Each puzzle starts at a maximum score (likely 100 points, scaled by bracket count).

**Penalties:**

| Action | Point Deduction |
|--------|----------------|
| Wrong guess | -2 points |
| Peek (reveal first letter) | -5 points |
| Reveal (show entire answer) | -20 points (includes the 5 for peek) |

**Additional metric:** Total keystrokes vs. minimum possible keystrokes (efficiency ratio).

**Ranks (city-themed):**

| Rank | Criteria |
|------|----------|
| **Tourist / Commuter** | Completed with significant mistakes or heavy assistance |
| **Mayor** | Strong solve — minimal errors, few peeks |
| **Kingmaker** | Perfect — zero wrong guesses, zero peeks, zero reveals |

*Note: Two wrong guesses can drop you from Kingmaker to Mayor territory.*

### 2.7 Peek & Reveal Mechanics

- **Peek:** Available per bracket. Shows the first letter of the answer. Costs 5 points. Keeps the player engaged in solving.
- **Reveal:** Available per bracket. Shows the entire answer and auto-solves the bracket. Costs 20 points total. Moves the puzzle forward but tanks your rank.
- Both are per-bracket actions — you can peek one bracket and reveal another independently.

### 2.8 End-of-Game Screen

After solving all brackets:
- Display the complete revealed sentence
- Show the historical event context
- Display rank (Tourist/Commuter → Mayor → Kingmaker)
- Show score breakdown (wrong guesses, peeks, reveals)
- Show keystroke efficiency
- Share button for social media (spoiler-free emoji/grid format, similar to Wordle's green/yellow squares)
- Streak counter (consecutive days played/solved)

### 2.9 Clue Types Observed in the Original

| Clue Type | Example | Notes |
|-----------|---------|-------|
| **Definition** | `[opposite of clean]` → DIRTY | Straightforward vocabulary |
| **Fill-in-the-blank** | `[lord of the _]` → RING | Pop culture, idioms, common phrases |
| **Trivia** | `[game played with a cue ball]` → POOL | General knowledge |
| **Wordplay/pun** | Various — clues that play on double meanings | Core to the game's charm |
| **Category/association** | `[what you do with food]` → EAT | Broad associative clues |

Typically 5-15 brackets per puzzle depending on complexity. The historical sentence length and nesting depth determine difficulty.

---

## 3. Hebrew Adaptation — Language-Specific Design

### 3.1 RTL Layout Architecture

The entire application must be RTL-native, not an afterthought. Key considerations:

- **`dir="rtl"` on root element**, with `lang="he"`
- **CSS logical properties** throughout: use `margin-inline-start` instead of `margin-left`, `padding-inline-end` instead of `padding-right`, etc.
- **Flexbox/Grid direction** automatically flips with `dir="rtl"`
- **Brackets in RTL:** Square brackets `[]` are Unicode "mirrored" characters — they automatically flip in RTL context. This means `[רמז]` displays correctly with the opening bracket on the right side. However, this needs thorough testing across browsers.
- **Bidirectional text (BiDi) handling:** If clues or answers contain English words, numbers, or brand names, use `<bdi>` elements or Unicode BiDi control characters to prevent text reordering issues.
- **Icons/arrows:** All directional icons must flip (next → ←, back → →).

### 3.2 Hebrew Morphology — The Superpower

Hebrew's morphological structure makes this game potentially MORE interesting than in English:

**Root system (שורש):**
Hebrew words are built from 3-letter roots. The root כ.ת.ב (k-t-v, "write") generates:
- כָּתַב (katav) — wrote
- מִכְתָּב (mikhtav) — letter
- כַּתָּבָה (katava) — article/report
- כְּתֹבֶת (ktovet) — address
- הִכְתִּיב (hikhtiv) — dictated

This means a bracket hiding inside a word can obscure a ROOT, and solving it reveals multiple words that share that root — a mechanic that doesn't exist in English.

**Example Hebrew puzzle:**
Final sentence: `"הכתבה פורסמה בעיתון"` (The article was published in the newspaper)

Nested: `"ה[מה עושים עם עט]בה פורסמה בעיתון"`
- `[מה עושים עם עט]` → **כת** (part of the root כ.ת.ב)
- Solving reveals: הכתבה

Or deeper: `"ה[מה עושים עם עט]בה [הופיעה ב___]מה בעיתון"`

**Prefix/suffix system:**
Hebrew uses single-letter prefixes that change meaning:
- ב (in), ה (the), ו (and), ל (to), מ (from), ש (that)
- These can be hidden inside brackets: `[the in Hebrew]ספר` → **ה** → reveals הספר (the book)

### 3.3 Nikud (Vowel Points) Decision

**Recommendation: No nikud for standard play.** 

Reasoning:
- Modern Hebrew is written without nikud — readers expect it
- Nikud would reduce ambiguity, making puzzles easier (sometimes TOO easy)
- Without nikud, a clue answer might have multiple possible readings, adding strategic depth
- Optional nikud toggle in settings for younger players or learners

**Exception:** If a clue's answer is specifically about pronunciation or a word that's ambiguous without nikud, the puzzle creator can add nikud to that specific bracket.

### 3.4 Content Sources for Hebrew Version

Instead of "this day in American history" from The Atlantic, use:

| Source Type | Examples | Notes |
|-------------|----------|-------|
| **Israeli history** | "היום בהיסטוריה הישראלית" — Independence events, wars, peace agreements, political milestones | Primary content source |
| **Jewish history** | Temple periods, diaspora events, holidays' historical origins | Appeals to cultural identity |
| **Hebrew literature** | Quotes from Bialik, Agnon, Amichai, Rachel, Leah Goldberg | Educational, culturally rich |
| **Biblical/Talmudic phrases** | Famous verses, proverbs, sayings that entered modern Hebrew | Deep cultural resonance |
| **Israeli pop culture** | Song lyrics, movie quotes, famous TV moments | Younger audience appeal |
| **Science/world history** | Major world events with Israeli/Jewish connection | Broader appeal |

### 3.5 Hebrew Keyboard Input

- Standard Hebrew keyboard layout
- Handle final letters (sofiot): כ→ך, מ→ם, נ→ן, פ→ף, צ→ץ
- Auto-accept both forms (if user types מ when ם is expected at word end, accept it)
- No case sensitivity (Hebrew has no case)

---

## 4. Technical Architecture

### 4.1 Tech Stack (Recommended)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend (Player)** | Next.js 14+ (App Router) + TypeScript | SSR for SEO, React ecosystem, easy RTL |
| **Frontend (Admin)** | Same Next.js app, separate `/admin` route group | Shared components, single deployment |
| **Styling** | Tailwind CSS + CSS logical properties | RTL-friendly, rapid development |
| **Animation** | Framer Motion | Smooth bracket solve animations |
| **Backend/API** | Next.js API routes or separate Node.js/Express | Simple REST API |
| **Database** | PostgreSQL | Relational data, JSONB for puzzle trees |
| **Auth** | NextAuth.js or Clerk | Admin auth + optional player accounts |
| **Hosting** | Vercel or AWS | Edge functions, global CDN |
| **Analytics** | PostHog or Mixpanel | Player behavior tracking |

### 4.2 Puzzle Data Model

```typescript
// The core puzzle tree node
interface PuzzleNode {
  id: string;                    // Unique node identifier
  type: 'text' | 'bracket';     // Plain text or solvable bracket
  content?: string;              // For 'text' nodes: the literal text
  clue?: string;                 // For 'bracket' nodes: the clue shown to the player
  answer?: string;               // For 'bracket' nodes: the correct answer
  children?: PuzzleNode[];       // Ordered list of child nodes (text + bracket interleaved)
  // Metadata
  difficulty?: 'easy' | 'medium' | 'hard';
  clueType?: 'definition' | 'fill-blank' | 'trivia' | 'wordplay' | 'association';
  acceptedAnswers?: string[];    // Alternative accepted spellings
  hint?: string;                 // Optional extra hint text
}

// Full puzzle
interface Puzzle {
  id: string;
  date: string;                  // ISO date — the day this puzzle is for
  title: string;                 // Display title
  finalSentence: string;         // The complete revealed sentence
  historicalContext: string;      // "On this day..." explanation
  tree: PuzzleNode;              // Root node of the puzzle tree
  totalBrackets: number;         // Pre-computed bracket count
  maxScore: number;              // Base score for this puzzle
  language: 'he';                // Language code
  createdBy: string;             // Admin user ID
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  tags: string[];                // e.g., ['history', 'literature', 'easy']
}
```

### 4.3 Puzzle String Format (Storage & Transport)

Puzzles can be stored as a human-readable bracketed string and parsed into the tree:

```
הכ[מה עושים עם עט]בה [פעולה של הוצאת ספר]סמה ב[דבר שקוראים אותו כל בוקר]
```

**Parsing algorithm:** Recursive descent parser (or stack-based):

```typescript
function parsePuzzle(input: string): PuzzleNode {
  // Stack-based approach:
  // 1. Scan character by character
  // 2. '[' → push new bracket node onto stack
  // 3. ']' → pop bracket node, attach to parent
  // 4. Text between brackets → text nodes
  // 5. Result: tree with root node containing all top-level children
}
```

The parser must handle:
- Nested brackets at arbitrary depth
- Hebrew UTF-8 characters
- Mixed text and brackets at any level
- Validation: balanced brackets, no empty brackets, no orphaned closing brackets

### 4.4 Game State Machine

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│  INIT   │────▶│ PLAYING  │────▶│ SOLVED  │────▶│  SHARED  │
└─────────┘     └──────────┘     └─────────┘     └──────────┘
                     │                                   
                     ▼                                   
                ┌──────────┐                             
                │  PEEKED  │ (per bracket)               
                └──────────┘                             
                     │                                   
                     ▼                                   
                ┌──────────┐                             
                │ REVEALED │ (per bracket)               
                └──────────┘                             
```

**Player session state:**

```typescript
interface GameSession {
  puzzleId: string;
  startedAt: Date;
  solvedNodes: Set<string>;        // IDs of solved bracket nodes
  wrongGuesses: number;
  peeks: Map<string, boolean>;     // nodeId → peeked
  reveals: Map<string, boolean>;   // nodeId → revealed
  keystrokes: number;
  currentScore: number;
  rank: 'tourist' | 'commuter' | 'mayor' | 'kingmaker';
  streak: number;                  // Consecutive days
}
```

### 4.5 Scoring Engine

```typescript
function calculateScore(session: GameSession, puzzle: Puzzle): ScoreResult {
  const baseScore = puzzle.maxScore; // e.g., 100
  
  const wrongGuessPenalty = session.wrongGuesses * 2;
  const peekPenalty = session.peeks.size * 5;
  const revealPenalty = session.reveals.size * 20;
  
  const finalScore = Math.max(0, baseScore - wrongGuessPenalty - peekPenalty - revealPenalty);
  
  const efficiency = puzzle.totalBrackets * minKeystrokesPerBracket / session.keystrokes;
  
  let rank: Rank;
  if (finalScore === baseScore) rank = 'kingmaker';
  else if (finalScore >= baseScore * 0.7) rank = 'mayor';
  else if (finalScore >= baseScore * 0.4) rank = 'commuter';
  else rank = 'tourist';
  
  return { finalScore, rank, efficiency, breakdown: { wrongGuessPenalty, peekPenalty, revealPenalty } };
}
```

### 4.6 Answer Validation

Hebrew-specific answer matching:

```typescript
function validateAnswer(input: string, node: PuzzleNode): boolean {
  const normalize = (s: string) => s
    .trim()
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/[ךםןףץ]/g, match => { // Normalize final letters
      const map: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
      return map[match] || match;
    })
    .replace(/[\u0591-\u05C7]/g, '') // Strip nikud/cantillation
    .replace(/"/g, '')               // Strip geresh/gershayim
    .replace(/'/g, '');
  
  const normalizedInput = normalize(input);
  const normalizedAnswer = normalize(node.answer!);
  
  if (normalizedInput === normalizedAnswer) return true;
  
  // Check alternative accepted answers
  return node.acceptedAnswers?.some(alt => normalize(alt) === normalizedInput) ?? false;
}
```

---

## 5. Admin / Backoffice System

### 5.1 Overview

The admin system is the key differentiator — it's what you're selling to newspapers. It needs to make puzzle creation intuitive for riddle creators who are NOT programmers.

**Reference:** The original Bracket City has a builder tool at `builder.bracket.city` — our admin system should be significantly more powerful.

### 5.2 Admin Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access, user management, settings |
| **Editor** | Review/approve puzzles, schedule publication, view analytics |
| **Creator (Riddler)** | Create and edit own puzzles, submit for review, view own puzzle analytics |

### 5.3 Riddle Creator — Step-by-Step Wizard

**Step 1: Enter the Final Sentence**
- Text input for the complete Hebrew sentence
- Auto-suggest from historical events database based on selected date
- Source field (where the quote/fact comes from)
- Character count and reading level indicator

**Step 2: Select Words to Bracketify**
- The sentence displays with each word clickable
- Click a word (or drag to select a phrase/fragment) to wrap it in brackets
- Can select PARTIAL words (crucial for Hebrew root mechanics)
- Visual: selected portions highlight and brackets appear around them

**Step 3: Write Clues**
- For each bracket, a clue editor opens
- Fields: clue text, clue type (dropdown: definition, fill-blank, trivia, wordplay, association), difficulty rating
- Alternative accepted answers field (comma-separated)
- Clue preview shows how it looks in context

**Step 4: Nest Brackets**
- Select a bracket and drag it INSIDE another word/bracket in the sentence
- Or: click "Add nesting level" on an existing bracket to convert a word in the clue into a sub-bracket
- Tree visualization updates in real-time (side panel)
- Depth indicator shows nesting level

**Step 5: Preview & Test**
- Full interactive preview — play through the puzzle as a user would
- Solve order validation: are all leaves solvable? Does the chain reaction work?
- Auto-solve mode: watch the puzzle solve itself step by step
- Difficulty score: computed from nesting depth × clue obscurity × bracket count

**Step 6: Submit**
- Assign to date
- Add tags/categories
- Submit for editor review or publish directly (based on role)

### 5.4 Tree Visualizer (Always Visible)

A collapsible side panel showing the puzzle as a tree diagram:

```
Root: "הכתבה פורסמה בעיתון"
├── Text: "ה"
├── Bracket: [מה עושים עם עט] → "כת"
│   └── (leaf — solvable)
├── Text: "בה "
├── Bracket: [פעולה של הוצאת ספר] → "פורסמה"
│   └── (leaf — solvable)  
├── Text: " ב"
└── Bracket: [דבר שקוראים אותו כל בוקר] → "עיתון"
    └── (leaf — solvable)
```

Color-coded: green = leaf/solvable, yellow = has children/locked, gray = plain text.

### 5.5 Validation Engine

Runs automatically on every change. Blocks publication if any check fails:

| Check | Description | Severity |
|-------|-------------|----------|
| **Balanced brackets** | Every `[` has a matching `]` | Error (blocks save) |
| **Non-empty brackets** | No `[]` with no clue text | Error |
| **All leaves have clues** | Every leaf bracket must have a clue | Error |
| **All brackets have answers** | Every bracket must have an answer | Error |
| **Answer reconstructs sentence** | Plugging all answers back must produce the final sentence exactly | Error |
| **No circular dependencies** | Tree must be a valid DAG (technically always true for brackets, but validate anyway) | Error |
| **Hebrew spell check** | All answer words are valid Hebrew | Warning |
| **Clue quality** | AI-assisted check: is the clue solvable? Is it too easy/hard? | Warning |
| **Difficulty balance** | Not all clues should be the same difficulty | Warning |
| **Minimum bracket count** | At least 3 brackets for a meaningful puzzle | Warning |

### 5.6 Content Management

**Puzzle Calendar View:**
- Monthly calendar showing scheduled puzzles
- Color-coded: draft (gray), in review (yellow), scheduled (blue), published (green), no puzzle (red)
- Drag-and-drop to reschedule
- Gap alerts: "No puzzle scheduled for April 25!"

**Historical Events Database:**
- Searchable database of Israeli/Jewish/world history events by date
- Auto-populated from public APIs + manual curation
- Each event tagged with potential keywords for puzzle inspiration
- "Suggest puzzle topic" for a given date

**Puzzle Archive:**
- Searchable archive of all past puzzles
- Filter by date, creator, difficulty, tags, score distribution
- Duplicate detection (don't reuse the same historical event too often)

### 5.7 Analytics Dashboard

**Per-puzzle analytics:**
- Solve rate (% of players who completed)
- Average score
- Score distribution histogram
- Average time to complete
- Most peeked/revealed brackets (identifies which clues are too hard)
- Dropout point (which bracket do players abandon at?)

**Aggregate analytics:**
- Daily/weekly/monthly active users
- Retention curves
- Streak distribution
- Rank distribution (what % of players are Kingmakers?)
- Clue type difficulty ranking (which clue types are hardest for users?)

**Creator analytics:**
- Per-creator puzzle quality scores
- Average difficulty rating of their puzzles
- Player feedback/ratings per creator

---

## 6. Player-Facing Features

### 6.1 Core Game Screen

**Layout (RTL):**
```
┌─────────────────────────────────────┐
│  Logo    📅 Date    ⚙️ Settings      │
├─────────────────────────────────────┤
│                                     │
│  [Puzzle text with brackets]        │
│  [displayed RTL, Hebrew font]       │
│  [active bracket highlighted]       │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │  Type your answer...        │    │
│  └─────────────────────────────┘    │
│  [👁 Peek]  [💡 Reveal]  [Enter ⏎] │
├─────────────────────────────────────┤
│  Progress: ████░░░░ 4/10 brackets   │
│  Score: 92  |  ❌ 2 wrong           │
└─────────────────────────────────────┘
```

### 6.2 Animations

| Event | Animation | Duration |
|-------|-----------|----------|
| **Bracket solved** | Clue text fades out, answer word scales up from 0 to 1 with slight bounce | 300-400ms |
| **Parent unlocked** | Subtle glow/pulse on newly solvable bracket | 200ms |
| **Wrong guess** | Shake animation on input field, brief red flash on bracket | 300ms |
| **Peek** | First letter appears with typewriter effect | 150ms |
| **All solved** | Confetti/celebration, sentence glows, rank badge animates in | 800ms |
| **Chain reaction** | When solving a leaf promotes parent to leaf AND parent is the last child → cascading solve animation | 500ms staggered |

### 6.3 Social Sharing

Spoiler-free share format (similar to Wordle):

```
🏙️ עיר הסוגריים — 20.4.2026

🟩🟩🟩🟩🟨🟩🟩
⭐ Kingmaker | 100 נק׳
🔥 רצף: 15 ימים

bracket-city-hebrew.com
```

- 🟩 = solved without help
- 🟨 = solved with peek
- 🟥 = revealed
- Order matches solving order, not bracket order

### 6.4 Player Accounts (Optional)

- Play without account (streak stored locally)
- Optional sign-up for cross-device streak sync
- Leaderboards (daily, weekly, all-time)
- Achievement badges

### 6.5 Accessibility

- Screen reader support with ARIA labels for bracket states
- High contrast mode
- Font size adjustment
- Keyboard-only navigation (Tab between brackets, Enter to submit)

---

## 7. Database Schema

```sql
-- Puzzles
CREATE TABLE puzzles (
  id UUID PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  title TEXT NOT NULL,
  final_sentence TEXT NOT NULL,
  historical_context TEXT,
  tree JSONB NOT NULL,           -- The full PuzzleNode tree
  raw_bracket_string TEXT,       -- Human-readable bracket format
  total_brackets INTEGER NOT NULL,
  max_score INTEGER DEFAULT 100,
  difficulty_rating FLOAT,
  status TEXT CHECK (status IN ('draft','review','scheduled','published','archived')),
  created_by UUID REFERENCES admin_users(id),
  reviewed_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  tags TEXT[]
);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('super_admin','editor','creator')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player sessions (anonymous or authenticated)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  puzzle_id UUID REFERENCES puzzles(id),
  player_id UUID,                -- NULL for anonymous
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  solved_nodes TEXT[],           -- Array of solved node IDs in order
  wrong_guesses INTEGER DEFAULT 0,
  peeks TEXT[],                  -- Node IDs that were peeked
  reveals TEXT[],                -- Node IDs that were revealed
  total_keystrokes INTEGER,
  final_score INTEGER,
  rank TEXT,
  device_type TEXT               -- 'mobile' or 'desktop'
);

-- Player streaks
CREATE TABLE player_streaks (
  player_id UUID PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_played DATE,
  total_games INTEGER DEFAULT 0,
  total_kingmakers INTEGER DEFAULT 0
);

-- Historical events database
CREATE TABLE historical_events (
  id UUID PRIMARY KEY,
  date_month INTEGER NOT NULL,   -- 1-12
  date_day INTEGER NOT NULL,     -- 1-31
  year INTEGER,
  title_he TEXT NOT NULL,
  description_he TEXT,
  category TEXT,                 -- 'israeli', 'jewish', 'world', 'culture', 'science'
  source TEXT,
  used_in_puzzle UUID REFERENCES puzzles(id)
);
```

---

## 8. API Endpoints

### Player API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/puzzle/today` | Get today's puzzle (tree with answers stripped) |
| GET | `/api/puzzle/:date` | Get puzzle for a specific date |
| POST | `/api/puzzle/:id/guess` | Submit a guess for a bracket `{ nodeId, answer }` |
| POST | `/api/puzzle/:id/peek` | Peek at a bracket `{ nodeId }` |
| POST | `/api/puzzle/:id/reveal` | Reveal a bracket `{ nodeId }` |
| GET | `/api/puzzle/:id/score` | Get final score and rank |
| GET | `/api/player/streak` | Get player streak info |
| GET | `/api/leaderboard/:period` | Get leaderboard (daily/weekly/all-time) |

### Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/puzzle` | Create new puzzle |
| PUT | `/api/admin/puzzle/:id` | Update puzzle |
| POST | `/api/admin/puzzle/:id/validate` | Run validation engine |
| POST | `/api/admin/puzzle/:id/publish` | Publish/schedule puzzle |
| GET | `/api/admin/puzzles` | List all puzzles with filters |
| GET | `/api/admin/analytics/puzzle/:id` | Get per-puzzle analytics |
| GET | `/api/admin/analytics/overview` | Get aggregate analytics |
| GET | `/api/admin/events/:month/:day` | Get historical events for a date |

---

## 9. Implementation Phases

### Phase 1: Core Game Engine (Weeks 1-3)
- Puzzle parser (bracket string → tree)
- Game state machine
- Answer validation (with Hebrew normalization)
- Scoring engine
- Basic player UI (puzzle display, input, solve flow)
- RTL layout foundation

### Phase 2: Full Player Experience (Weeks 4-5)
- Animations (solve, wrong guess, chain reaction, celebration)
- Peek & reveal mechanics
- End-of-game screen with rank and stats
- Social sharing
- Mobile responsiveness
- Streak tracking (local storage)

### Phase 3: Admin — Puzzle Creator (Weeks 6-8)
- Riddle creator wizard (5-step flow)
- Tree visualizer
- Validation engine
- Preview/test mode
- Puzzle calendar and scheduling
- Admin auth and roles

### Phase 4: Admin — Content & Analytics (Weeks 9-10)
- Historical events database + seeding
- Analytics dashboard (per-puzzle + aggregate)
- Creator analytics
- Content management (archive, search, tags)

### Phase 5: Polish & Launch (Weeks 11-12)
- Performance optimization
- Accessibility audit
- Browser/device testing (especially RTL edge cases)
- SEO (Hebrew meta tags, og:image generation)
- Legal review (ensure no IP issues with Bracket City concept)
- Soft launch with beta testers
- Pitch deck for Israeli media outlets

---

## 10. Hebrew-Specific Clue Design Guide (For Riddlers)

This section would be included in the admin system as creator documentation:

### Clue Techniques That Work in Hebrew

**Root hiding (הסתרת שורש):**
Hide a Hebrew root inside a word. The clue describes the root's meaning.
- `מ[חפץ לכתיבה]ב` → עט → reveals מעטפה (envelope... wait, better example)
- Key: the answer fragment + surrounding letters must form a real Hebrew word

**Prefix/suffix peeling (קילוף תחיליות/סופיות):**
Hide common Hebrew prefixes (ה, ב, ל, מ, ו, ש, כ) behind a clue.
- `[the in Hebrew]ספר` → ה → reveals הספר (the book)
- `[and in Hebrew]גם` → ו → reveals וגם (and also)

**Compound word splitting (פירוק מילים מורכבות):**
Hebrew compound words or smichut (סמיכות) can be split.
- `בית [מקום לרפואה]` → חולים → reveals בית חולים (hospital)

**Gematria clues (optional, advanced):**
For sophisticated solvers: clue based on numerical value of Hebrew letters.

**Acronym/Rashei Tevot (ר"ת) clues:**
Hebrew loves acronyms. Hide an acronym component.
- `צה[_]` → ל → reveals צה"ל (IDF)

### What Makes a Bad Hebrew Clue
- Too many possible answers (Hebrew's consonantal writing creates more ambiguity than English)
- Relies on nikud distinction that isn't visible
- Uses slang that only a specific age group knows
- Too culturally narrow (only religious, or only secular, etc.)

---

## 11. Selling to Israeli Media — Product Packaging

### What Newspapers Get
- White-labeled game (their branding, colors, logo)
- Embeddable widget (iframe or web component) for their website
- Daily puzzle content (created by their team using the admin system, or by a shared creator pool)
- Analytics dashboard
- Social sharing that links back to their site

### Revenue Models
- Monthly license fee per publication
- Revenue share on ad impressions around the game
- Premium tier: player accounts, leaderboards, puzzle archive access
- Creator marketplace: freelance riddlers can sell puzzles to multiple outlets

### Competitive Advantages
- First Hebrew nested-clue puzzle game
- Hebrew morphology makes it uniquely engaging
- Full admin system (The Atlantic relies on a single creator — we offer a scalable creator ecosystem)
- Cultural relevance (Israeli history, Hebrew literature)
- Proven format (Bracket City has already validated the concept in English)

---

## 12. Open Questions & Decisions Needed

1. **Nikud policy:** Default off, toggle available? Or always off?
2. **Multiple valid answers:** How lenient? Accept misspellings? Accept synonyms?
3. **Puzzle difficulty tiers:** Should there be easy/medium/hard tracks, or one puzzle per day?
4. **Audio clues:** Should we support audio clues for an accessibility/variety feature?
5. **Multiplayer mode:** Head-to-head solving or collaborative solving?
6. **Monetization for players:** Free with ads? Subscription? Freemium?
7. **Legal:** Is the bracket-nesting mechanic patentable? Do we need to differentiate enough from Bracket City?
8. **Hebrew name for the game:** Suggestions: עיר הסוגריים, סוגריים, חידת הסוגריים
