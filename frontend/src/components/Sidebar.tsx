import { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  ArrowLeftRight,
  Wallet,
  Target,
  CreditCard,
  Calendar,
  Receipt,
  Clock,
  Activity,
  Settings,
  ChevronLeft,
  LogOut,
  LogIn,
  Info,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const NAV_BASE_CLASSES =
  'flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-from-rgb),0.35)] hover:scale-[1.05]';

const NAV_ACTIVE_CLASSES =
  'bg-gradient-to-r from-[rgba(var(--accent-from-rgb),0.25)] to-[rgba(var(--accent-to-rgb),0.1)] text-primary shadow-[0_12px_30px_rgba(var(--accent-to-rgb),0.18)]';

const NAV_IDLE_CLASSES = 'text-muted hover:bg-black/5 dark:hover:bg-white/10 hover:text-primary';

const SIDEBAR_BASE =
  'fixed left-0 top-0 z-40 flex h-screen flex-col overflow-visible border-r border-white/10 bg-white/80 text-gray-800 shadow-md backdrop-blur-md transition-all duration-300 ease-in-out dark:bg-[#0b0b0b]/95 dark:text-gray-300';

const BRAND_GLOW =
  'text-2xl font-semibold tracking-tight text-[var(--accent-to)] drop-shadow-[0_0_12px_rgba(var(--accent-to-rgb),0.35)]';

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = useMemo(
    () => [
      { to: '/', icon: Home, label: 'Home' },
      { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
      { to: '/budgets', icon: Wallet, label: 'Budgets' },
      { to: '/goals', icon: Target, label: 'Goals' },
      { to: '/loans', icon: CreditCard, label: 'Loans' },
      { to: '/subscriptions', icon: Receipt, label: 'Subscriptions' },
      { to: '/scheduled-payments', icon: Clock, label: 'Scheduled' },
      { to: '/calendar', icon: Calendar, label: 'Calendar' },
      { to: '/activity', icon: Activity, label: 'Activity' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
    []
  );

  return (
    <aside
      className={`${SIDEBAR_BASE} ${isCollapsed ? 'w-20' : 'w-64'} px-3 pb-6 pt-6`}
      aria-label="Primary navigation"
    >
      <div className="relative mb-6">
        <div className="flex items-center justify-center py-4 mb-4">
          {!isCollapsed && (
            <div className="flex w-full items-center gap-2 transition-all duration-300">
              <span className={BRAND_GLOW}>🏦</span>
              <span className="text-lg font-semibold text-primary text-gray-800 dark:text-gray-100">Bankr</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-5 right-3 rounded-full p-1 text-gray-800 transition-all duration-300 hover:bg-white/10 hover:scale-110 hover:shadow-[0_0_10px_rgba(var(--accent-to-rgb),0.3)] dark:text-gray-300"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-1 py-6">
        <ul className={`flex flex-col ${isCollapsed ? 'gap-4' : 'gap-2'}`}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to} className="relative group">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  [
                    NAV_BASE_CLASSES,
                    isCollapsed ? 'justify-center gap-0' : 'justify-start',
                    isActive ? NAV_ACTIVE_CLASSES : NAV_IDLE_CLASSES,
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
              </NavLink>

              {isCollapsed && (
                <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/90 px-3 py-1 text-xs font-medium text-white opacity-0 shadow-[0_12px_20px_rgba(0,0,0,0.35)] transition-opacity duration-200 group-hover:opacity-100">
                  {label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto space-y-3 border-t border-subtle/80 px-2 pt-5">
        {/* User Profile */}
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(var(--accent-from-rgb),0.35)] to-[rgba(var(--accent-to-rgb),0.25)] text-[color-mix(in_srgb,var(--accent-to)_25%,black)] shadow-[0_0_15px_rgba(var(--accent-to-rgb),0.25)]">
            {(user?.firstName || user?.email || '?').substring(0, 1).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-primary">
                {user?.firstName || user?.email}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Login/Logout Button */}
        {isAuthenticated ? (
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-500 transition-all duration-300 hover:bg-red-500/10 hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/90 px-3 py-1 text-xs font-medium text-white opacity-0 shadow-[0_12px_20px_rgba(0,0,0,0.35)] transition-opacity duration-200 group-hover:opacity-100">
                Logout
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--accent-to)] transition-all duration-300 hover:bg-[rgba(var(--accent-from-rgb),0.1)] hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(var(--accent-to-rgb),0.2)] ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogIn className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm font-medium">Login</span>}
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/90 px-3 py-1 text-xs font-medium text-white opacity-0 shadow-[0_12px_20px_rgba(0,0,0,0.35)] transition-opacity duration-200 group-hover:opacity-100">
                Login
              </span>
            )}
          </button>
        )}

        {/* About Button */}
        <button
          onClick={() => navigate('/about')}
          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-muted transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-primary hover:scale-[1.05] ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Info className="h-5 w-5" />
          {!isCollapsed && <span className="text-sm font-medium">About</span>}
          {isCollapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/90 px-3 py-1 text-xs font-medium text-white opacity-0 shadow-[0_12px_20px_rgba(0,0,0,0.35)] transition-opacity duration-200 group-hover:opacity-100">
              About
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
