# Music Practice -- Complete Project Guide

## What This Project Is

This is a **music ear-training game** built as a **WeChat Mini Program** (a lightweight app that runs inside China's WeChat messaging app). The user hears musical intervals (two notes played one after another) or chords (multiple notes played together) and must identify what they heard from multiple-choice options.

Think of it like a quiz game for musicians, but instead of reading text, you listen to sounds.

---

## Technology Stack (Plain English)

| Technology | What it is | Role in this project |
|---|---|---|
| **TypeScript** | JavaScript with type annotations. You write `name: string` instead of just `name`, so bugs are caught before runtime. | All source code is `.ts`/`.tsx` |
| **React 18** | A library for building UIs as composable "components" (small reusable pieces). | Every screen/widget is a React component |
| **Taro 4.1.11** | A cross-platform framework that compiles React code into WeChat Mini Program native code. You write React, Taro converts it. | The bridge between React and WeChat |
| **Webpack 5** | A "bundler" -- takes all your source files, resolves imports, and produces a single optimized output folder (`dist/`). | Build system (configured in `config/`) |
| **Sass (SCSS)** | CSS with variables and nesting. The `.scss` files compile to standard CSS. | Minimal styling (most styles are inline) |
| **Web Audio API** | Browser API for low-level audio synthesis and playback. | Playing piano notes |

---

## File Structure -- What Each File Does

```
music-practice/
├── package.json            # Project metadata + dependencies + npm scripts
├── tsconfig.json           # TypeScript compiler settings
├── config/                 # Taro build configuration
│   ├── index.ts            #   Base config: source/output dirs, webpack5, plugins
│   ├── dev.ts              #   Dev-only overrides
│   └── prod.ts             #   Production-only overrides
│
├── src/                    # ALL application source code
│   ├── app.tsx             # Root component -- wraps everything in I18nProvider
│   ├── app.config.ts       # Taro app config: pages list, nav bar color/text
│   ├── app.scss            # Global styles (dark background, white text, font)
│   │
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions (the "data shapes")
│   │
│   ├── lib/                # Pure logic -- no React, no UI
│   │   ├── musicTheory.ts  # Defines intervals, chords, notes, difficulty configs
│   │   ├── levelConfig.ts  # Maps level numbers → which intervals/chords are available
│   │   ├── questionGenerator.ts  # Creates quiz questions (with adaptive weighting)
│   │   ├── scoring.ts      # Score calculation (base + combo + speed bonus)
│   │   └── i18n.ts         # Bilingual translations (English + Chinese)
│   │
│   ├── hooks/              # React hooks -- stateful logic separated from UI
│   │   ├── useGameState.ts # Game state machine (menu→playing→answering→feedback)
│   │   ├── useProgress.ts  # Persistent stats (save/load to WeChat storage)
│   │   ├── useAudio.ts     # Audio playback engine (sample + oscillator fallback)
│   │   ├── useAudioCache.ts     # Downloads, caches, decodes piano samples
│   │   ├── useAudioPreloader.ts # Loading screen progress bar logic
│   │   └── useI18n.ts      # i18n React context hook
│   │
│   ├── components/
│   │   └── I18nProvider.tsx # Provides language context to the entire app
│   │
│   └── pages/
│       └── index/
│           ├── index.tsx    # THE MAIN PAGE -- all UI lives here (~700 lines)
│           ├── index.scss   # Minimal extra styles
│           └── index.config.ts
│
└── dist/                   # Build output -- opened in WeChat DevTools
```

---

## Core Concepts Explained

### 1. TypeScript Types (`src/types/index.ts`)

This file defines the **shape of all data** in the app. Nothing runs here -- it just describes *what things look like*:

- **`Difficulty`**: `'easy' | 'normal' | 'hard'` -- three difficulty modes
- **`QuestionType`**: `'interval' | 'chord'` -- two kinds of quiz questions
- **`Interval`**: An interval has a `name` (e.g. "Major 3rd"), `semitones` (4), and `category`
- **`ChordType`**: A chord has a `name` (e.g. "Major"), `intervals` (e.g. `[0, 4, 7]` semitones from root), and `category`
- **`Question`**: A generated quiz question: root note, correct answer name, semitone distances for playback, answer options
- **`Answer`**: A user's response: what they picked, what was correct, how long they took
- **`GameState`**: The full state of an active game session (score, combo, current question, etc.)
- **`UserProgress`**: Persistent stats across sessions (total score, highest levels, answer history)

### 2. Music Theory Data (`src/lib/musicTheory.ts`)

This is the **knowledge base** of the app. It defines:

- **16 intervals** from Minor 2nd (1 semitone) to Major 10th (16 semitones), categorized as basic/diatonic/chromatic/compound
- **15 chord types** from simple triads (Major, Minor, Diminished) to complex extended/altered chords
- **12 note names**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- **`noteFromSemitone()`**: Given a root note and semitone distance, calculates the resulting note (e.g., `C4 + 4 semitones = E4`)
- **`DIFFICULTY_CONFIGS`**: Maps each difficulty to which intervals/chords are available, how many answer options, note duration, gap timing, and whether keyboard hints show

### 3. Level Progression (`src/lib/levelConfig.ts`)

The 50 levels are organized as:

| Levels | Difficulty | Content |
|---|---|---|
| 1-3 | Easy | Only Major 2nd/3rd, Perfect 5th + Major/Minor triads |
| 4-6 | Easy | Add Perfect 4th, Diminished triads |
| 7-8 | Easy | Add Octave |
| 9-10 | Easy | All easy content, higher accuracy needed |
| 11-15 | Normal | All diatonic intervals + 7th chords |
| 16-20 | Normal | All basic+diatonic intervals + all triads/7ths |
| 21-25 | Normal | Everything except compound intervals |
| 26-50 | Hard | Everything, progressively harder pass requirements |

Each level specifies `questionsToPass` and `accuracyToPass` to advance.

### 4. Question Generation (`src/lib/questionGenerator.ts`)

This is the **adaptive learning engine**:

1. Picks a random question type (interval or chord, 50/50)
2. Gets the available intervals/chords for the current level
3. **Adaptive weighting**: Looks at past wrong answers and adds extra copies of weak areas to the random pool (so you see your weaknesses more often)
4. Picks a random root note (e.g. "C4", "F#4")
5. Generates distractor options (wrong answers) by shuffling the available pool
6. Returns a complete `Question` object

There's also `generatePracticeQuestion()` for the Review panel's "Practice Weaknesses" mode.

### 5. Scoring (`src/lib/scoring.ts`)

Score = `(100 base + combo_bonus + speed_bonus) * difficulty_multiplier * combo_multiplier`

- **Difficulty multiplier**: Easy=1x, Normal=1.5x, Hard=2.5x
- **Combo bonus**: +25 per consecutive correct answer
- **Combo multiplier**: `1 + combo * 0.1`, capped at 5x
- **Speed bonus**: Up to +50 points if you answer in under 3 seconds (linearly scaled)

Level-up threshold: `800 + level * 200` accumulated points within the level.

---

## How The App Boots Up

```
1. Taro framework loads app.tsx
      ↓
2. app.tsx wraps children in <I18nProvider>  (sets up language context)
      ↓
3. app.config.ts tells Taro the only page is "pages/index/index"
      ↓
4. pages/index/index.tsx renders -- this IS the whole app
      ↓
5. On mount, useAudioPreloader starts downloading piano samples
      ↓
6. Loading screen shows progress bar (X / 98 samples)
      ↓
7. Once loaded, main UI appears starting at "menu" status
```

---

## The Game State Machine (`useGameState.ts`)

The app is driven by a **state machine** with these statuses:

```
  ┌──────────────────────────────────────────────┐
  │                                              │
  ▼                                              │
MENU ──(pick difficulty)──► PLAYING              │
                              │                   │
                       (tap Play Sound)           │
                              ▼                   │
                          ANSWERING               │
                              │                   │
                       (pick an answer)           │
                              ▼                   │
                          FEEDBACK                │
                           │    │                 │
                  (correct) │    │ (wrong)         │
                           │    │                 │
                     (tap Next Question)          │
                              │                   │
                         back to PLAYING ─────────┘
                                                  
  Also: REVIEW  (mistake history + practice mode)
        PROGRESS (stats dashboard)
```

- **MENU**: Choose Easy/Normal/Hard
- **PLAYING**: Question is shown, "Play Sound" button is visible
- **ANSWERING**: Sound has played, answer buttons are active, timer is running
- **FEEDBACK**: User answered, shows correct/incorrect, shows correct answer on piano
- **REVIEW**: Shows mistakes list, accuracy by item, confusion pairs, "Practice Weaknesses" button
- **PROGRESS**: Shows stats dashboard (total score, accuracy, highest levels, accuracy trend chart)

---

## The Audio Pipeline (`useAudio.ts` + `useAudioCache.ts`)

This is the most complex subsystem. Here's how sound goes from "user taps Play" to "piano comes out of the speaker":

### Sample Loading (one-time)
```
1. useAudioPreloader calls preloadAll()
2. AudioCache downloads 98 MP3 files from jsDelivr CDN
   (Salamander Grand Piano samples -- A, A#, B, C, C#, D, D#, E, F, F#, G, G# across 7 octaves)
3. Each MP3 is decoded into an AudioBuffer via Web Audio API
4. Decoded buffers are cached in memory AND saved to WeChat local filesystem
5. Next launch: loads from local FS instead of re-downloading
```

### Playing a Note
```
1. Code calls playInterval("C4", 4, "easy")  → "play C4 and E4 sequentially"
2. noteFromSemitone("C4", 4) → "E4"
3. For each note, findNearestSample() finds the closest pre-loaded sample
   e.g., "E4" has an exact match "E4.mp3" → playbackRate = 1.0
   e.g., "C#5" → nearest is "Cs5.mp3" → playbackRate = 1.0
4. If no sample available, falls back to oscillator (triangle wave)
5. Audio chain: BufferSource → GainNode → MasterGain(10x) → Compressor → Speakers
   The 10x gain + compressor acts as a "loudness maximizer"
```

### Three Playback Modes
- **`playInterval()`**: Two notes sequentially with a gap between them
- **`playChord()`**: All notes simultaneously
- **`playArpeggio()`**: Notes one after another (used when you get a chord wrong, so you can hear each note)

---

## The UI (`pages/index/index.tsx`)

This single 700-line file contains the entire interface. It uses **Taro components** (`View`, `Text`, `Button`, `ScrollView`) instead of HTML (`div`, `span`, `button`) because WeChat Mini Programs don't use real HTML.

### Inline Components (defined in the same file)

- **`PianoKeyboard`**: Renders a 3-octave piano (octaves 3, 4, 5) using absolutely-positioned `View` elements. Highlighted notes glow purple when hints are enabled.
- **`ScoreBar`**: Shows difficulty badge, score, combo streak, accuracy during gameplay
- **`AnswerGrid`**: A 2-column grid of answer buttons. Colors change on feedback: green for correct, red for wrong, gray for others.

### Screens (rendered conditionally based on `status`)

1. **Loading Screen**: Progress bar + "Loading piano samples..." (shown during preload)
2. **Menu**: Three large cards (Easy/Normal/Hard) with descriptions and best level
3. **Game Board**: Piano keyboard + Play/Replay buttons + answer grid + feedback banner
4. **Review**: Filter tabs (All/Intervals/Chords) + Accuracy by Item + Confusion Pairs + Areas to Improve + Recent Mistakes with replay buttons
5. **Progress**: Stats grid (score, accuracy, questions, correct) + Highest Levels + Accuracy Trend bar chart + Most Missed bar chart

### Styling Approach

Almost all styling is **CSS-in-JS** (inline `style={{ ... }}` objects). This is necessary because WeChat Mini Programs have limited CSS support. The color palette is a dark theme using Tailwind-like colors (`#0f172a`, `#1e293b`, `#f8fafc`, etc.).

Units use `rpx` (responsive pixels) -- a WeChat-specific unit where 750rpx = screen width, so the layout adapts to any phone.

---

## Persistent Data (`useProgress.ts`)

All user progress is saved to **WeChat local storage** (via `Taro.getStorageSync` / `Taro.setStorageSync`):

- Stored under key `"music-practice-progress"`
- Keeps last 500 answers (rolling window: `prev.answers.slice(-499)`)
- Tracks: total score, highest level per difficulty, total questions/correct, full answer history

Analytics functions derived from stored answers:
- **`getMistakes()`**: All wrong answers
- **`getWeaknesses()`**: Top 10 most-missed items by count
- **`getConfusionPairs()`**: "You keep confusing Major 3rd with Minor 3rd" (top 10)
- **`getPerItemAccuracy()`**: Accuracy % for each interval/chord
- **`getAccuracyOverTime()`**: Divides history into 10 buckets to show trend

---

## Internationalization (`i18n.ts` + `I18nProvider.tsx` + `useI18n.ts`)

The app supports Chinese (default) and English:

1. **`I18nProvider`** wraps the entire app, reads saved language from `wx.getStorageSync`, provides context
2. **`useI18n()`** hook gives any component access to `t` (translations object) and `toggleLanguage()`
3. **`translateMusicName()`** is context-aware: "Major 7th" translates to "大七度" for intervals but "大七和弦" for chords
4. Toggle button in the header switches between "中" and "EN"

---

## Build & Run

```bash
npm run dev:weapp    # Watches files, rebuilds on change → output in dist/
npm run build:weapp  # One-time production build → output in dist/
```

Then open `dist/` in **WeChat DevTools** to preview or publish.

---

## Data Flow Summary

```
User taps "Easy" 
  → startGame('easy', 1)
    → generateQuestion('easy', 1) creates a Question
    → state becomes { status: 'playing', currentQuestion: {...} }

User taps "Play Sound"
  → playInterval/playChord is called with the question's rootNote + semitones
  → Audio pipeline loads samples, schedules playback
  → state becomes 'answering', timer starts

User picks an answer
  → submitAnswer(userAnswer)
    → compares with currentQuestion.targetName
    → calculateScore() if correct
    → creates Answer object, pushes to sessionAnswers
    → calls onAnswer → recordAnswer (saves to progress)
    → state becomes 'feedback'

User taps "Next Question"
  → nextQuestion()
    → checks if levelScoreRef >= threshold → level up
    → generateQuestion() with pastAnswers for adaptive weighting
    → state becomes 'playing' again
```

---

## Key Design Patterns

1. **Separation of concerns**: Pure logic in `lib/`, React state in `hooks/`, UI in `pages/`. The `lib/` files have zero React imports and could be used anywhere.
2. **Hooks pattern**: Each concern (game state, audio, progress, i18n) is its own custom hook, keeping the main component focused on rendering.
3. **State machine**: The `status` field drives which UI is shown. No route-based navigation -- it's a single-page app with conditional rendering.
4. **Graceful degradation**: Audio has a 3-level fallback: cached sample → downloaded sample → oscillator synthesis.
5. **Adaptive learning**: The question generator weights weak areas more heavily, so the game naturally drills your mistakes.
