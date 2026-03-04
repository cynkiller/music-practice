import type { Question, QuestionType, Difficulty, Answer } from '../types/index.ts';
import { NOTES, BASE_OCTAVE, DIFFICULTY_CONFIGS } from './musicTheory.ts';
import { getLevelConfig } from './levelConfig.ts';

let questionCounter = 0;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRoot(): string {
  const note = pickRandom(NOTES);
  return `${note}${BASE_OCTAVE}`;
}

function generateDistractors(
  correctAnswer: string,
  allOptions: string[],
  count: number
): string[] {
  const others = allOptions.filter(o => o !== correctAnswer);
  const selected = shuffle(others).slice(0, count - 1);
  return shuffle([correctAnswer, ...selected]);
}

export function generateQuestion(
  difficulty: Difficulty,
  level: number,
  pastAnswers: Answer[] = []
): Question {
  const levelConfig = getLevelConfig(level);
  const diffConfig = DIFFICULTY_CONFIGS[difficulty];

  // Decide question type: interval or chord
  const type: QuestionType = Math.random() < 0.5 ? 'interval' : 'chord';

  const root = getRandomRoot();

  // Build weakness weights from past answers
  const weaknessMap = new Map<string, number>();
  for (const ans of pastAnswers) {
    if (!ans.isCorrect) {
      const key = ans.question.targetName;
      weaknessMap.set(key, (weaknessMap.get(key) || 0) + 1);
    }
  }

  if (type === 'interval') {
    const available = levelConfig.intervals;
    // Weight towards weak areas
    let pool = [...available];
    for (const [name, count] of weaknessMap) {
      const interval = available.find(i => i.name === name);
      if (interval) {
        for (let i = 0; i < count; i++) pool.push(interval);
      }
    }

    const chosen = pickRandom(pool);
    const allIntervalNames = available.map(i => i.name);
    const options = generateDistractors(
      chosen.name,
      allIntervalNames,
      diffConfig.answerOptionCount
    );

    questionCounter++;
    return {
      id: `q-${Date.now()}-${questionCounter}`,
      type: 'interval',
      rootNote: root,
      targetName: chosen.name,
      semitones: [0, chosen.semitones],
      options,
      difficulty,
      level,
    };
  } else {
    const available = levelConfig.chords;
    let pool = [...available];
    for (const [name, count] of weaknessMap) {
      const chord = available.find(c => c.name === name);
      if (chord) {
        for (let i = 0; i < count; i++) pool.push(chord);
      }
    }

    const chosen = pickRandom(pool);
    const allChordNames = available.map(c => c.name);
    const options = generateDistractors(
      chosen.name,
      allChordNames,
      diffConfig.answerOptionCount
    );

    questionCounter++;
    return {
      id: `q-${Date.now()}-${questionCounter}`,
      type: 'chord',
      rootNote: root,
      targetName: chosen.name,
      semitones: chosen.intervals,
      options,
      difficulty,
      level,
    };
  }
}
