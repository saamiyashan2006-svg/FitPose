import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Timer, Target, Play, Filter } from 'lucide-react';
import { EXERCISES } from '@/data/mockData';
import type { BodyPart, Difficulty } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';

const BODY_PARTS: (BodyPart | 'All')[] = ['All', 'Full Body', 'Legs', 'Shoulders', 'Arms', 'Neck', 'Hips'];
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
};

export function ExerciseLibraryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [part, setPart] = useState<BodyPart | 'All'>('All');

  const filtered = useMemo(() => {
    return EXERCISES.filter((e) => {
      const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase()) || e.description.toLowerCase().includes(query.toLowerCase());
      const matchesPart = part === 'All' || e.bodyPart === part;
      return matchesQuery && matchesPart;
    });
  }, [query, part]);

  const startExercise = (id: string) => {
    navigate(`/app/session?exercise=${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white">Exercise Library</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a guided exercise. AI will track your form in real time.</p>
      </div>

      {/* search + filters */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="input-field pl-12"
          />
        </div>
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="h-4 w-4 shrink-0 text-slate-400" />
          {BODY_PARTS.map((bp) => (
            <button
              key={bp}
              onClick={() => setPart(bp)}
              className={`chip shrink-0 transition ${
                part === bp
                  ? 'bg-brand-600 text-white shadow-glass'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              {bp}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex, i) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <GlassCard hover className="flex h-full flex-col overflow-hidden p-0">
              {/* image placeholder */}
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-brand-500 via-brand-400 to-cyan-400">
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                  animate={{ backgroundPosition: ['0px 0px', '24px 24px'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 grid place-items-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-white"
                  >
                    <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none">
                      <circle cx="32" cy="16" r="6" fill="white" />
                      <path d="M32 22v18M32 28l-10 6M32 28l10 6M32 40l-6 12M32 40l6 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                </div>
                <span className={`absolute left-3 top-3 chip ${DIFFICULTY_COLOR[ex.difficulty]}`}>{ex.difficulty}</span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">{ex.name}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-500 dark:text-slate-400">{ex.description}</p>
                <div className="mt-3 flex gap-3 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5" /> {Math.floor(ex.durationSec / 60)} min</span>
                  <span className="inline-flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {ex.targetReps} reps</span>
                  <span className="inline-flex items-center gap-1">{ex.bodyPart}</span>
                </div>
                <button onClick={() => startExercise(ex.id)} className="btn-primary mt-4 w-full">
                  <Play className="h-4 w-4" /> Start Exercise
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card grid place-items-center p-12 text-center">
          <Search className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-500">No exercises found</p>
          <p className="text-sm text-slate-400">Try a different search or filter.</p>
        </div>
      )}
    </div>
  );
}
