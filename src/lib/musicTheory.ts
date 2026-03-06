import type { Interval, ChordType, DifficultyConfig, Difficulty } from '../types/index.ts';

// All intervals
export const INTERVALS: Interval[] = [
  { name: 'Minor 2nd', semitones: 1, category: 'diatonic' },
  { name: 'Major 2nd', semitones: 2, category: 'basic' },
  { name: 'Minor 3rd', semitones: 3, category: 'diatonic' },
  { name: 'Major 3rd', semitones: 4, category: 'basic' },
  { name: 'Perfect 4th', semitones: 5, category: 'basic' },
  { name: 'Tritone', semitones: 6, category: 'diatonic' },
  { name: 'Perfect 5th', semitones: 7, category: 'basic' },
  { name: 'Minor 6th', semitones: 8, category: 'chromatic' },
  { name: 'Major 6th', semitones: 9, category: 'diatonic' },
  { name: 'Minor 7th', semitones: 10, category: 'diatonic' },
  { name: 'Major 7th', semitones: 11, category: 'diatonic' },
  { name: 'Octave', semitones: 12, category: 'basic' },
  { name: 'Minor 9th', semitones: 13, category: 'compound' },
  { name: 'Major 9th', semitones: 14, category: 'compound' },
  { name: 'Minor 10th', semitones: 15, category: 'compound' },
  { name: 'Major 10th', semitones: 16, category: 'compound' },
];

// All chord types
export const CHORD_TYPES: ChordType[] = [
  { name: 'Major', intervals: [0, 4, 7], category: 'triad' },
  { name: 'Minor', intervals: [0, 3, 7], category: 'triad' },
  { name: 'Diminished', intervals: [0, 3, 6], category: 'triad' },
  { name: 'Augmented', intervals: [0, 4, 8], category: 'triad' },
  { name: 'Major 7th', intervals: [0, 4, 7, 11], category: 'seventh' },
  { name: 'Dominant 7th', intervals: [0, 4, 7, 10], category: 'seventh' },
  { name: 'Minor 7th', intervals: [0, 3, 7, 10], category: 'seventh' },
  { name: 'Half-Dim 7th', intervals: [0, 3, 6, 10], category: 'seventh' },
  { name: 'Diminished 7th', intervals: [0, 3, 6, 9], category: 'seventh' },
  { name: 'Major 9th', intervals: [0, 4, 7, 11, 14], category: 'extended' },
  { name: 'Dominant 9th', intervals: [0, 4, 7, 10, 14], category: 'extended' },
  { name: 'Minor 9th', intervals: [0, 3, 7, 10, 14], category: 'extended' },
  { name: 'Dominant 11th', intervals: [0, 4, 7, 10, 14, 17], category: 'extended' },
  { name: 'Dominant 13th', intervals: [0, 4, 7, 10, 14, 21], category: 'extended' },
  { name: 'Alt Dominant', intervals: [0, 4, 6, 10, 13], category: 'altered' },
];

// Notes for root selection
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const BASE_OCTAVE = 4;

export function noteFromSemitone(rootNote: string, semitones: number): string {
  const rootIndex = NOTES.indexOf(rootNote.replace(/\d+/, ''));
  const octaveStr = rootNote.match(/\d+/);
  const rootOctave = octaveStr ? parseInt(octaveStr[0]) : BASE_OCTAVE;
  const totalSemitones = rootIndex + semitones;
  const noteIndex = ((totalSemitones % 12) + 12) % 12;
  const octave = rootOctave + Math.floor(totalSemitones / 12);
  return `${NOTES[noteIndex]}${octave}`;
}

// Difficulty configurations
const easyIntervals = INTERVALS.filter(i => i.category === 'basic');
const easyChords = CHORD_TYPES.filter(c => c.name === 'Major' || c.name === 'Minor' || c.name === 'Diminished');

const normalIntervals = INTERVALS.filter(i => i.category === 'basic' || i.category === 'diatonic');
const normalChords = CHORD_TYPES.filter(c => c.category === 'triad' || c.category === 'seventh');

const hardIntervals = INTERVALS;
const hardChords = CHORD_TYPES;

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    intervals: easyIntervals,
    chords: easyChords,
    answerOptionCount: 4,
    noteDurationMs: 1200,
    gapMs: 400,
    showKeyboardHints: true,
  },
  normal: {
    intervals: normalIntervals,
    chords: normalChords,
    answerOptionCount: 6,
    noteDurationMs: 900,
    gapMs: 400,
    showKeyboardHints: false,
  },
  hard: {
    intervals: hardIntervals,
    chords: hardChords,
    answerOptionCount: 8,
    noteDurationMs: 600,
    gapMs: 250,
    showKeyboardHints: false,
  },
};
