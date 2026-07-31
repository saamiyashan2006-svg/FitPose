import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Moon, Bell, Globe, HelpCircle, Shield, Info, ChevronRight,
  LogOut, Check,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${on ? 'left-6' : 'left-1'}`}
      />
    </button>
  );
}

function Row({ icon: Icon, label, children, onClick }: { icon: typeof Moon; label: string; children?: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-white/40 dark:hover:bg-white/5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1 font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      {children ?? <ChevronRight className="h-5 w-5 text-slate-400" />}
    </button>
  );
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Customize your FitPose experience.</p>
      </div>

      <GlassCard className="divide-y divide-slate-100 dark:divide-white/5 p-0">
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
            <Moon className="h-5 w-5" />
          </div>
          <span className="flex-1 font-semibold text-slate-700 dark:text-slate-200">Dark Mode</span>
          <Toggle on={theme === 'dark'} onClick={toggleTheme} />
        </div>
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300">
            <Bell className="h-5 w-5" />
          </div>
          <span className="flex-1 font-semibold text-slate-700 dark:text-slate-200">Notifications</span>
          <Toggle on={notifications} onClick={() => { setNotifications((n) => !n); toast(notifications ? 'Notifications off' : 'Notifications on', 'info'); }} />
        </div>
        <Row icon={Globe} label={`Language · ${language}`}>
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); toast(`Language set to ${e.target.value}`, 'success'); }}
            className="rounded-lg border border-slate-200 bg-white/60 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-slate-800/60"
          >
            {['English', 'Español', 'Français', 'Deutsch', 'हिन्दी', '中文'].map((l) => <option key={l}>{l}</option>)}
          </select>
        </Row>
      </GlassCard>

      <GlassCard className="divide-y divide-slate-100 dark:divide-white/5 p-0">
        <Row icon={HelpCircle} label="Help & Support" onClick={() => toast('Support team will reach out shortly', 'info')} />
        <Row icon={Shield} label="Privacy" onClick={() => toast('Your data stays on-device', 'info')} />
        <Row icon={Info} label="About FitPose" onClick={() => toast('FitPose v1.0 · AI Physiotherapy', 'info')} />
      </GlassCard>

      <GlassCard className="p-0">
        <button
          onClick={async () => { await signOut(); toast('Signed out', 'success'); navigate('/'); }}
          className="flex w-full items-center justify-center gap-2 px-4 py-4 font-semibold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </GlassCard>

      <p className="text-center text-xs text-slate-400">FitPose · Your AI Physiotherapy Assistant · v1.0.0</p>
    </div>
  );
}
