import { type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Spinner } from '@/components/ui/Spinner';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.5 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden lg:grid lg:grid-cols-2">
      {/* left visual panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-400 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <motion.div
          className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-white/20 blur-2xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <Logo size={56} />
        <div className="relative z-10 text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold leading-tight"
          >
            Recover smarter.<br />Move stronger.
          </motion.h2>
          <p className="mt-4 max-w-sm text-white/80">
            AI-guided physiotherapy that watches your form, counts your reps, and keeps you on track — all from your camera.
          </p>
        </div>
        <div className="relative z-10 flex gap-6 text-white/80 text-sm">
          <span>100k+ sessions</span>
          <span>4.9 rating</span>
          <span>HIPAA-aware</span>
        </div>
      </div>

      {/* right form panel */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white">{title}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, ...props }: { icon: typeof Mail } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input {...props} className="input-field pl-12" />
    </div>
  );
}

export function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast('Welcome back!', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast('Signed in with Google', 'success');
      navigate('/app/dashboard');
    } catch {
      toast('Google sign-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your recovery journey.">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type={show ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field pl-12 pr-12"
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex justify-end">
          <Link to="/auth/forgot" className="text-sm font-semibold text-brand-600 hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner /> : 'Sign In'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        OR
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <button onClick={google} disabled={loading} className="btn-ghost w-full">
        <GoogleIcon /> Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="font-semibold text-brand-600 hover:underline">Sign up</Link>
      </p>
      <Link to="/" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
    </AuthShell>
  );
}

export function SignUpPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(name, email, password);
      toast('Account created! Welcome to FitPose.', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast('Signed in with Google', 'success');
      navigate('/app/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start your AI-guided physiotherapy today.">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={UserIcon} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type={show ? 'text' : 'password'}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-field pl-12 pr-12"
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner /> : 'Create Account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        OR
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <button onClick={google} disabled={loading} className="btn-ghost w-full">
        <GoogleIcon /> Sign up with Google
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast('Reset link sent to your email', 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="We'll send a recovery link to your email.">
      {sent ? (
        <div className="glass-card p-6 text-center">
          <Mail className="mx-auto h-10 w-10 text-brand-500" />
          <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">Check your inbox</p>
          <p className="mt-1 text-sm text-slate-500">We sent a reset link to {email}.</p>
          <Link to="/auth/login" className="btn-primary mt-6 w-full">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner /> : 'Send Reset Link'}
          </button>
        </form>
      )}
      <Link to="/auth/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </AuthShell>
  );
}
