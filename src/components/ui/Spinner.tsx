import { motion } from 'framer-motion';

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      className="text-brand-500"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="40 20" strokeLinecap="round" />
    </motion.svg>
  );
}

export function FullScreenLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} />
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 ${className}`} />;
}
