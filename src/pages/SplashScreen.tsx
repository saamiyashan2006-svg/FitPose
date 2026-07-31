import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Activity } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* animated background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl"
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-300/40 blur-3xl"
          animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="animate-float"
        >
          <Logo size={88} withText={false} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 font-display text-5xl font-extrabold tracking-tight sm:text-6xl"
        >
          Fit<span className="text-gradient">Pose</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-4 max-w-md text-lg font-medium text-slate-500 dark:text-slate-300"
        >
          Your AI Physiotherapy Assistant
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <button onClick={() => navigate('/auth/login')} className="btn-primary group px-8 py-4 text-base">
            Get Started
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </button>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-cyan-500" /> Real-time pose AI</span>
            <span className="inline-flex items-center gap-1.5"><Activity className="h-4 w-4 text-brand-500" /> Rep & form tracking</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Private on-device</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
