import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Store = { subscribe: (listener: () => void) => () => void; snapshot: () => unknown; server: () => unknown };
const hooks = vi.hoisted(() => ({ stores: [] as Store[] }));
vi.mock("react", async original => ({
  ...await original<typeof import("react")>(),
  useSyncExternalStore: (subscribe: Store["subscribe"], snapshot: Store["snapshot"], server: Store["server"]) => {
    hooks.stores.push({ subscribe, snapshot, server });
    return snapshot();
  },
  useMemo: (factory: () => unknown) => factory(),
  useCallback: (callback: unknown) => callback,
  useLayoutEffect: (effect: () => void) => effect(),
}));

describe("theme browser subscriptions", () => {
  const events = new Map<string, (event: { key: string | null }) => void>();
  const media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const storage = { getItem: vi.fn(), setItem: vi.fn() };
  const root = { classList: { toggle: vi.fn() }, dataset: {} as Record<string, string>, style: { colorScheme: "" } };
  beforeEach(() => {
    vi.resetModules(); vi.clearAllMocks(); hooks.stores = []; events.clear(); media.matches = false;
    storage.getItem.mockReturnValue("dark"); storage.setItem.mockImplementation(() => {});
    vi.stubGlobal("window", { localStorage: storage, matchMedia: () => media, addEventListener: (name: string, handler: (event: { key: string | null }) => void) => events.set(name, handler), removeEventListener: (name: string) => events.delete(name) });
    vi.stubGlobal("document", { documentElement: root });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("restores saved preference, exposes stable hydration defaults and switches immediately", async () => {
    const { ThemeProvider } = await import("@/components/theme/ThemeProvider");
    const provider = ThemeProvider({ children: null });
    expect(hooks.stores[0]!.server()).toBe("system");
    expect(hooks.stores[1]!.server()).toBe(false);
    expect(hooks.stores[0]!.snapshot()).toBe("dark");
    const listener = vi.fn(); const unsubscribe = hooks.stores[0]!.subscribe(listener);
    provider.props.value.setTheme("light");
    expect(hooks.stores[0]!.snapshot()).toBe("light");
    expect(root.dataset["theme"]).toBe("light");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe(); expect(events.has("storage")).toBe(false);
  });
  it("retains a selected preference when storage is unavailable", async () => {
    storage.getItem.mockImplementation(() => { throw new Error("blocked"); });
    storage.setItem.mockImplementation(() => { throw new Error("blocked"); });
    const { ThemeProvider } = await import("@/components/theme/ThemeProvider");
    const provider = ThemeProvider({ children: null });
    provider.props.value.setTheme("dark");
    expect(hooks.stores[0]!.snapshot()).toBe("dark");
    expect(root.dataset["theme"]).toBe("dark");
  });
  it("synchronizes cross-tab storage removal and system changes", async () => {
    const { ThemeProvider } = await import("@/components/theme/ThemeProvider");
    ThemeProvider({ children: null });
    const listener = vi.fn(); const stopPreference = hooks.stores[0]!.subscribe(listener);
    const stopSystem = hooks.stores[1]!.subscribe(listener);
    storage.getItem.mockReturnValue(null);
    events.get("storage")!({ key: null });
    expect(hooks.stores[0]!.snapshot()).toBe("system");
    media.matches = true;
    media.addEventListener.mock.calls[0]![1]();
    expect(hooks.stores[1]!.snapshot()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    stopPreference(); stopSystem();
    expect(media.removeEventListener).toHaveBeenCalledWith("change", listener);
  });
});
