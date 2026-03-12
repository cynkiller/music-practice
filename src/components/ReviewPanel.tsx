import { useState } from 'react';
import { Volume2, AlertTriangle, Target, Shuffle } from 'lucide-react';
import type { Answer, QuestionType, Difficulty } from '../types/index.ts';

type FilterTab = 'all' | 'interval' | 'chord';

interface ConfusionPair {
  correct: string;
  confused: string;
  count: number;
  type: QuestionType;
}

interface ItemAccuracy {
  name: string;
  type: QuestionType;
  total: number;
  correct: number;
  accuracy: number;
}

interface ReviewPanelProps {
  mistakes: Answer[];
  weaknesses: { name: string; count: number; type: QuestionType }[];
  confusionPairs: ConfusionPair[];
  perItemAccuracy: ItemAccuracy[];
  onReplay: (answer: Answer) => void;
  onStartPractice: (difficulty: Difficulty, items: { name: string; type: QuestionType; count: number }[]) => void;
}

export function ReviewPanel({
  mistakes,
  weaknesses,
  confusionPairs,
  perItemAccuracy,
  onReplay,
  onStartPractice,
}: ReviewPanelProps) {
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredMistakes = [...mistakes].reverse().slice(0, 50)
    .filter(m => filter === 'all' || m.question.type === filter);

  const filteredWeaknesses = weaknesses
    .filter(w => filter === 'all' || w.type === filter);

  const filteredConfusions = confusionPairs
    .filter(c => filter === 'all' || c.type === filter);

  const filteredAccuracy = perItemAccuracy
    .filter(a => filter === 'all' || a.type === filter);

  const hasWeaknesses = weaknesses.length > 0;

  const handleStartPractice = () => {
    if (!hasWeaknesses) return;
    // Determine best difficulty from the most recent mistakes
    const recentDifficulty = mistakes.length > 0
      ? mistakes[mistakes.length - 1].question.difficulty
      : 'easy' as Difficulty;
    onStartPractice(recentDifficulty, weaknesses);
  };

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'interval', label: 'Intervals' },
    { id: 'chord', label: 'Chords' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Practice Weaknesses CTA */}
      {hasWeaknesses && (
        <button
          onClick={handleStartPractice}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-lg"
        >
          <Target className="w-6 h-6" />
          Practice Weaknesses
        </button>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Per-item accuracy */}
      <section>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-400" />
          Accuracy by Item
        </h2>
        {filteredAccuracy.length === 0 ? (
          <p className="text-slate-500 text-sm">No data yet. Start playing!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredAccuracy.map(item => (
              <div
                key={item.name}
                className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{item.name}</span>
                    <span className="text-xs uppercase text-slate-500">{item.type}</span>
                  </div>
                  <span className={`text-sm font-bold ${
                    item.accuracy >= 80 ? 'text-emerald-400' :
                    item.accuracy >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {item.accuracy}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.accuracy >= 80 ? 'bg-emerald-500' :
                      item.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {item.correct}/{item.total} correct
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confusion pairs */}
      {filteredConfusions.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-amber-400" />
            Common Confusions
          </h2>
          <div className="flex flex-col gap-2">
            {filteredConfusions.map((pair, i) => (
              <div
                key={`${pair.correct}-${pair.confused}-${i}`}
                className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-400 font-medium">{pair.correct}</span>
                  <span className="text-slate-500">mistaken for</span>
                  <span className="text-red-400 font-medium">{pair.confused}</span>
                </div>
                <span className="text-slate-400 text-xs font-bold">{pair.count}x</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Weakness summary */}
      <section>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Areas to Improve
        </h2>
        {filteredWeaknesses.length === 0 ? (
          <p className="text-slate-500 text-sm">No mistakes recorded yet. Start playing!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredWeaknesses.map(w => (
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
        <h2 className="text-lg font-bold text-white mb-3">Recent Mistakes</h2>
        {filteredMistakes.length === 0 ? (
          <p className="text-slate-500 text-sm">No mistakes yet!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredMistakes.map((m, i) => (
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
