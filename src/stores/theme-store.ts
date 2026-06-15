import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeVariant = 'base' | 'salvia';

/** Debe coincidir con las claves usadas por el script pre-paint en index.html. */
export const THEME_MODE_KEY = 'psicocms-theme-mode';
export const THEME_VARIANT_KEY = 'psicocms-theme-variant';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isThemeVariant(value: string | null): value is ThemeVariant {
  return value === 'base' || value === 'salvia';
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return mode === 'dark';
}

function applyTheme(mode: ThemeMode, variant: ThemeVariant): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolveIsDark(mode));
  root.dataset.theme = variant;
}

function readMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_MODE_KEY);
  return isThemeMode(stored) ? stored : 'system';
}

function readVariant(): ThemeVariant {
  const stored = localStorage.getItem(THEME_VARIANT_KEY);
  return isThemeVariant(stored) ? stored : 'base';
}

type ThemeState = {
  mode: ThemeMode;
  variant: ThemeVariant;
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: readMode(),
  variant: readVariant(),
  setMode: (mode) => {
    localStorage.setItem(THEME_MODE_KEY, mode);
    applyTheme(mode, get().variant);
    set({ mode });
  },
  setVariant: (variant) => {
    localStorage.setItem(THEME_VARIANT_KEY, variant);
    applyTheme(get().mode, variant);
    set({ variant });
  },
}));
