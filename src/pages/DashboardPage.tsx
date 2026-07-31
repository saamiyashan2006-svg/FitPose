import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame, Dumbbell, Timer, Target, TrendingUp, PlayCircle,
  CalendarCheck, Zap, ChevronRight, Award,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/firestoreService';
import { EXERCISES, RECENT_SESSIONS } from '@/data/mockData';
import type { SessionRecord } from '@/types';

const DIFFICULTY_COLOR = {
  Beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionRecord[]>(RECENT_SESSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    db.getSessions(user.uid).then((s) => {
      setSessions(s);
      setLoading(false);
    });
  }, [user]);

  const todays = EXERCISES[0];
  const totalSessions = sessions.length;
  const totalReps = sessions.reduce((a, s) => a + s.reps, 0);
  const avgAccuracy = Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / Math.max(sessions.length, 1));
  const calories = sessions.reduce((a, s) => a + s.calories, 0);
  const streak = 7;

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-slate-800 dark:text-white"
        >
          Welcome back, {firstName} 👋
        </motion.h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here's your recovery snapshot for today.</p>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Dumbbell} label="Total Sessions" value={totalSessions} accent="brand" delay={0} />
        <StatCard icon={Flame} label="Daily Streak" value={streak} suffix=" days" accent="rose" delay={0.05} />
        <StatCard icon={Zap} label="Calories Burned" value={calories.toFixed(1)} suffix=" kcal" accent="amber" delay={0.1} />
        <StatCard icon={Target} label="Avg Accuracy" value={avgAccuracy} suffix="%" accent="cyan" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* today's exercise */}
        <GlassCard className="lg:col-span-2 p-6" hover>
          <div className="flex items-center justify-between">
            <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">Today's Exercise</span>
            <CalendarCheck className="h-5 w-5 text-brand-500" />
          </div>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-cyan-400 text-white shadow-glass">
              <Dumbbell className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold text-slate-800 dark:text-white">{todays.name}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{todays.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`chip ${DIFFICULTY_COLOR[todays.difficulty]}`}>{todays.difficulty}</span>
                <span className="chip bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  <Timer className="h-3.5 w-3.5" /> {Math.floor(todays.durationSec / 60)} min
                </span>
                <span className="chip bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  <Target className="h-3.5 w-3.5" /> {todays.targetReps} reps
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/session')}
            className="btn-primary mt-6 w-full sm:w-auto"
          >
            <PlayCircle className="h-5 w-5" /> Continue Session
          </button>
        </GlassCard>

        {/* weekly progress mini */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Weekly Progress</h3>
            <TrendingUp className="h-5 w-5 text-cyan-500" />
          </div>
          <div className="mt-6 space-y-3">
            {[
              { label: 'Sessions', value: 13, max: 20 },
              { label: 'Reps', value: totalReps, max: 100 },
              { label: 'Accuracy', value: avgAccuracy, max: 100 },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>{row.label}</span>
                  <span>{row.value}/{row.max}</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (row.value / row.max) * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* recent activity */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Recent Activity</h3>
          <button onClick={() => navigate('/app/progress')} className="text-sm font-semibold text-brand-600 hover:underline flex items-center">
            View all <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {loading ? (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((i) => <div key={i} className="shimmer h-14 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />)}
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100 dark:divide-white/5">
            {sessions.slice(0, 4).map((s) => {
              const ex = EXERCISES.find((e) => e.id === s.exerciseId);
              return (
                <div key={s.id} className="flex items-center gap-4 py-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                    {ex ? <Dumbbell className="h-5 w-5" /> : <Award className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-slate-700 dark:text-slate-200">{s.exerciseName}</p>
                    <p className="text-xs text-slate-400">{s.reps} reps · {s.accuracy}% accuracy · {s.calories} kcal</p>
                  </div>
                  <span className="text-xs text-slate-400">{timeAgo(s.date)}</span>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
