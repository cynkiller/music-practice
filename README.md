<<<<<<< HEAD
# Music Theory Practice Game

A web-based ear training game for practicing music intervals and chord recognition. Features multiple difficulty levels, adaptive learning, and comprehensive progress tracking.

## 🎵 Features

- **Interval Recognition**: Practice identifying musical intervals from minor 2nd to compound intervals
- **Chord Recognition**: Learn to identify triads, sevenths, extended, and altered chords
- **Difficulty Modes**: 
  - Easy (basic intervals & triads with visual hints)
  - Normal (all diatonic intervals & seventh chords)
  - Hard (extended chords, altered dominants, compound intervals)
- **Adaptive Learning**: Questions weighted by your weak areas
- **Progress Tracking**: Detailed analytics, mistake review, and accuracy charts
- **Piano Sounds**: Uses Salamander Grand Piano samples for authentic audio
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd music-practice

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## 🎮 How to Play

1. **Choose Difficulty**: Select Easy, Normal, or Hard mode
2. **Listen**: Click "Play Sound" to hear an interval or chord
3. **Identify**: Select the correct answer from the options
4. **Learn**: See correct notes highlighted on the piano keyboard
5. **Progress**: Level up by meeting accuracy and score thresholds

### Game Mechanics
- **Scoring**: Points based on difficulty, combo streak, and response speed
- **Levels**: 50 progressive levels across all difficulties
- **Mistake Review**: Review wrong answers and replay examples
- **Analytics**: Track accuracy trends and identify weak areas

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React UI components
├── hooks/              # Custom React hooks
├── lib/                # Music theory and game logic
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Key Technologies
- **React 18** with TypeScript
- **Tone.js** for audio synthesis and piano samples
- **TailwindCSS** for styling
- **Recharts** for progress charts
- **Lucide React** for icons

## 📊 Audio System

The game uses the **Salamander Grand Piano** samples via Tone.js:
- Real acoustic piano recordings (A0–C8)
- Automatic pitch shifting for any note
- Supports intervals, chords, and arpeggios
- First load may take 1–2 seconds to download samples

## 🎯 Difficulty Details

### Easy (Levels 1–10)
- **Intervals**: Major 2nd, Major 3rd, Perfect 4th, Perfect 5th, Octave
- **Chords**: Major, Minor, Diminished triads
- **Features**: Visual keyboard hints, 4 answer options

### Normal (Levels 11–25)
- **Intervals**: All diatonic intervals
- **Chords**: All triads and seventh chords
- **Features**: No hints, 6 answer options

### Hard (Levels 26–50)
- **Intervals**: All intervals including compound
- **Chords**: Extended, altered, and complex chords
- **Features**: 8 answer options, faster tempo

## 📈 Progress Features

- **Session Tracking**: Current game score, combo, accuracy
- **Historical Data**: All answers saved locally
- **Weakness Analysis**: Identifies most missed concepts
- **Accuracy Trends**: Visual charts over time
- **Mistake Review**: Replay wrong answers with audio

## 🚀 Deployment

### GitHub Pages
```bash
# Build and deploy to gh-pages branch
npm run deploy
```

Configure GitHub Pages to serve from the `gh-pages` branch.

### Local Build
```bash
npm run build
# Serve the dist/ folder with any static server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎵 Music Theory Reference

- **Intervals**: Distance between two notes measured in semitones
- **Chords**: Three or more notes played simultaneously
- **Triads**: Three-note chords (Major, Minor, Diminished, Augmented)
- **Sevenths**: Four-note chords adding the seventh scale degree
- **Extended**: Ninth, eleventh, and thirteenth chords
- **Altered**: Chords with modified fifths or ninths

## 🔧 Troubleshooting

### Audio Issues
- Ensure browser allows audio playback
- Check volume settings
- Wait for piano samples to load on first use

### Performance
- Clear browser cache if issues persist
- Check network connection for sample loading
- Disable browser extensions that may interfere

---

Built with ❤️ for music learners everywhere.
=======
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
>>>>>>> 4307c28 (Initial commit)
