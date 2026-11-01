"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "footwell-theme";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function getThemePreference(value: string | null): ThemePreference {
  return isThemePreference(value) ? value : "system";
}

export function resolveTheme(theme: ThemePreference, systemIsDark: boolean): ResolvedTheme {
  return theme === "system" ? (systemIsDark ? "dark" : "light") : theme;
}

function getStoredTheme(): ThemePreference {
  try {
    return getThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

function getSystemIsDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset["theme"] = theme;
  root.style.colorScheme = theme;
}

let sessionPreference: ThemePreference | undefined;
const preferenceListeners = new Set<() => void>();
const getPreferenceSnapshot = () => sessionPreference ?? getStoredTheme();
const getServerPreference = (): ThemePreference => "system";
const getServerSystemIsDark = () => false;

function subscribePreference(listener: () => void) {
  preferenceListeners.add(listener);
  const syncStoredTheme = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      sessionPreference = getStoredTheme();
      preferenceListeners.forEach(notify => notify());
    }
  };
  window.addEventListener("storage", syncStoredTheme);
  return () => {
    preferenceListeners.delete(listener);
    window.removeEventListener("storage", syncStoredTheme);
  };
}

function subscribeSystemTheme(listener: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", listener);
  return () => mediaQuery.removeEventListener("change", listener);
}

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // Server snapshots keep hydration consistent; subscriptions track browser state.
  const theme = useSyncExternalStore(subscribePreference, getPreferenceSnapshot, getServerPreference);
  const systemIsDark = useSyncExternalStore(subscribeSystemTheme, getSystemIsDark, getServerSystemIsDark);
  const resolvedTheme = resolveTheme(theme, systemIsDark);

  useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    // Retain the selected preference even when browser storage is unavailable.
    sessionPreference = nextTheme;
    applyTheme(resolveTheme(nextTheme, getSystemIsDark()));

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage can be disabled; retain the selected theme for this session.
    }
    preferenceListeners.forEach(notify => notify());
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
}
