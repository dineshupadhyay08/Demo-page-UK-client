import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactNode } from "react";
const hooks = vi.hoisted(() => ({ active: 0, ref: 0, refs: [{ current: { scrollTop: 100 } }, { current: { open: true } }] as { current: Record<string, unknown> }[] }));
vi.mock("react", async original => ({
  ...await original<typeof import("react")>(),
  useState: () => [hooks.active, (value: number) => { hooks.active = value; }],
  useRef: () => hooks.refs[hooks.ref++],
}));
import { ArticleContents } from "@/components/journal/ArticleContents";
type Props = { role?: string; type?: string; "aria-selected"?: boolean; "aria-pressed"?: boolean; "aria-label"?: string; onClick?: () => void; onKeyDown?: (event: unknown) => void; children?: ReactNode };
function nodes(node: ReactNode): Props[] {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!isValidElement<Props>(node)) return [];
  return [node.props, ...nodes(node.props.children)];
}
const topics = Array.from({ length: 10 }, (_, i) => ({ id: `topic-${i}`, title: `Topic ${i}`, content: <p>Unique content {i}</p> }));
function render() {
  hooks.ref = 0;
  return nodes(ArticleContents({ topics, introduction: <h1>Title</h1> }));
}
beforeEach(() => { hooks.active = 0; hooks.ref = 0; hooks.refs = [{ current: { scrollTop: 100 } }, { current: { open: true } }]; });
afterEach(() => vi.unstubAllGlobals());
describe("article reader", () => {
  for (const control of ["desktop", "mobile"] as const) it(`switches all ten ${control} topics with one active panel and no page scrolling`, () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("window", { scrollY: 240, scrollTo });
    for (let i = 0; i < topics.length; i++) {
      const controls = render().filter(p => control === "desktop" ? p.role === "tab" : p["aria-pressed"] !== undefined);
      controls[i]!.onClick!();
      const result = render();
      expect(result.filter(p => p.role === "tabpanel")).toHaveLength(1);
      expect(result.find(p => p.role === "tabpanel")?.["aria-label"]).toBe(`Topic ${i}`);
      expect(result.filter(p => p["aria-selected"] === true)).toHaveLength(1);
      expect(hooks.refs[0]!.current["scrollTop"]).toBe(0);
      expect(hooks.refs[1]!.current["open"]).toBe(false);
      expect(window.scrollY).toBe(240);
      expect(scrollTo).not.toHaveBeenCalled();
    }
  });
  it("supports arrow and Home/End keys without scrolling focus", () => {
    const focus = vi.fn(); vi.stubGlobal("document", { getElementById: () => ({ focus }) });
    for (const [key, expected] of [["End", 9], ["ArrowDown", 0], ["ArrowUp", 9], ["Home", 0]] as const) {
      const selected = render().find(p => p.role === "tab" && p["aria-selected"]);
      const preventDefault = vi.fn(); selected!.onKeyDown!({ key, preventDefault });
      expect(hooks.active).toBe(expected);
      expect(preventDefault).toHaveBeenCalled();
      expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
    }
  });
});
