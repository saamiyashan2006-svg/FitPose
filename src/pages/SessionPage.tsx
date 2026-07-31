import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Square, Camera, Activity, Target, Zap, Timer,
  Volume2, CheckCircle2, AlertTriangle, XCircle, RotateCcw,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PoseDetectionService } from '@/services/PoseDetectionService';
import { EXERCISES } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/firestoreService';
import { useToast } from '@/context/ToastContext';
import type { DetectionResult } from '@/types';

type Phase = 'idle' | 'running' | 'paused' | 'stopped';

const STATUS_STYLE = {
  Good: { color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20', icon: CheckCircle2, label: 'Good posture' },
  Adjusting: { color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20', icon: AlertTriangle, label: 'Adjusting' },
  Poor: { color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/20', icon: XCircle, label: 'Poor form' },
};

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function SessionPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const exerciseId = params.get('exercise') || EXERCISES[0].id;
  const exercise = EXERCISES.find((e) => e.id === exerciseId) || EXERCISES[0];

  const [phase, setPhase] = useState<Phase>('idle');
  const [reps, setReps] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [calories, setCalories] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<DetectionResult['postureStatus']>('Good');
  const [feedback, setFeedback] = useState<{ message: string; type: string }>({ message: 'Ready to begin. Press Start.', type: 'info' });
  const [feedbackLog, setFeedbackLog] = useState<{ message: string; type: string; id: number }[]>([]);
  const [cameraReady, setCameraReady] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    PoseDetectionService.startCamera().then(() => setCameraReady(true));
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const runDetection = async () => {
    const result = await PoseDetectionService.fullDetection(reps, accuracy);
    setReps(result.repCount);
    setAccuracy(result.accuracy);
    setCalories(result.calories);
    setStatus(result.postureStatus);
    if (result.feedback !== feedback.message) {
      setFeedback({ message: result.feedback, type: result.postureStatus });
      setFeedbackLog((log) => [{ message: result.feedback, type: result.postureStatus, id: result.timestamp }, ...log].slice(0, 6));
    }
  };

  const handleStart = async () => {
    setPhase('running');
    setFeedback({ message: 'Session started. Keep moving!', type: 'Good' });
    toast('AI session started', 'success');
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    intervalRef.current = setInterval(runDetection, 700);
  };

  const handlePause = () => {
    setPhase('paused');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setFeedback({ message: 'Paused. Take a breather.', type: 'info' });
  };

  const handleResume = () => {
    setPhase('running');
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    intervalRef.current = setInterval(runDetection, 700);
    setFeedback({ message: 'Resumed. Keep going!', type: 'Good' });
  };

  const handleStop = async () => {
    setPhase('stopped');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    if (user && reps > 0) {
      await db.addSession(user.uid, {
        id: 's_' + Date.now(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        reps,
        accuracy,
        calories,
        durationSec: elapsed,
        date: Date.now(),
      });
      toast('Session saved to your progress', 'success');
    }
    setFeedback({ message: `Session complete! ${reps} reps at ${accuracy}% accuracy.`, type: 'Good' });
  };

  const handleReset = () => {
    setPhase('idle');
    setReps(0);
    setAccuracy(0);
    setCalories(0);
    setElapsed(0);
    setStatus('Good');
    setFeedbackLog([]);
    setFeedback({ message: 'Ready to begin. Press Start.', type: 'info' });
  };

  const StatusIcon = STATUS_STYLE[status].icon;
  const progress = Math.min(100, (reps / exercise.targetReps) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white">AI Workout Session</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{exercise.name} · {exercise.bodyPart}</p>
        </div>
        <button onClick={() => navigate('/app/exercises')} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> Change Exercise
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* camera preview */}
        <GlassCard className="lg:col-span-2 overflow-hidden p-0">
          <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
            {/* camera placeholder gradient */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #0b1f3a, #0a1426, #060d1c)' }}
              animate={{ opacity: phase === 'running' ? [0.85, 1, 0.85] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* grid overlay */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#22d3ee55 1px, transparent 1px), linear-gradient(90deg, #22d3ee55 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* skeleton overlay placeholder */}
            <AnimatePresence>
              {phase === 'running' || phase === 'paused' ? (
                <motion.svg
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  viewBox="0 0 100 56"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* skeleton lines */}
                  <g stroke="#22d3ee" strokeWidth="0.5" fill="none" strokeLinecap="round">
                    <motion.path d="M50 12 L50 30 M50 18 L38 26 M50 18 L62 26 M50 30 L40 44 M50 30 L60 44"
                      animate={{ pathLength: [0, 1, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </g>
                  {/* joints */}
                  {[[50,12],[50,18],[38,26],[62,26],[50,30],[40,44],[60,44]].map(([cx,cy],i)=>(
                    <motion.circle key={i} cx={cx} cy={cy} r="1.2" fill="#5fb3ff"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i*0.15 }}
                    />
                  ))}
                </motion.svg>
              ) : null}
            </AnimatePresence>

            {/* idle overlay */}
            {phase === 'idle' && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 text-cyan-300/70" />
                  <p className="mt-3 text-sm text-cyan-200/80">{cameraReady ? 'Camera ready — press Start' : 'Initializing camera...'}</p>
                </div>
              </div>
            )}

            {/* live status badge */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className={`chip ${STATUS_STYLE[status].bg} ${STATUS_STYLE[status].color}`}>
                <StatusIcon className="h-3.5 w-3.5" /> {STATUS_STYLE[status].label}
              </span>
              {phase === 'running' && (
                <span className="chip bg-rose-500/90 text-white">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> LIVE
                </span>
              )}
            </div>

            {/* timer top-right */}
            <div className="absolute right-4 top-4">
              <div className="glass rounded-2xl px-3 py-1.5 text-sm font-bold text-white">
                <Timer className="inline h-4 w-4 mr-1 text-cyan-300" /> {fmtTime(elapsed)}
              </div>
            </div>

            {/* big rep counter bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="glass rounded-3xl px-6 py-3 text-center text-white">
                <p className="text-xs uppercase tracking-widest text-cyan-200">Reps</p>
                <p className="font-display text-4xl font-extrabold tabular-nums">{reps}<span className="text-lg text-cyan-300">/{exercise.targetReps}</span></p>
              </div>
            </div>
          </div>

          {/* controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 p-5">
            {phase === 'idle' && (
              <button onClick={handleStart} className="btn-primary">
                <Play className="h-5 w-5" /> Start
              </button>
            )}
            {phase === 'running' && (
              <button onClick={handlePause} className="btn-ghost">
                <Pause className="h-5 w-5" /> Pause
              </button>
            )}
            {phase === 'paused' && (
              <button onClick={handleResume} className="btn-primary">
                <Play className="h-5 w-5" /> Resume
              </button>
            )}
            {(phase === 'running' || phase === 'paused') && (
              <button onClick={handleStop} className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3 font-semibold text-white shadow-glass transition hover:bg-rose-600 active:scale-[0.98]">
                <Square className="h-5 w-5" /> Stop
              </button>
            )}
            {phase === 'stopped' && (
              <button onClick={handleReset} className="btn-primary">
                <RotateCcw className="h-5 w-5" /> New Session
              </button>
            )}
          </div>
        </GlassCard>

        {/* live metrics + feedback */}
        <div className="space-y-5">
          {/* progress ring */}
          <GlassCard className="flex flex-col items-center p-6">
            <h3 className="self-start font-semibold text-slate-700 dark:text-slate-200">Session Progress</h3>
            <div className="relative my-4 grid place-items-center">
              <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                <circle cx="70" cy="70" r="60" stroke="currentColor" strokeWidth="10" fill="none" className="text-slate-200 dark:text-slate-700" />
                <motion.circle
                  cx="70" cy="70" r="60" stroke="url(#grad)" strokeWidth="10" fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 60}
                  animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - progress / 100) }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2470f5" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="font-display text-3xl font-extrabold text-slate-800 dark:text-white">{Math.round(progress)}%</p>
                <p className="text-xs text-slate-400">to goal</p>
              </div>
            </div>
          </GlassCard>

          {/* metrics */}
          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 text-cyan-500"><Target className="h-4 w-4" /><span className="text-xs font-semibold uppercase">Accuracy</span></div>
              <p className="mt-1 font-display text-2xl font-bold text-slate-800 dark:text-white">{accuracy}%</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 text-amber-500"><Zap className="h-4 w-4" /><span className="text-xs font-semibold uppercase">Calories</span></div>
              <p className="mt-1 font-display text-2xl font-bold text-slate-800 dark:text-white">{calories}</p>
            </GlassCard>
          </div>

          {/* voice feedback */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-brand-600">
              <Volume2 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wide">AI Voice Feedback</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={feedback.message}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mt-3 rounded-2xl p-3 text-sm font-medium ${STATUS_STYLE[status].bg} ${STATUS_STYLE[status].color}`}
              >
                "{feedback.message}"
              </motion.div>
            </AnimatePresence>
            <div className="mt-4 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent</p>
              {feedbackLog.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-xs text-slate-500">
                  <Activity className="h-3 w-3 text-brand-400" /> {f.message}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
