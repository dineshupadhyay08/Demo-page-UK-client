import { describe, expect, it } from "vitest";
import { getThemePreference, resolveTheme } from "@/components/theme/ThemeProvider";
import { nextTheme } from "@/components/theme/ThemeToggle";

describe("theme resolution", () => {
  it("resolves each preference without a second state transition", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("system", true)).toBe("dark");
  });

  it("restores a persisted direct preference before calculating the next theme", () => {
    expect(getThemePreference("light")).toBe("light");
    expect(getThemePreference("dark")).toBe("dark");
    expect(getThemePreference("system")).toBe("system");
    expect(getThemePreference("invalid")).toBe("system");
  });

  it("cycles all preferences in the documented order", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("system");
    expect(nextTheme("system")).toBe("light");
  });
});
