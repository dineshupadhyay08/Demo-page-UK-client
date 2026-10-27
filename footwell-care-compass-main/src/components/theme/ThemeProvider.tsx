"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";

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

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // Match the server markup during hydration. The layout effect synchronously
  // restores the browser preference before paint, while the layout initializer
  // prevents a visible colour flash before React is ready.
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [systemIsDark, setSystemIsDark] = useState(false);
  const resolvedTheme = resolveTheme(theme, systemIsDark);

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setSystemIsDark(mediaQuery.matches);
    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) setThemeState(getStoredTheme());
    };

    setThemeState(getStoredTheme());
    syncSystemTheme();
    mediaQuery.addEventListener("change", syncSystemTheme);
    window.addEventListener("storage", syncStoredTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncSystemTheme);
      window.removeEventListener("storage", syncStoredTheme);
    };
  }, []);

  useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    // React state applies the preference immediately even when persistence is unavailable.
    setThemeState(nextTheme);
    applyTheme(resolveTheme(nextTheme, getSystemIsDark()));

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage can be disabled; retain the selected theme for this session.
    }
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
