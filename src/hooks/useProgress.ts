import { useState, useCallback, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { UserProgress, Answer, Difficulty } from '../types/index.ts';

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
    const counts = new Map<string, number>();
    for (const m of mistakes) {
      const key = m.question.targetName;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
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

  return {
    progress,
    recordAnswer,
    addScore,
    updateHighestLevel,
    resetProgress,
    getMistakes,
    getWeaknesses,
    getAccuracyOverTime,
  };
}
