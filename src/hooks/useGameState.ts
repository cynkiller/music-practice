import { useState, useCallback, useRef } from 'react';
import type { GameState, Difficulty, Answer } from '../types/index.ts';
import { generateQuestion, generatePracticeQuestion } from '../lib/questionGenerator.ts';
import type { PracticeFocus } from '../lib/questionGenerator.ts';
import { calculateScore, getLevelUpThreshold } from '../lib/scoring.ts';

type GameStatus = GameState['status'];

const initialState: GameState = {
  status: 'menu',
  difficulty: 'easy',
  level: 1,
  score: 0,
  combo: 0,
  maxCombo: 0,
  currentQuestion: null,
  questionsAnswered: 0,
  correctAnswers: 0,
  sessionAnswers: [],
};

export function useGameState(
  onAnswer: (answer: Answer) => void,
  onScoreAdd: (points: number) => void,
  onLevelUp: (difficulty: Difficulty, level: number) => void
) {
  const [state, setState] = useState<GameState>(initialState);
  const answerStartRef = useRef<number>(0);
  const levelScoreRef = useRef<number>(0);
  const practiceItemsRef = useRef<PracticeFocus[] | null>(null);

  const setStatus = useCallback((status: GameStatus) => {
    setState(prev => ({ ...prev, status }));
  }, []);

  const startGame = useCallback((difficulty: Difficulty, level: number) => {
    practiceItemsRef.current = null;
    const question = generateQuestion(difficulty, level);
    levelScoreRef.current = 0;
    setState({
      ...initialState,
      status: 'playing',
      difficulty,
      level,
      currentQuestion: question,
    });
  }, []);

  const startPractice = useCallback((difficulty: Difficulty, focusItems: PracticeFocus[]) => {
    practiceItemsRef.current = focusItems;
    const question = generatePracticeQuestion(difficulty, focusItems);
    levelScoreRef.current = 0;
    setState({
      ...initialState,
      status: 'playing',
      difficulty,
      level: 0,
      currentQuestion: question,
    });
  }, []);

  const startAnswering = useCallback(() => {
    answerStartRef.current = Date.now();
    setState(prev => ({ ...prev, status: 'answering' }));
  }, []);

  const submitAnswer = useCallback(
    (userAnswer: string) => {
      setState(prev => {
        if (!prev.currentQuestion) return prev;

        const responseTimeMs = Date.now() - answerStartRef.current;
        const isCorrect = userAnswer === prev.currentQuestion.targetName;

        const answer: Answer = {
          questionId: prev.currentQuestion.id,
          question: prev.currentQuestion,
          userAnswer,
          correctAnswer: prev.currentQuestion.targetName,
          isCorrect,
          responseTimeMs,
          timestamp: Date.now(),
        };

        const newCombo = isCorrect ? prev.combo + 1 : 0;
        const points = isCorrect
          ? calculateScore(prev.difficulty, prev.combo, responseTimeMs)
          : 0;

        levelScoreRef.current += points;

        // Fire callbacks
        onAnswer(answer);
        if (points > 0) onScoreAdd(points);

        return {
          ...prev,
          status: 'feedback',
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          score: prev.score + points,
          questionsAnswered: prev.questionsAnswered + 1,
          correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
          sessionAnswers: [...prev.sessionAnswers, answer],
        };
      });
    },
    [onAnswer, onScoreAdd]
  );

  const nextQuestion = useCallback(() => {
    setState(prev => {
      // Practice mode: no level-ups, just generate next practice question
      if (practiceItemsRef.current) {
        const question = generatePracticeQuestion(
          prev.difficulty,
          practiceItemsRef.current
        );
        return { ...prev, status: 'playing', currentQuestion: question };
      }

      const threshold = getLevelUpThreshold(prev.level);
      let newLevel = prev.level;

      if (levelScoreRef.current >= threshold) {
        newLevel = prev.level + 1;
        levelScoreRef.current = 0;
        onLevelUp(prev.difficulty, newLevel);
      }

      const question = generateQuestion(
        prev.difficulty,
        newLevel,
        prev.sessionAnswers
      );

      return {
        ...prev,
        status: 'playing',
        level: newLevel,
        currentQuestion: question,
      };
    });
  }, [onLevelUp]);

  const isPracticeMode = practiceItemsRef.current !== null;

  const goToMenu = useCallback(() => {
    practiceItemsRef.current = null;
    setState(prev => ({ ...prev, status: 'menu', currentQuestion: null }));
  }, []);

  const goToReview = useCallback(() => {
    practiceItemsRef.current = null;
    setState(prev => ({ ...prev, status: 'review' }));
  }, []);

  const goToProgress = useCallback(() => {
    setState(prev => ({ ...prev, status: 'progress' }));
  }, []);

  return {
    state,
    isPracticeMode,
    setStatus,
    startGame,
    startPractice,
    startAnswering,
    submitAnswer,
    nextQuestion,
    goToMenu,
    goToReview,
    goToProgress,
  };
}
