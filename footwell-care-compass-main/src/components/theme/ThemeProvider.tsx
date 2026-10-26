"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "footwell-theme";
const THEME_CHANGE_EVENT = "footwell-theme-change";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function getInitialTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(storedTheme) ? storedTheme : "system";
  } catch {
    return "system";
  }
}

function getResolvedTheme(theme: ThemePreference): ResolvedTheme {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset["theme"] = theme;
  root.style.colorScheme = theme;
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function getResolvedThemeSnapshot(): ResolvedTheme {
  return getResolvedTheme(getInitialTheme());
}

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = useSyncExternalStore<ThemePreference>(
    subscribeToThemeChanges,
    getInitialTheme,
    () => "system",
  );
  const resolvedTheme = useSyncExternalStore<ResolvedTheme>(
    subscribeToThemeChanges,
    getResolvedThemeSnapshot,
    () => "light",
  );

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Continue with the current-session preference when storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
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
