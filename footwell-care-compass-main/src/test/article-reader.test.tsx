// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ArticleContents } from "@/components/journal/ArticleContents";

vi.mock("@/components/journal/JournalBooking", () => ({ JournalBooking: () => null }));
const topics = Array.from({ length: 10 }, (_, i) => ({ id: `topic-${i}`, title: `Topic ${i}`, content: <p>Unique content {i}</p> }));
let root: Root;
type Visibility = Pick<IntersectionObserverEntry, "target" | "isIntersecting" | "intersectionRatio">;
let notify: (entries: Visibility[]) => void;
const observe = vi.fn();
const disconnect = vi.fn();
const scroll = vi.fn();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: typeof notify) { notify = callback; }
    observe = observe;
    disconnect = disconnect;
  });
  document.body.innerHTML = "<main></main>";
  root = createRoot(document.querySelector("main")!);
  act(() => root.render(<ArticleContents topics={topics} introduction={<h1>Title</h1>} />));
  for (const topic of topics) document.getElementById(topic.id)!.scrollIntoView = scroll;
});
afterEach(() => {
  act(() => root.unmount());
  expect(disconnect).toHaveBeenCalled();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
for (const [view, label] of [["desktop", "Article topics"], ["mobile", "Article topics (mobile)"]]) {
  it(`navigates and tracks all ten ${view} topics`, () => {
    const nav = document.querySelector(`nav[aria-label="${label}"]`)!;
    const details = document.querySelector("details")!;
    expect(observe).toHaveBeenCalledTimes(10);
    for (const topic of topics) {
      details.open = true;
      const section = document.getElementById(topic.id)!;
      const link = nav.querySelector<HTMLAnchorElement>(`a[href="#${topic.id}"]`)!;
      act(() => link.click());
      expect(scroll.mock.contexts.at(-1)).toBe(section);
      expect(scroll).toHaveBeenLastCalledWith({ behavior: "smooth" });
      expect(details.open).toBe(false);
      act(() => notify(topics.map(t => ({ target: document.getElementById(t.id)!, isIntersecting: t === topic, intersectionRatio: Number(t === topic) }))));
      expect(nav.querySelectorAll("[aria-current]")).toHaveLength(1);
      expect(link.getAttribute("aria-current")).toBe("location");
      expect(details.querySelector("summary")!.textContent).toContain(topic.title);
    }
  });
}
it("moves keyboard focus without an extra focus scroll", () => {
  const links = document.querySelectorAll<HTMLAnchorElement>('nav[aria-label="Article topics"] a');
  links[0]!.focus();
  for (const [key, index] of [["End", 9], ["ArrowDown", 0], ["ArrowUp", 9], ["Home", 0]] as const) {
    const focus = vi.spyOn(links[index]!, "focus");
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    act(() => { document.activeElement!.dispatchEvent(event); });
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(links[index]);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(scroll.mock.contexts.at(-1)).toBe(document.getElementById(topics[index]!.id));
    focus.mockRestore();
  }
});
