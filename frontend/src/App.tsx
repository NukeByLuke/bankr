import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore, resolveTheme } from '@/store/themeStore';
import { useAccentStore } from '@/store/accentStore';
import { useEffect } from 'react';

// Layout
import Layout from '@/components/Layout';
import AuthLayout from '@/components/AuthLayout';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Transactions from '@/pages/Transactions';
import Budgets from '@/pages/Budgets';
import Goals from '@/pages/Goals';
import Loans from '@/pages/Loans';
import Subscriptions from '@/pages/Subscriptions';
import ScheduledPayments from '@/pages/ScheduledPayments';
import Calendar from '@/pages/Calendar';
import ActivityLog from '@/pages/ActivityLog';
import Settings from '@/pages/Settings';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

const hexToRgb = (hex: string): string | null => {
  const value = hex.replace('#', '');
  const normalized =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;

  if (normalized.length !== 6) {
    return null;
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return `${r}, ${g}, ${b}`;
};

/**
 * Main App Component
 * Handles routing, authentication, and theme management
 */
function App() {
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const { accentColor } = useAccentStore();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const applyResolvedTheme = (mode: 'light' | 'dark') => {
      root.classList.toggle('dark', mode === 'dark');
      root.setAttribute('data-theme', mode);
      root.style.colorScheme = mode;
    };

    const resolved = resolveTheme(theme);
    applyResolvedTheme(resolved);

    let mediaQuery: MediaQueryList | null = null;
    const handleSystemChange = (event: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyResolvedTheme(event.matches ? 'dark' : 'light');
      }
    };

    if (theme === 'system' && typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleSystemChange);
    }

    return () => {
      mediaQuery?.removeEventListener('change', handleSystemChange);
    };
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-from', accentColor.from);
    root.style.setProperty('--accent-to', accentColor.to);

    const fromRgb = hexToRgb(accentColor.from);
    const toRgb = hexToRgb(accentColor.to);

    if (fromRgb) {
      root.style.setProperty('--accent-from-rgb', fromRgb);
    }

    if (toRgb) {
      root.style.setProperty('--accent-to-rgb', toRgb);
    }
  }, [accentColor]);

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
      </Route>

      {/* Protected routes */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/scheduled-payments" element={<ScheduledPayments />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/activity" element={<ActivityLog />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
