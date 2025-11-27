import { useMemo } from 'react';
import { Monitor, Moon, Sun, Palette, Sparkles, Globe, MoreHorizontal, Split, Download, Upload, Archive } from 'lucide-react';
import { useThemeStore, resolveTheme, ThemeSetting } from '@/store/themeStore';
import { useAccentStore, ACCENT_COLORS } from '@/store/accentStore';
import { useThemeColors } from '@/utils/theme';

const THEME_OPTIONS: Array<{
  value: ThemeSetting;
  label: string;
  description: string;
  icon: JSX.Element;
}> = [
  {
    value: 'system',
    label: 'System Default',
    description: 'Automatically follow your device appearance.',
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    value: 'light',
    label: 'Light Mode',
    description: 'Bright, airy palette ideal for daytime focus.',
    icon: <Sun className="w-5 h-5" />,
  },
  {
    value: 'dark',
    label: 'Dark Mode',
    description: 'Low-light optimized design for evening comfort.',
    icon: <Moon className="w-5 h-5" />,
  },
];

export default function Settings() {
  const { theme, setTheme } = useThemeStore();
  const { accentColor, materialYouEnabled, setAccentColor, setMaterialYou } = useAccentStore();
  const { colors } = useThemeColors();
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  return (
    <div className="space-y-6 transition-colors duration-300">
      <div className="space-y-2">
        <h1>Settings</h1>
        <p className="text-muted max-w-2xl">
          Tailor Bankr to match your workflow. Theme preferences update instantly across every page.
        </p>
      </div>

      {/* Theme Section */}
      <section className="glass-card rounded-2xl p-6 md:p-8">
        <header className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Theme</h2>
            <p className="text-muted">
              Choose between light, dark, or follow your system preference. Current mode:{' '}
              <span className="font-medium text-[var(--accent-to)]">
                {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </p>
          </div>
          <div
            className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl shadow-glass"
            style={{
              background: `linear-gradient(135deg, ${colors.card}, transparent)`
            }}
          >
            {THEME_OPTIONS.find((option) => option.value === theme)?.icon}
          </div>
        </header>

        <div className="space-y-6">
          {/* Theme Mode Selection */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">Theme Mode</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {THEME_OPTIONS.map((option) => {
                const isActive = option.value === theme;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`group relative flex h-full w-full flex-col rounded-2xl border transition-all duration-300 ease-out ${
                      isActive
                        ? 'border-transparent accent-gradient text-black shadow-[0_12px_35px_rgba(var(--accent-from-rgb),0.35)]'
                        : 'border-subtle glass-input text-left hover-glow'
                    }`}
                  >
                    <span className="absolute inset-0 rounded-2xl bg-white/0 transition-opacity duration-300 group-hover:bg-white/5 dark:group-hover:bg-white/10" />
                    <div className="relative flex flex-col gap-3 p-5 text-left">
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                          {option.icon}
                          {option.label}
                        </span>
                        {isActive && (
                          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-semibold uppercase text-black/70 dark:bg-white/10 dark:text-white/70">
                            Active
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-muted leading-relaxed">
                        {option.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Picker */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Accent Color
            </h3>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
              {ACCENT_COLORS.map((color) => {
                const isActive = color.id === accentColor.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color)}
                    className={`group relative aspect-square rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'scale-110 shadow-[0_8px_25px_rgba(0,0,0,0.2)]'
                        : 'hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                    }}
                    aria-pressed={isActive}
                    aria-label={`Select ${color.name} accent`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-white shadow-lg" />
                      </div>
                    )}
                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material You Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-subtle glass-input p-5 transition-all duration-300 hover-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(var(--accent-from-rgb),0.2)] to-[rgba(var(--accent-to-rgb),0.1)]">
                <Sparkles className="h-5 w-5 text-[var(--accent-to)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Material You</h3>
                <p className="text-xs text-muted">Dynamic color extraction from wallpaper</p>
              </div>
            </div>
            <button
              onClick={() => setMaterialYou(!materialYouEnabled)}
              className={`relative h-7 w-12 rounded-full transition-all duration-300 ${
                materialYouEnabled ? 'bg-[var(--accent-to)]' : 'bg-subtle'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                  materialYouEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-subtle px-5 py-4 text-sm text-muted">
          Tip: pick "System Default" to automatically adjust when your device switches between day and night.
        </div>
      </section>

      {/* Preferences Section */}
      <section className="glass-card rounded-2xl p-6 md:p-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold">Preferences</h2>
          <p className="text-muted">Customize your Bankr experience</p>
        </header>

        <div className="space-y-3">
          <button className="group flex w-full items-center justify-between rounded-2xl border border-subtle glass-input p-5 text-left transition-all duration-300 hover-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Edit Home Page</h3>
                <p className="text-xs text-muted">Customize your dashboard layout</p>
              </div>
            </div>
            <span className="text-muted group-hover:text-primary transition-colors duration-300">→</span>
          </button>

          <button className="group flex w-full items-center justify-between rounded-2xl border border-subtle glass-input p-5 text-left transition-all duration-300 hover-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10">
                <Globe className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Language</h3>
                <p className="text-xs text-muted">English (US)</p>
              </div>
            </div>
            <span className="text-muted group-hover:text-primary transition-colors duration-300">→</span>
          </button>

          <button className="group flex w-full items-center justify-between rounded-2xl border border-subtle glass-input p-5 text-left transition-all duration-300 hover-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10">
                <MoreHorizontal className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">More Options</h3>
                <p className="text-xs text-muted">Additional settings and configurations</p>
              </div>
            </div>
            <span className="text-muted group-hover:text-primary transition-colors duration-300">→</span>
          </button>
        </div>
      </section>

      {/* Tools & Extras Section */}
      <section className="glass-card rounded-2xl p-6 md:p-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold">Tools & Extras</h2>
          <p className="text-muted">Advanced features and utilities</p>
        </header>

        <div className="space-y-3">
          <button className="group flex w-full items-center justify-between rounded-2xl border border-subtle glass-input p-5 text-left transition-all duration-300 hover-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10">
                <Split className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Bill Splitter</h3>
                <p className="text-xs text-muted">Split expenses with friends and family</p>
              </div>
            </div>
            <span className="text-muted group-hover:text-primary transition-colors duration-300">→</span>
          </button>

          <button className="group flex w-full items-center justify-between rounded-2xl border border-subtle glass-input p-5 text-left transition-all duration-300 hover-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10">
                <Upload className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Import Data</h3>
                <p className="text-xs text-muted">Import transactions from CSV or bank</p>
              </div>
            </div>
            <span className="text-muted group-hover:text-primary transition-colors duration-300">→</span>
          </button>

          <button className="group flex w-full items-center justify-between rounded-2xl border border-subtle glass-input p-5 text-left transition-all duration-300 hover-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10">
                <Download className="h-5 w-5 text-teal-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Export Data</h3>
                <p className="text-xs text-muted">Download your financial data</p>
              </div>
            </div>
            <span className="text-muted group-hover:text-primary transition-colors duration-300">→</span>
          </button>

          <button className="group flex w-full items-center justify-between rounded-2xl border border-subtle glass-input p-5 text-left transition-all duration-300 hover-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10">
                <Archive className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Backups</h3>
                <p className="text-xs text-muted">Create and restore data backups</p>
              </div>
            </div>
            <span className="text-muted group-hover:text-primary transition-colors duration-300">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}
