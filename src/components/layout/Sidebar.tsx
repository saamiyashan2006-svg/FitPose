import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Dumbbell, Activity, BarChart3, User, Settings,
  LogOut, X, HeartPulse,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/exercises', label: 'Exercise Library', icon: Dumbbell },
  { to: '/app/session', label: 'AI Session', icon: Activity },
  { to: '/app/progress', label: 'Progress', icon: BarChart3 },
  { to: '/app/profile', label: 'Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast('Signed out successfully', 'success');
    navigate('/');
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 p-5 transition-transform duration-300 ease-out lg:static lg:h-auto lg:translate-x-0 lg:p-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="glass-card flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <Logo />
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 flex-1 space-y-1.5">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500 to-cyan-400 text-white shadow-glass'
                      : 'text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 p-4 dark:from-slate-800/60 dark:to-slate-800/40">
            <div className="flex items-center gap-2 text-brand-600">
              <HeartPulse className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wide">AI Assistant</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Pose detection running on-device for privacy.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl px-3 py-2.5">
            <img src={user?.photoURL} alt="" className="h-9 w-9 rounded-full bg-slate-200" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.displayName}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <button onClick={handleSignOut} className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
