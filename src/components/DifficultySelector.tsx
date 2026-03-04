import { Shield, Swords, Skull } from 'lucide-react';
import type { Difficulty } from '../types/index.ts';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty, level: number) => void;
  highestLevel: Record<Difficulty, number>;
}

const difficulties: {
  id: Difficulty;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
  bg: string;
  levels: string;
}[] = [
  {
    id: 'easy',
    label: 'Easy',
    description: 'Basic intervals & triads. Visual hints on keyboard.',
    icon: Shield,
    color: 'text-green-400',
    bg: 'from-green-900/40 to-green-800/20 border-green-700 hover:border-green-500',
    levels: '1–10',
  },
  {
    id: 'normal',
    label: 'Normal',
    description: 'All diatonic intervals & seventh chords. No hints.',
    icon: Swords,
    color: 'text-amber-400',
    bg: 'from-amber-900/40 to-amber-800/20 border-amber-700 hover:border-amber-500',
    levels: '11–25',
  },
  {
    id: 'hard',
    label: 'Hard',
    description: 'Extended chords, altered dominants, compound intervals.',
    icon: Skull,
    color: 'text-red-400',
    bg: 'from-red-900/40 to-red-800/20 border-red-700 hover:border-red-500',
    levels: '26–50',
  },
];

export function DifficultySelector({ onSelect, highestLevel }: DifficultySelectorProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Choose Difficulty</h2>
        <p className="text-slate-400 text-center text-sm">
          Train your ear with intervals and chords
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {difficulties.map(d => {
          const Icon = d.icon;
          const level = highestLevel[d.id];
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id, level)}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 bg-gradient-to-b ${d.bg} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
            >
              <Icon className={`w-10 h-10 ${d.color}`} />
              <span className={`text-lg font-bold ${d.color}`}>{d.label}</span>
              <span className="text-slate-400 text-xs text-center">{d.description}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-slate-500 text-xs">Levels {d.levels}</span>
                <span className="text-xs text-violet-400 font-medium">Lv.{level}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
