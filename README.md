# Music Theory Practice – WeChat Mini Program

This branch is the **WeChat Mini Program** version built with **Taro 4.1.11 + React 18**. It delivers the same ear-training gameplay as the web version, but with a native WeChat experience, optimized audio pipeline, and bilingual UI.

## 🎵 Features

- **Intervals & Chords**: Minor 2nd → compound intervals; triads, sevenths, extended, altered chords
- **Three Difficulties**: Easy / Normal / Hard with keyboard hints, answer counts, and tempo tuned per level
- **Adaptive Learning**: Weak areas appear more often
- **Progress Tracking**: Local stats, mistake review, accuracy trends
- **Bilingual UI**: Chinese (default) and English, context-aware music theory terms
- **Reliable Audio**: Web Audio API + cached samples + oscillator fallback

## 🧱 Tech Stack (Mini Program)

- **Framework**: Taro 4.1.11 + React 18 (TypeScript)
- **Platform**: WeChat Mini Program (WeApp)
- **Audio**: WeChat Web Audio API
- **Storage**: Taro storage & file system (sample cache + progress)
- **Styling**: CSS-in-JS via inline styles in Taro components

## 🚀 Setup & Build

### Prerequisites
- Node.js 18+
- npm
- **WeChat DevTools** installed (for preview/upload)

### Install & Run (WeApp)
```bash
git clone https://github.com/cynkiller/music-practice.git
cd music-practice
git checkout mini-program
npm install

# Dev preview (outputs to dist/ for DevTools)
npm run dev:weapp

# Production build (WeApp)
npm run build:weapp
```

Open the generated `dist/` folder in **WeChat DevTools** to preview or upload.

## 🎮 Gameplay

1. Choose difficulty (Easy / Normal / Hard)
2. Tap **Play Sound** to hear interval or chord
3. Pick the correct answer; keyboard hints show on Easy
4. Review mistakes; replay examples with audio
5. Track score, combo, accuracy, and level progression

### Difficulty Timing (Mini Program)
- **Easy**: 1200ms notes, 400ms gaps, 4 options, keyboard hints
- **Normal**: 1200ms notes, 400ms gaps, 6 options
- **Hard**: 900ms notes, 250ms gaps, 8 options

## 🎵 Audio System (Mini Program)

- **Samples**: 30 WAV files (A, C, D#, F# across octaves) with **pitch shifting** for all 88 notes
- **Caching**: Download-once to local FS; preload with progress bar
- **Decoding**: WeChat-compatible `decodeAudioData` (callback wrapped in Promise)
- **Playback**: Web Audio buffer sources with gain envelopes; oscillator fallback if sample fails
- **Timing**: Near-real-time scheduling (setTimeout) to avoid dropped notes on mobile

## 🌐 Internationalization

- **Default language**: Chinese (zh); toggle to English in header
- **Context-aware translation**: Intervals vs chords have different terms (e.g., Major 7th → 大七度 for interval, 大七和弦 for chord)

## 📁 Project Structure (Mini Program)
```
src/
├── components/
│   └── I18nProvider.tsx      # i18n context
├── hooks/
│   ├── useAudio.ts           # Web Audio scheduling & fallback
│   ├── useAudioCache.ts      # Sample download/cache/decode
│   ├── useAudioPreloader.ts  # Preload with progress
│   ├── useGameState.ts       # Game flow
│   ├── useProgress.ts        # Local stats storage
│   └── useI18n.ts            # i18n hook
├── lib/
│   ├── i18n.ts               # Translations (EN/ZH)
│   ├── musicTheory.ts        # Intervals/chords definitions
│   ├── questionGenerator.ts  # Adaptive questions
│   ├── scoring.ts            # Score calculation
│   └── levelConfig.ts        # Level tuning
├── pages/index/              # Main WeApp page
├── app.tsx / app.config.ts   # Taro app entry & config
└── config/                   # Taro build configs
```

## �️ Scripts
```bash
npm run dev:weapp   # Dev build for WeChat
npm run build:weapp # Production build for WeChat
npm run dev:h5      # (Optional) web dev build
npm run build:h5    # (Optional) web prod build
```

## 🚢 Deploy to WeChat

1. Run `npm run build:weapp`
2. Open **WeChat DevTools** → "Mini Program"
3. Select project root, set `dist/` as the build output
4. Preview or upload from DevTools

## � Troubleshooting (Mini Program)

- **No sound / dropped notes**: Ensure preload completes; WeChat allows audio; retry with good network
- **Slow first play**: Preload samples (built-in loading screen) to avoid on-demand fetch
- **Language not switching**: Toggle button in header; saved in Taro/WeChat storage
- **Decode errors**: Uses callback-based decode; falls back to oscillator if sample fails

## 🤝 Contributing (mini-program branch)

1. Fork and branch from `mini-program`
2. Make changes and test in **WeChat DevTools**
3. Submit PR to `mini-program`

## 📝 License

MIT License. See [LICENSE](LICENSE).

---

Built with ❤️ for WeChat music learners.
