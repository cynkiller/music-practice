import { NOTES, noteFromSemitone } from '../lib/musicTheory.ts';

interface PianoKeyboardProps {
  highlightedNotes?: string[];
  showHints: boolean;
  onNoteClick?: (note: string) => void;
}

const OCTAVES = [3, 4, 5];
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]); // C#, D#, F#, G#, A#

export function PianoKeyboard({ highlightedNotes = [], showHints, onNoteClick }: PianoKeyboardProps) {
  // Parse highlighted notes to get just the note names with octaves
  const highlightSet = new Set(highlightedNotes);

  const keys: { note: string; isBlack: boolean; noteWithOctave: string }[] = [];
  for (const octave of OCTAVES) {
    for (let i = 0; i < 12; i++) {
      keys.push({
        note: NOTES[i],
        isBlack: BLACK_KEYS.has(i),
        noteWithOctave: `${NOTES[i]}${octave}`,
      });
    }
  }

  // Separate white and black keys for rendering
  const whiteKeys = keys.filter(k => !k.isBlack);
  const allKeys = keys;

  // Calculate positions
  const whiteKeyWidth = 100 / whiteKeys.length;

  // Map white key indices
  let whiteIndex = 0;
  const keyPositions = allKeys.map(k => {
    if (!k.isBlack) {
      const pos = { ...k, x: whiteIndex * whiteKeyWidth, width: whiteKeyWidth };
      whiteIndex++;
      return pos;
    } else {
      // Black key sits between previous and next white key
      const pos = {
        ...k,
        x: (whiteIndex - 0.35) * whiteKeyWidth,
        width: whiteKeyWidth * 0.7,
      };
      return pos;
    }
  });

  const isHighlighted = (noteWithOctave: string) =>
    showHints && highlightSet.has(noteWithOctave);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg viewBox="0 0 100 30" className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* White keys first */}
        {keyPositions
          .filter(k => !k.isBlack)
          .map(k => (
            <rect
              key={k.noteWithOctave}
              x={k.x}
              y={0}
              width={k.width - 0.2}
              height={28}
              rx={0.3}
              className={`cursor-pointer transition-colors ${
                isHighlighted(k.noteWithOctave)
                  ? 'fill-violet-400 stroke-violet-500'
                  : 'fill-white stroke-slate-300 hover:fill-slate-100'
              }`}
              strokeWidth={0.15}
              onClick={() => onNoteClick?.(k.noteWithOctave)}
            />
          ))}
        {/* Black keys on top */}
        {keyPositions
          .filter(k => k.isBlack)
          .map(k => (
            <rect
              key={k.noteWithOctave}
              x={k.x}
              y={0}
              width={k.width}
              height={17}
              rx={0.3}
              className={`cursor-pointer transition-colors ${
                isHighlighted(k.noteWithOctave)
                  ? 'fill-violet-500 stroke-violet-600'
                  : 'fill-slate-800 stroke-slate-900 hover:fill-slate-700'
              }`}
              strokeWidth={0.15}
              onClick={() => onNoteClick?.(k.noteWithOctave)}
            />
          ))}
      </svg>
    </div>
  );
}

// Helper to get highlighted notes from a question
export function getHighlightedNotes(rootNote: string, semitones: number[]): string[] {
  return semitones.map(s => noteFromSemitone(rootNote, s));
}
