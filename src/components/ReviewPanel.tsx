import { Volume2, AlertTriangle } from 'lucide-react';
import type { Answer } from '../types/index.ts';

interface ReviewPanelProps {
  mistakes: Answer[];
  weaknesses: { name: string; count: number }[];
  onReplay: (answer: Answer) => void;
}

export function ReviewPanel({ mistakes, weaknesses, onReplay }: ReviewPanelProps) {
  const recentMistakes = [...mistakes].reverse().slice(0, 50);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      {/* Weakness summary */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Areas to Improve
        </h2>
        {weaknesses.length === 0 ? (
          <p className="text-slate-500 text-sm">No mistakes recorded yet. Start playing!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {weaknesses.map(w => (
              <div
                key={w.name}
                className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <span className="text-white text-sm font-medium">{w.name}</span>
                <span className="text-red-400 text-xs font-bold">{w.count}x</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mistake history */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Recent Mistakes</h2>
        {recentMistakes.length === 0 ? (
          <p className="text-slate-500 text-sm">No mistakes yet!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentMistakes.map((m, i) => (
              <div
                key={`${m.questionId}-${i}`}
                className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase text-slate-500 font-medium">
                      {m.question.type}
                    </span>
                    <span className="text-xs text-slate-600">
                      {m.question.difficulty} · Lv.{m.question.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-red-400 line-through">{m.userAnswer}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-emerald-400 font-medium">{m.correctAnswer}</span>
                  </div>
                </div>
                <button
                  onClick={() => onReplay(m)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Replay
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
