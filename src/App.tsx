import { useCallback } from 'react';
import { useAudio } from './hooks/useAudio.ts';
import { useProgress } from './hooks/useProgress.ts';
import { useGameState } from './hooks/useGameState.ts';
import { Header } from './components/Header.tsx';
import { DifficultySelector } from './components/DifficultySelector.tsx';
import { GameBoard } from './components/GameBoard.tsx';
import { ReviewPanel } from './components/ReviewPanel.tsx';
import { ProgressCharts } from './components/ProgressCharts.tsx';
import type { Answer, Difficulty } from './types/index.ts';

function App() {
  const { playInterval, playChord, playArpeggio } = useAudio();
  const {
    progress,
    recordAnswer,
    addScore,
    updateHighestLevel,
    getMistakes,
    getWeaknesses,
    getAccuracyOverTime,
  } = useProgress();

  const handleAnswer = useCallback(
    (answer: Answer) => {
      recordAnswer(answer);
    },
    [recordAnswer]
  );

  const handleScoreAdd = useCallback(
    (points: number) => {
      addScore(points);
    },
    [addScore]
  );

  const handleLevelUp = useCallback(
    (difficulty: Difficulty, level: number) => {
      updateHighestLevel(difficulty, level);
    },
    [updateHighestLevel]
  );

  const {
    state,
    startGame,
    startAnswering,
    submitAnswer,
    nextQuestion,
    goToMenu,
    goToReview,
    goToProgress,
  } = useGameState(handleAnswer, handleScoreAdd, handleLevelUp);

  const handlePlaySound = useCallback(() => {
    if (!state.currentQuestion) return;
    const q = state.currentQuestion;
    if (q.type === 'interval') {
      playInterval(q.rootNote, q.semitones[1], state.difficulty);
    } else {
      playChord(q.rootNote, q.semitones, state.difficulty);
    }
  }, [state.currentQuestion, state.difficulty, playInterval, playChord]);

  const handlePlayArpeggio = useCallback(() => {
    if (!state.currentQuestion) return;
    const q = state.currentQuestion;
    playArpeggio(q.rootNote, q.semitones, state.difficulty);
  }, [state.currentQuestion, state.difficulty, playArpeggio]);

  const handleNavigate = useCallback(
    (view: 'menu' | 'review' | 'progress') => {
      if (view === 'menu') goToMenu();
      else if (view === 'review') goToReview();
      else goToProgress();
    },
    [goToMenu, goToReview, goToProgress]
  );

  const handleReplay = useCallback(
    (answer: Answer) => {
      const q = answer.question;
      if (q.type === 'interval') {
        playInterval(q.rootNote, q.semitones[1], q.difficulty);
      } else {
        playChord(q.rootNote, q.semitones, q.difficulty);
      }
    },
    [playInterval, playChord]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header
        currentView={state.status}
        onNavigate={handleNavigate}
        totalScore={progress.totalScore}
      />

      <main className="flex-1 px-4 py-8">
        {state.status === 'menu' && (
          <DifficultySelector
            onSelect={startGame}
            highestLevel={progress.highestLevel}
          />
        )}

        {(state.status === 'playing' ||
          state.status === 'answering' ||
          state.status === 'feedback') && (
          <GameBoard
            state={state}
            onPlaySound={handlePlaySound}
            onPlayArpeggio={handlePlayArpeggio}
            onStartAnswering={startAnswering}
            onAnswer={submitAnswer}
            onNext={nextQuestion}
            onQuit={goToMenu}
          />
        )}

        {state.status === 'review' && (
          <ReviewPanel
            mistakes={getMistakes()}
            weaknesses={getWeaknesses()}
            onReplay={handleReplay}
          />
        )}

        {state.status === 'progress' && (
          <ProgressCharts
            progress={progress}
            accuracyOverTime={getAccuracyOverTime()}
            weaknesses={getWeaknesses()}
          />
        )}
      </main>
    </div>
  );
}

export default App;
