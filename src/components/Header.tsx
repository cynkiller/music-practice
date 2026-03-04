import { Music, BarChart3, ListChecks, Home } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'menu' | 'review' | 'progress') => void;
  totalScore: number;
}

export function Header({ currentView, onNavigate, totalScore }: HeaderProps) {
  const navItems = [
    { id: 'menu' as const, label: 'Play', icon: Home },
    { id: 'review' as const, label: 'Review', icon: ListChecks },
    { id: 'progress' as const, label: 'Progress', icon: BarChart3 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music className="w-7 h-7 text-violet-400" />
          <h1 className="text-xl font-bold text-white">Ear Trainer</h1>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              currentView === item.id ||
              (item.id === 'menu' && (currentView === 'playing' || currentView === 'answering' || currentView === 'feedback'));
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-sm">Score:</span>
          <span className="font-bold text-violet-400">{totalScore.toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
}
