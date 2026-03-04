import { useEffect, useRef } from 'react';
import { Play, ArrowRight, Volume2, ListMusic } from 'lucide-react';
import type { GameState } from '../types/index.ts';
import { ScoreDisplay } from './ScoreDisplay.tsx';
import { AnswerOptions } from './AnswerOptions.tsx';
import { PianoKeyboard, getHighlightedNotes } from './PianoKeyboard.tsx';
import { DIFFICULTY_CONFIGS } from '../lib/musicTheory.ts';

interface GameBoardProps {
  state: GameState;
  onPlaySound: () => void;
  onPlayArpeggio: () => void;
  onStartAnswering: () => void;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onQuit: () => void;
}

export function GameBoard({
  state,
  onPlaySound,
  onPlayArpeggio,
  onStartAnswering,
  onAnswer,
  onNext,
  onQuit,
}: GameBoardProps) {
  const { currentQuestion, status, difficulty } = state;
  const config = DIFFICULTY_CONFIGS[difficulty];
  const showHints = config.showKeyboardHints;

  if (!currentQuestion) return null;

  const lastAnswer = state.sessionAnswers[state.sessionAnswers.length - 1];
  const hasAutoPlayedRef = useRef<string | null>(null);

  // Auto-play arpeggio when chord question is answered wrong
  useEffect(() => {
    if (
      status === 'feedback' &&
      lastAnswer &&
      !lastAnswer.isCorrect &&
      currentQuestion.type === 'chord' &&
      hasAutoPlayedRef.current !== currentQuestion.id
    ) {
      hasAutoPlayedRef.current = currentQuestion.id;
      const timer = setTimeout(() => onPlayArpeggio(), 600);
      return () => clearTimeout(timer);
    }
  }, [status, lastAnswer, currentQuestion, onPlayArpeggio]);
  const isFeedback = status === 'feedback';
  const highlightedNotes =
    (showHints && status === 'answering') || isFeedback
      ? getHighlightedNotes(currentQuestion.rootNote, currentQuestion.semitones)
      : [];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Score bar */}
      <div className="w-full flex items-center justify-between">
        <ScoreDisplay
          score={state.score}
          combo={state.combo}
          level={state.level}
          difficulty={state.difficulty}
          questionsAnswered={state.questionsAnswered}
          correctAnswers={state.correctAnswers}
        />
        <button
          onClick={onQuit}
          className="text-slate-500 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Quit
        </button>
      </div>

      {/* Question type label */}
      <div className="text-center">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
          Identify the {currentQuestion.type}
        </span>
      </div>

      {/* Piano keyboard */}
      <PianoKeyboard
        highlightedNotes={highlightedNotes}
        showHints={showHints || isFeedback}
      />

      {/* Play / Listen controls */}
      <div className="flex items-center gap-3">
        {status === 'playing' && (
          <button
            onClick={() => {
              onPlaySound();
              onStartAnswering();
            }}
            onTouchStart={() => {
              onPlaySound();
              onStartAnswering();
            }}
            className="flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer text-lg"
          >
            <Play className="w-6 h-6" fill="currentColor" />
            Play Sound
          </button>
        )}

        {(status === 'answering' || status === 'feedback') && (
          <>
            <button
              onClick={onPlaySound}
              onTouchStart={onPlaySound}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer text-sm"
            >
              <Volume2 className="w-4 h-4" />
              Replay
            </button>
            {status === 'feedback' && currentQuestion.type === 'chord' && (
              <button
                onClick={onPlayArpeggio}
                onTouchStart={onPlayArpeggio}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer text-sm"
              >
                <ListMusic className="w-4 h-4" />
                Play Notes
              </button>
            )}
          </>
        )}
      </div>

      {/* Answer options */}
      {(status === 'answering' || status === 'feedback') && (
        <AnswerOptions
          options={currentQuestion.options}
          onSelect={onAnswer}
          disabled={status === 'feedback'}
          correctAnswer={status === 'feedback' ? currentQuestion.targetName : undefined}
          userAnswer={status === 'feedback' ? lastAnswer?.userAnswer : undefined}
          showResult={status === 'feedback'}
        />
      )}

      {/* Feedback */}
      {status === 'feedback' && lastAnswer && (
        <div className="flex flex-col items-center gap-4">
          <div
            className={`text-center px-6 py-3 rounded-xl ${
              lastAnswer.isCorrect
                ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700'
                : 'bg-red-900/30 text-red-300 border border-red-700'
            }`}
          >
            {lastAnswer.isCorrect ? (
              <span className="font-bold">Correct! +{calculateLastPoints(state)}</span>
            ) : (
              <span>
                The answer was <strong>{currentQuestion.targetName}</strong>
              </span>
            )}
          </div>

          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}

function calculateLastPoints(state: GameState): string {
  if (state.sessionAnswers.length < 2) return String(state.score);
  const totalCorrect = state.sessionAnswers.filter(a => a.isCorrect).length;
  if (totalCorrect === 0) return '0';
  const avgPoints = Math.round(state.score / totalCorrect);
  return String(avgPoints);
}
