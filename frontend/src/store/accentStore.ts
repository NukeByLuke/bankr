import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Accent Color Store
 * Manages accent color preferences with persistence
 */

export interface AccentColor {
  id: string;
  name: string;
  from: string;
  to: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { id: 'mint', name: 'Mint', from: '#5af0c8', to: '#bdfceb' },
  { id: 'blue', name: 'Blue', from: '#3b82f6', to: '#60a5fa' },
  { id: 'purple', name: 'Purple', from: '#8b5cf6', to: '#a78bfa' },
  { id: 'pink', name: 'Pink', from: '#ec4899', to: '#f472b6' },
  { id: 'orange', name: 'Orange', from: '#f97316', to: '#fb923c' },
  { id: 'yellow', name: 'Yellow', from: '#facc15', to: '#fbbf24' },
  { id: 'green', name: 'Green', from: '#22c55e', to: '#4ade80' },
  { id: 'teal', name: 'Teal', from: '#10b981', to: '#34d399' },
  { id: 'emerald', name: 'Emerald', from: '#66ffc2', to: '#3be8a0' },
  { id: 'violet', name: 'Violet', from: '#a78bfa', to: '#c4b5fd' },
  { id: 'amber', name: 'Amber', from: '#fb923c', to: '#fbbf24' },
  { id: 'gold', name: 'Gold', from: '#fbbf24', to: '#fcd34d' },
];

interface AccentState {
  accentColor: AccentColor;
  materialYouEnabled: boolean;
  setAccentColor: (color: AccentColor) => void;
  setMaterialYou: (enabled: boolean) => void;
}

export const useAccentStore = create<AccentState>()(
  persist(
    (set) => ({
      accentColor: ACCENT_COLORS[0], // Default to Mint
      materialYouEnabled: false,
      setAccentColor: (color) => set({ accentColor: color }),
      setMaterialYou: (enabled) => set({ materialYouEnabled: enabled }),
    }),
    {
      name: 'bankr-accent',
    }
  )
);
