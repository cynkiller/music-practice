import { useState, useCallback, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { UserProgress, Answer, Difficulty, QuestionType } from '../types/index.ts';

const STORAGE_KEY = 'music-practice-progress';

function getDefaultProgress(): UserProgress {
  return {
    totalScore: 0,
    highestLevel: { easy: 1, normal: 11, hard: 26 },
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    answers: [],
    lastPlayed: Date.now(),
  };
}

function loadProgress(): UserProgress {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as UserProgress;
    }
  } catch {
    // ignore errors
  }
  return getDefaultProgress();
}

function saveProgress(progress: UserProgress) {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore errors
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const recordAnswer = useCallback((answer: Answer) => {
    setProgress(prev => ({
      ...prev,
      totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
      totalCorrect: prev.totalCorrect + (answer.isCorrect ? 1 : 0),
      answers: [...prev.answers.slice(-499), answer],
      lastPlayed: Date.now(),
    }));
  }, []);

  const addScore = useCallback((points: number) => {
    setProgress(prev => ({
      ...prev,
      totalScore: prev.totalScore + points,
    }));
  }, []);

  const updateHighestLevel = useCallback((difficulty: Difficulty, level: number) => {
    setProgress(prev => {
      if (level > prev.highestLevel[difficulty]) {
        return {
          ...prev,
          highestLevel: { ...prev.highestLevel, [difficulty]: level },
        };
      }
      return prev;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(getDefaultProgress());
  }, []);

  const getMistakes = useCallback(() => {
    return progress.answers.filter(a => !a.isCorrect);
  }, [progress.answers]);

  const getWeaknesses = useCallback(() => {
    const mistakes = progress.answers.filter(a => !a.isCorrect);
    const counts = new Map<string, { count: number; type: 'interval' | 'chord' }>();
    for (const m of mistakes) {
      const key = m.question.targetName;
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { count: 1, type: m.question.type });
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([name, data]) => ({ name, count: data.count, type: data.type }));
  }, [progress.answers]);

  const getAccuracyOverTime = useCallback((bucketCount = 10) => {
    const answers = progress.answers;
    if (answers.length === 0) return [];
    const bucketSize = Math.max(1, Math.floor(answers.length / bucketCount));
    const buckets = [];
    for (let i = 0; i < answers.length; i += bucketSize) {
      const slice = answers.slice(i, i + bucketSize);
      const correct = slice.filter(a => a.isCorrect).length;
      buckets.push({
        index: buckets.length + 1,
        accuracy: Math.round((correct / slice.length) * 100),
        total: slice.length,
      });
    }
    return buckets;
  }, [progress.answers]);

  const getConfusionPairs = useCallback(() => {
    const mistakes = progress.answers.filter(a => !a.isCorrect);
    const pairCounts = new Map<string, { correct: string; confused: string; count: number; type: QuestionType }>();
    for (const m of mistakes) {
      const key = `${m.correctAnswer}→${m.userAnswer}`;
      const existing = pairCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        pairCounts.set(key, {
          correct: m.correctAnswer,
          confused: m.userAnswer,
          count: 1,
          type: m.question.type,
        });
      }
    }
    return Array.from(pairCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [progress.answers]);

  const getPerItemAccuracy = useCallback(() => {
    const items = new Map<string, { name: string; type: QuestionType; total: number; correct: number }>();
    for (const a of progress.answers) {
      const key = a.question.targetName;
      const existing = items.get(key);
      if (existing) {
        existing.total++;
        if (a.isCorrect) existing.correct++;
      } else {
        items.set(key, {
          name: key,
          type: a.question.type,
          total: 1,
          correct: a.isCorrect ? 1 : 0,
        });
      }
    }
    return Array.from(items.values())
      .map(item => ({
        ...item,
        accuracy: Math.round((item.correct / item.total) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [progress.answers]);

  return {
    progress,
    recordAnswer,
    addScore,
    updateHighestLevel,
    resetProgress,
    getMistakes,
    getWeaknesses,
    getConfusionPairs,
    getPerItemAccuracy,
    getAccuracyOverTime,
  };
}
