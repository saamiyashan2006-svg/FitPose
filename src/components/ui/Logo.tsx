import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  withText?: boolean;
}

export function Logo({ size = 44, withText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{ width: size, height: size }}
        className="relative grid place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-glow"
      >
        <svg viewBox="0 0 64 64" fill="none" className="h-3/5 w-3/5">
          <path d="M32 12l16 9v18l-16 9-16-9V21l16-9z" stroke="white" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="32" cy="32" r="5" fill="white" />
          <path d="M32 27V19M32 37v8M27 32h-8M37 32h8" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>
      {withText && (
        <span className="font-display text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Fit<span className="text-gradient">Pose</span>
        </span>
      )}
    </div>
  );
}
