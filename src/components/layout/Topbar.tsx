import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

interface TopbarProps {
  onMenu: () => void;
}

export function Topbar({ onMenu }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-card flex items-center gap-3 px-4 py-3">
        <button onClick={onMenu} className="lg:hidden text-slate-500 hover:text-brand-600">
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden flex-1 max-w-md sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search exercises..."
            onFocus={() => navigate('/app/exercises')}
            className="w-full rounded-full border border-slate-200 bg-white/60 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-brand-400 dark:border-white/10 dark:bg-slate-800/50"
          />
        </div>

        <div className="flex-1 sm:hidden" />

        <button
          onClick={toggleTheme}
          className="rounded-full p-2.5 text-slate-500 hover:bg-white/60 hover:text-brand-600 dark:hover:bg-white/10"
          title="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        <button
          onClick={() => toast('You have 3 new notifications', 'info')}
          className="relative rounded-full p-2.5 text-slate-500 hover:bg-white/60 hover:text-brand-600 dark:hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>
      </div>
    </header>
  );
}
