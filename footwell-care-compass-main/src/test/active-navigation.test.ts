import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ pathname: "/", section: "home", effect: undefined as (() => (() => void) | undefined) | undefined }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("react", () => ({
  useState: () => [state.section, (value: string) => { state.section = value; }],
  useEffect: (effect: () => (() => void) | undefined) => { state.effect = effect; },
}));
import { useActiveNavigation } from "@/components/layout/useActiveNavigation";

const hrefs = ["/", "#services", "/#courses", "#journal", "/#reviews"];
let notify: () => void;
let tops: Record<string, number> & { services: number; courses: number; journal: number; reviews: number };
let events: Map<string, () => void>;
const disconnect = vi.fn();
const observe = vi.fn();

beforeEach(() => {
  state.pathname = "/";
  state.section = "home";
  tops = { services: 800, courses: 1800, journal: 3000, reviews: 4000 };
  events = new Map();
  vi.clearAllMocks();
  vi.stubGlobal("document", {
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 68 }) }),
    getElementById: (id: string) => ({ id, getBoundingClientRect: () => ({ top: tops[id] }) }),
  });
  vi.stubGlobal("window", {
    innerHeight: 900,
    addEventListener: (name: string, callback: () => void) => events.set(name, callback),
    removeEventListener: (name: string) => events.delete(name),
  });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: () => void) { notify = callback; }
    observe = observe;
    disconnect = disconnect;
  });
});
afterEach(() => vi.unstubAllGlobals());

function ActiveLinks() {
  const isActive = useActiveNavigation();
  return hrefs.filter(isActive);
}

describe("navigation location tracking", () => {
  it("follows Home → Services → Courses → Home with one active item", () => {
    expect(ActiveLinks()).toEqual(["/"]);
    state.effect!();
    expect(observe).toHaveBeenCalledTimes(4);
    tops.services = 96; notify();
    expect(ActiveLinks()).toEqual(["#services"]);
    tops.services = -900; tops.courses = 96; notify();
    expect(ActiveLinks()).toEqual(["/#courses"]);
    tops.services = 800; tops.courses = 1800; notify();
    expect(ActiveLinks()).toEqual(["/"]);
    expect(events.has("scroll")).toBe(false);
  });

  it.each(["services", "courses", "reviews"])("reads the visible destination after direct hash navigation to %s", id => {
    ActiveLinks(); state.effect!();
    tops.services = id === "courses" ? -800 : 96;
    tops[id] = 96;
    events.get("hashchange")!();
    expect(ActiveLinks()).toEqual([id === "services" ? "#services" : `/#${id}`]);
  });

  it("tracks journal and reviews during scrolling and Back/Forward", () => {
    ActiveLinks(); state.effect!();
    tops.services = -2000; tops.courses = -1000; tops.journal = 96;
    notify();
    expect(ActiveLinks()).toEqual(["#journal"]);
    tops.journal = -800; tops.reviews = 96;
    notify();
    expect(ActiveLinks()).toEqual(["/#reviews"]);
    tops.journal = 96; tops.reviews = 900;
    events.get("popstate")!();
    expect(ActiveLinks()).toEqual(["#journal"]);
    tops.journal = -800; tops.reviews = 96;
    events.get("popstate")!();
    expect(ActiveLinks()).toEqual(["/#reviews"]);
  });

  it("tracks browser history, restored pages and resized viewports, and cleans up", () => {
    ActiveLinks();
    const cleanup = state.effect!();
    tops.services = -900; tops.courses = 96;
    events.get("popstate")!();
    expect(ActiveLinks()).toEqual(["/#courses"]);
    tops.services = 800; tops.courses = 1800;
    events.get("pageshow")!();
    expect(ActiveLinks()).toEqual(["/"]);
    events.get("resize")!();
    notify();
    expect(ActiveLinks()).toEqual(["/"]);
    cleanup!();
    expect(events.size).toBe(0);
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it.each(["/courses", "/courses/everyday-foot-care", "/advice-journal/example"])("derives the active item from pathname %s", pathname => {
    state.pathname = pathname;
    expect(ActiveLinks()).toEqual([pathname.startsWith("/courses") ? "/#courses" : "#journal"]);
    expect(state.effect!()).toBeUndefined();
    expect(observe).not.toHaveBeenCalled();
  });
});
