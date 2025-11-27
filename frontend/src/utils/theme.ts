import { useMemo } from 'react';
import { resolveTheme, useThemeStore, ThemeSetting } from '@/store/themeStore';

export const themeColors = {
  light: {
    background: '#fafafa',
    card: 'rgba(255,255,255,0.7)',
    border: 'rgba(0,0,0,0.1)',
    textPrimary: '#1a1a1a',
    textMuted: '#666666',
    buttonHover: '#f0f0f0',
    shadow: 'rgba(0,0,0,0.15)',
  },
  dark: {
    background: '#0b0b0b',
    card: 'rgba(15,15,15,0.6)',
    border: 'rgba(255,255,255,0.05)',
    textPrimary: '#eaeaea',
    textMuted: '#999999',
    buttonHover: '#1a1a1a',
    shadow: 'rgba(0,0,0,0.4)',
  },
  accent: {
    from: '#5af0c8',
    to: '#bdfceb',
  },
} as const;

export type ThemeMode = keyof Pick<typeof themeColors, 'light' | 'dark'>;

export const getThemeColors = (theme: ThemeSetting) => {
  const mode = resolveTheme(theme);
  return {
    mode,
    colors: themeColors[mode],
  };
};

export const useThemeColors = () => {
  const { theme } = useThemeStore();

  return useMemo(() => {
    const mode = resolveTheme(theme);
    return {
      mode,
      colors: themeColors[mode],
    };
  }, [theme]);
};
