import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme Store
 * Manages dark/light/system theme preferences with persistence
 */

export type ThemeSetting = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeSetting;
  setTheme: (theme: ThemeSetting) => void;
}

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const resolveTheme = (theme: ThemeSetting): 'light' | 'dark' =>
  theme === 'system' ? getSystemTheme() : theme;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'bankr-theme',
    }
  )
);
