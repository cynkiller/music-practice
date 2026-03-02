import { Flame, Target, Zap } from 'lucide-react';
import type { Difficulty } from '../types/index.ts';

interface ScoreDisplayProps {
  score: number;
  combo: number;
  level: number;
  difficulty: Difficulty;
  questionsAnswered: number;
  correctAnswers: number;
}

const difficultyColors: Record<Difficulty, string> = {
  easy: 'text-green-400',
  normal: 'text-amber-400',
  hard: 'text-red-400',
};

const difficultyBg: Record<Difficulty, string> = {
  easy: 'bg-green-900/30 border-green-700',
  normal: 'bg-amber-900/30 border-amber-700',
  hard: 'bg-red-900/30 border-red-700',
};

export function ScoreDisplay({
  score,
  combo,
  level,
  difficulty,
  questionsAnswered,
  correctAnswers,
}: ScoreDisplayProps) {
  const accuracy = questionsAnswered > 0
    ? Math.round((correctAnswers / questionsAnswered) * 100)
    : 0;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${difficultyBg[difficulty]}`}>
        <span className={`text-xs font-bold uppercase ${difficultyColors[difficulty]}`}>
          {difficulty}
        </span>
        <span className="text-slate-400 text-xs">Lv.{level}</span>
      </div>

      <div className="flex items-center gap-1.5 text-white">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="font-bold">{score.toLocaleString()}</span>
      </div>

      {combo > 0 && (
        <div className="flex items-center gap-1.5 text-orange-400 animate-pulse">
          <Flame className="w-4 h-4" />
          <span className="font-bold">x{combo}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-slate-400 text-sm">
        <Target className="w-4 h-4" />
        <span>{accuracy}%</span>
        <span className="text-slate-600">({correctAnswers}/{questionsAnswered})</span>
      </div>
    </div>
  );
}
