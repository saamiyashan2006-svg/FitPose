import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Award, Flame, Target, Trophy, Medal, Sunrise, Calendar, TrendingUp,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { WEEKLY_DATA, MONTHLY_DATA, ACHIEVEMENTS, RECENT_SESSIONS } from '@/data/mockData';

const ICONS: Record<string, typeof Award> = { Award, Flame, Target, Trophy, Medal, Sunrise };

const TABS = [
  { id: 'week', label: 'Weekly' },
  { id: 'month', label: 'Monthly' },
] as const;

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-glass">
      <p className="font-bold text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export function ProgressPage() {
  const [tab, setTab] = useState<'week' | 'month'>('week');
  const data: Array<Record<string, string | number>> = tab === 'week' ? WEEKLY_DATA : MONTHLY_DATA;

  // streak calendar (last 28 days)
  const days = Array.from({ length: 28 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - i));
    const active = [1, 2, 3, 5, 6, 8, 9, 10, 12, 14, 15, 17, 19, 20, 22, 25, 26].includes(i);
    return { date, active };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white">Your Progress</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track your recovery journey over time.</p>
      </div>

      {/* toggle */}
      <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800/60">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === t.id ? 'bg-white text-brand-600 shadow dark:bg-slate-700 dark:text-cyan-300' : 'text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Sessions & Calories</h3>
            <TrendingUp className="h-5 w-5 text-brand-500" />
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey={tab === 'week' ? 'day' : 'week'} stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="sessions" name="Sessions" fill="#2470f5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="calories" name="Calories" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Accuracy Trend</h3>
            <Target className="h-5 w-5 text-cyan-500" />
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey={tab === 'week' ? 'day' : 'week'} stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#0891b2" strokeWidth={2.5} fill="url(#accGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* streak calendar + achievements */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Streak Calendar</h3>
            <span className="chip bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
              <Flame className="h-3.5 w-3.5" /> 7 day streak
            </span>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {days.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                className={`aspect-square rounded-lg text-[10px] font-semibold grid place-items-center ${
                  d.active
                    ? 'bg-gradient-to-br from-brand-500 to-cyan-400 text-white shadow-glass'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800/60'
                }`}
                title={d.date.toDateString()}
              >
                {d.date.getDate()}
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Achievement Badges</h3>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a, i) => {
              const Icon = ICONS[a.icon] || Award;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center ${
                    a.unlocked
                      ? 'bg-gradient-to-br from-amber-50 to-brand-50 dark:from-amber-500/10 dark:to-brand-500/10'
                      : 'bg-slate-100/60 dark:bg-slate-800/40 opacity-50'
                  }`}
                >
                  <div className={`grid h-10 w-10 place-items-center rounded-full ${a.unlocked ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{a.name}</p>
                    <p className="text-[10px] text-slate-400">{a.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* exercise history */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Exercise History</h3>
          <Calendar className="h-5 w-5 text-brand-500" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="pb-3 font-semibold">Exercise</th>
                <th className="pb-3 font-semibold">Reps</th>
                <th className="pb-3 font-semibold">Accuracy</th>
                <th className="pb-3 font-semibold">Calories</th>
                <th className="pb-3 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {RECENT_SESSIONS.map((s) => (
                <tr key={s.id} className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-semibold">{s.exerciseName}</td>
                  <td className="py-3">{s.reps}</td>
                  <td className="py-3">
                    <span className={`chip ${s.accuracy >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'}`}>
                      {s.accuracy}%
                    </span>
                  </td>
                  <td className="py-3">{s.calories} kcal</td>
                  <td className="py-3">{Math.floor(s.durationSec / 60)}m {s.durationSec % 60}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
