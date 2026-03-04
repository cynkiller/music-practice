import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Award, Clock } from 'lucide-react';
import type { UserProgress } from '../types/index.ts';

interface ProgressChartsProps {
  progress: UserProgress;
  accuracyOverTime: { index: number; accuracy: number; total: number }[];
  weaknesses: { name: string; count: number }[];
}

export function ProgressCharts({
  progress,
  accuracyOverTime,
  weaknesses,
}: ProgressChartsProps) {
  const overallAccuracy =
    progress.totalQuestionsAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalQuestionsAnswered) * 100)
      : 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Award className="w-5 h-5 text-violet-400" />}
          label="Total Score"
          value={progress.totalScore.toLocaleString()}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          label="Accuracy"
          value={`${overallAccuracy}%`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          label="Questions"
          value={String(progress.totalQuestionsAnswered)}
        />
        <StatCard
          icon={<Award className="w-5 h-5 text-blue-400" />}
          label="Correct"
          value={String(progress.totalCorrect)}
        />
      </div>

      {/* Highest levels */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">Highest Levels</h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-medium text-sm">Easy:</span>
            <span className="text-white font-bold">Lv.{progress.highestLevel.easy}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-medium text-sm">Normal:</span>
            <span className="text-white font-bold">Lv.{progress.highestLevel.normal}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-medium text-sm">Hard:</span>
            <span className="text-white font-bold">Lv.{progress.highestLevel.hard}</span>
          </div>
        </div>
      </section>

      {/* Accuracy over time chart */}
      {accuracyOverTime.length > 1 && (
        <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={accuracyOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="index"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Session', position: 'insideBottom', offset: -5, fill: '#64748b' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                domain={[0, 100]}
                label={{ value: '%', position: 'insideLeft', fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Weakness bar chart */}
      {weaknesses.length > 0 && (
        <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Most Missed</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weaknesses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {progress.totalQuestionsAnswered === 0 && (
        <div className="text-center text-slate-500 py-12">
          <p className="text-lg">No data yet</p>
          <p className="text-sm mt-1">Start playing to see your progress!</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-slate-400 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
  );
}
