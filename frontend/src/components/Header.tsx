import { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, LogOut, Bell } from 'lucide-react';
import { useThemeStore, resolveTheme, ThemeSetting } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/utils/helpers';

/**
 * Header Component
 * Displays current time/date and theme toggle
 */
export default function Header() {
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  const nextTheme = () => {
    const order: ThemeSetting[] = ['light', 'dark', 'system'];
    const index = order.indexOf(theme);
    return order[(index + 1) % order.length];
  };

  const toggleTheme = () => {
    const upcoming = theme === 'system'
      ? resolvedTheme === 'dark'
        ? 'light'
        : 'dark'
      : nextTheme();

    setTheme(upcoming);
  };

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  const themeLabel = () => {
    if (theme === 'system') {
      return `System · ${resolvedTheme === 'dark' ? 'Dark' : 'Light'}`;
    }
    return currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="glass-header sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-subtle px-6 py-3 shadow-[0_16px_40px_rgba(8,10,12,0.18)] transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-3 text-muted">
        <span className="text-sm font-medium text-primary">
          {formatDate(currentTime, 'long')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-black/5 text-muted transition-all duration-300 ease-out hover:scale-[1.05] hover:border-[rgba(var(--accent-from-rgb),0.35)] dark:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] shadow-[0_0_8px_rgba(var(--accent-to-rgb),0.6)]" />
        </button>

        <button
          onClick={toggleTheme}
          className="group glass-input inline-flex items-center gap-3 rounded-xl px-3 py-2 text-muted transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.25)]"
          aria-label={`Toggle theme: ${themeLabel()}`}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {themeLabel()}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 transition-colors duration-300 dark:bg-white/10">
            {currentTheme === 'dark' ? (
              <Moon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
            ) : (
              <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
            )}
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-transparent bg-black/5 px-3 py-2 transition-all duration-300 ease-out hover:scale-[1.03] dark:bg-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(var(--accent-from-rgb),0.3)] to-[rgba(var(--accent-to-rgb),0.2)] text-[color-mix(in_srgb,var(--accent-to)_25%,black)] shadow-[0_0_12px_rgba(var(--accent-to-rgb),0.25)]">
            {(user?.firstName || user?.email || '?').substring(0, 1).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-primary leading-tight">
              {user?.firstName || user?.email || 'Guest'}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted">
              {user?.role || 'Free'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-red-500/10 text-rose-500 transition-all duration-300 ease-out hover:scale-[1.05] hover:bg-red-500/20 dark:text-rose-300"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
