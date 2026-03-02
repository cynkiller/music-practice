export type Difficulty = 'easy' | 'normal' | 'hard';

export type QuestionType = 'interval' | 'chord';

export interface Interval {
  name: string;
  semitones: number;
  category: 'basic' | 'diatonic' | 'chromatic' | 'compound';
}

export interface ChordType {
  name: string;
  intervals: number[]; // semitones from root
  category: 'triad' | 'seventh' | 'extended' | 'altered';
}

export interface Question {
  id: string;
  type: QuestionType;
  rootNote: string;
  targetName: string; // interval or chord name
  semitones: number[]; // semitones from root for playback
  options: string[];
  difficulty: Difficulty;
  level: number;
}

export interface Answer {
  questionId: string;
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  timestamp: number;
}

export interface GameState {
  status: 'menu' | 'playing' | 'answering' | 'feedback' | 'review' | 'progress';
  difficulty: Difficulty;
  level: number;
  score: number;
  combo: number;
  maxCombo: number;
  currentQuestion: Question | null;
  questionsAnswered: number;
  correctAnswers: number;
  sessionAnswers: Answer[];
}

export interface UserProgress {
  totalScore: number;
  highestLevel: Record<Difficulty, number>;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  answers: Answer[];
  lastPlayed: number;
}

export interface DifficultyConfig {
  intervals: Interval[];
  chords: ChordType[];
  answerOptionCount: number;
  noteDurationMs: number;
  gapMs: number;
  showKeyboardHints: boolean;
}

export interface LevelConfig {
  level: number;
  difficulty: Difficulty;
  intervals: Interval[];
  chords: ChordType[];
  questionsToPass: number;
  accuracyToPass: number;
}
