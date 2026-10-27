"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/components/theme/ThemeProvider";

const themeOrder: ThemePreference[] = ["light", "dark", "system"];

export function nextTheme(theme: ThemePreference) {
  return themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length] ?? "system";
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const next = nextTheme(theme);
  const currentLabel = theme === "system" ? `System (${resolvedTheme})` : theme;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="grid h-11 w-11 place-items-center rounded-full border bg-card text-heading transition-colors hover:bg-secondary"
      aria-label={`Colour theme: ${currentLabel}. Activate to use ${next}.`}
      title={`Theme: ${currentLabel}. Switch to ${next}.`}
    >
      <Sun className="h-5 w-5 dark:hidden" aria-hidden="true" />
      <Moon className="hidden h-5 w-5 dark:block" aria-hidden="true" />
      <span className="sr-only">Theme: {currentLabel}</span>
    </button>
  );
}
