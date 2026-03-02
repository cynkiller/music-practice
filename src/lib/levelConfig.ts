import type { LevelConfig, Difficulty } from '../types/index.ts';
import { INTERVALS, CHORD_TYPES } from './musicTheory.ts';

function getIntervalsByNames(names: string[]) {
  return INTERVALS.filter(i => names.includes(i.name));
}

function getChordsByNames(names: string[]) {
  return CHORD_TYPES.filter(c => names.includes(c.name));
}

const EASY_LEVELS: LevelConfig[] = [
  // Levels 1-3: Only Major intervals and Major/Minor triads
  ...([1, 2, 3] as const).map(level => ({
    level,
    difficulty: 'easy' as Difficulty,
    intervals: getIntervalsByNames(['Major 2nd', 'Major 3rd', 'Perfect 5th']),
    chords: getChordsByNames(['Major', 'Minor']),
    questionsToPass: 8,
    accuracyToPass: 0.6,
  })),
  // Levels 4-6: Add Perfect intervals, Diminished triads
  ...([4, 5, 6] as const).map(level => ({
    level,
    difficulty: 'easy' as Difficulty,
    intervals: getIntervalsByNames(['Major 2nd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th']),
    chords: getChordsByNames(['Major', 'Minor', 'Diminished']),
    questionsToPass: 10,
    accuracyToPass: 0.65,
  })),
  // Levels 7-8: Introduce Octave
  ...([7, 8] as const).map(level => ({
    level,
    difficulty: 'easy' as Difficulty,
    intervals: getIntervalsByNames(['Major 2nd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Octave']),
    chords: getChordsByNames(['Major', 'Minor', 'Diminished']),
    questionsToPass: 10,
    accuracyToPass: 0.7,
  })),
  // Levels 9-10: All easy
  ...([9, 10] as const).map(level => ({
    level,
    difficulty: 'easy' as Difficulty,
    intervals: getIntervalsByNames(['Major 2nd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Octave']),
    chords: getChordsByNames(['Major', 'Minor', 'Diminished']),
    questionsToPass: 12,
    accuracyToPass: 0.75,
  })),
];

const NORMAL_LEVELS: LevelConfig[] = [
  // Levels 11-15: All diatonic intervals, seventh chord basics
  ...([11, 12, 13, 14, 15] as const).map(level => ({
    level,
    difficulty: 'normal' as Difficulty,
    intervals: getIntervalsByNames([
      'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd',
      'Perfect 4th', 'Tritone', 'Perfect 5th', 'Major 6th',
      'Minor 7th', 'Major 7th', 'Octave',
    ]),
    chords: getChordsByNames(['Major', 'Minor', 'Diminished', 'Augmented', 'Major 7th', 'Dominant 7th', 'Minor 7th']),
    questionsToPass: 12,
    accuracyToPass: 0.65,
  })),
  // Levels 16-20
  ...([16, 17, 18, 19, 20] as const).map(level => ({
    level,
    difficulty: 'normal' as Difficulty,
    intervals: INTERVALS.filter(i => i.category === 'basic' || i.category === 'diatonic'),
    chords: CHORD_TYPES.filter(c => c.category === 'triad' || c.category === 'seventh'),
    questionsToPass: 14,
    accuracyToPass: 0.7,
  })),
  // Levels 21-25
  ...([21, 22, 23, 24, 25] as const).map(level => ({
    level,
    difficulty: 'normal' as Difficulty,
    intervals: INTERVALS.filter(i => i.category !== 'compound'),
    chords: CHORD_TYPES.filter(c => c.category === 'triad' || c.category === 'seventh'),
    questionsToPass: 15,
    accuracyToPass: 0.75,
  })),
];

const HARD_LEVELS: LevelConfig[] = Array.from({ length: 25 }, (_, i) => {
  const level = 26 + i;
  return {
    level,
    difficulty: 'hard' as Difficulty,
    intervals: INTERVALS,
    chords: CHORD_TYPES,
    questionsToPass: 15 + Math.floor(i / 5),
    accuracyToPass: Math.min(0.7 + i * 0.01, 0.9),
  };
});

export const ALL_LEVELS: LevelConfig[] = [...EASY_LEVELS, ...NORMAL_LEVELS, ...HARD_LEVELS];

export function getLevelConfig(level: number): LevelConfig {
  const config = ALL_LEVELS.find(l => l.level === level);
  if (!config) {
    // Default to last level config
    return ALL_LEVELS[ALL_LEVELS.length - 1];
  }
  return config;
}

export function getDifficultyForLevel(level: number): Difficulty {
  if (level <= 10) return 'easy';
  if (level <= 25) return 'normal';
  return 'hard';
}
