import { motion } from 'framer-motion';
import { Activity, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  accent?: 'brand' | 'cyan' | 'emerald' | 'amber' | 'rose';
  delay?: number;
}

const ACCENTS = {
  brand: 'from-brand-500 to-brand-600',
  cyan: 'from-cyan-400 to-cyan-500',
  emerald: 'from-emerald-400 to-emerald-500',
  amber: 'from-amber-400 to-amber-500',
  rose: 'from-rose-400 to-rose-500',
};

export function StatCard({ icon: Icon, label, value, suffix, accent = 'brand', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-800 dark:text-white">
            {value}
            {suffix && <span className="text-base font-medium text-slate-400 ml-0.5">{suffix}</span>}
          </p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${ACCENTS[accent]} text-white shadow-glass`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
        <Activity className="h-3 w-3" />
        <span>Live tracking</span>
      </div>
    </motion.div>
  );
}
