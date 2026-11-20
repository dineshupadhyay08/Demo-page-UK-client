import { isValidElement, type ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const hooks = vi.hoisted(() => ({ values: [] as unknown[], index: 0 }));
vi.mock("react", async original => ({
  ...await original<typeof import("react")>(),
  useEffect: () => {},
  useRef: () => ({ current: null }),
  useState: (initial: unknown) => {
    const index = hooks.index++;
    if (!(index in hooks.values)) hooks.values[index] = initial;
    return [hooks.values[index], (value: unknown) => {
      hooks.values[index] = typeof value === "function" ? value(hooks.values[index]) : value;
    }];
  },
}));
import { SymptomFinder } from "@/components/home/SymptomFinder";
import { HomePage } from "@/routes/index";
import { BookingModal } from "@/components/booking/BookingModal";

type Props = { children?: ReactNode; onClick?: () => void; onBook?: (value: string) => void; disabled?: boolean; "aria-pressed"?: boolean; "aria-valuenow"?: number; role?: string; initialTreatment?: string; className?: string };
function nodes(node: ReactNode): { type: unknown; props: Props }[] {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!isValidElement<Props>(node)) return [];
  return [{ type: node.type, props: node.props }, ...nodes(node.props.children)];
}
const book = vi.fn();
function render() {
  hooks.index = 0;
  return nodes(SymptomFinder({ onBook: book }));
}
function click(label: string) {
  const button = render().find(node => node.type === "button" && node.props.children === label)!;
  expect(button.props.disabled).not.toBe(true);
  button.props.onClick!();
}
function progress() { return render().find(node => node.props.role === "progressbar")!.props["aria-valuenow"]; }
beforeEach(() => { hooks.values = []; hooks.index = 0; book.mockClear(); vi.stubEnv("SYMPTOM_FINDER_PREVIEW", "false"); });
afterEach(() => vi.unstubAllEnvs());

for (const topic of ["Heel or arch", "Toenail", "Knee, shin or hip", "Skin or general"]) {
  it.each(["Yes", "No"])(`${topic} / %s ends with neutral guidance and no preselection`, answer => {
    expect(render().find(node => node.props.children === "Next")!.props.disabled).toBe(true);
    expect(progress()).toBe(0);
    click(topic); click("Next");
    expect(progress()).toBe(1);
    click(answer); click("Next");
    expect(progress()).toBe(2);
    expect(render().some(node => node.props.children === "Suggestions awaiting clinical approval")).toBe(true);
    const text = JSON.stringify(render().map(node => node.props.children));
    for (const forbidden of ["Partial Nail Avulsion", "Diabetic Foot Assessment", "We suggest", "Biomechanical & Gait Assessment"]) expect(text).not.toContain(forbidden);
    expect(book).not.toHaveBeenCalled();
    expect(render().some(node => node.props.children === "Request this")).toBe(false);
  });
}
it("preserves answers on Back, allows corrections, and resets completely", () => {
  click("Toenail"); click("Next"); click("Yes"); click("Next");
  click("Back");
  expect(render().find(node => node.props.children === "Yes")!.props["aria-pressed"]).toBe(true);
  click("Back");
  expect(render().find(node => node.props.children === "Toenail")!.props["aria-pressed"]).toBe(true);
  click("Heel or arch"); click("Next");
  expect(render().find(node => node.props.children === "Yes")!.props["aria-pressed"]).toBe(true);
  click("No"); click("Next"); click("Start Again");
  expect(progress()).toBe(0);
  expect(hooks.values[0]).toEqual([]);
  expect(render().find(node => node.props.children === "Next")!.props.disabled).toBe(true);
});
it("integrates once beside native FAQs and opens the existing unselected booking flow", () => {
  const home = () => { hooks.index = 0; return nodes(HomePage({ journalCards: null })); };
  const finder = home().filter(node => node.type === SymptomFinder);
  expect(finder).toHaveLength(1);
  const section = home().find(node => node.type === "section" && nodes(node.props.children).some(child => child.type === SymptomFinder))!;
  expect(section.props.className).toContain("lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]");
  expect(nodes(section.props.children).filter(node => node.type === "details")).toHaveLength(4);
  finder[0]!.props.onBook!("");
  expect(home().find(node => node.type === BookingModal)!.props.initialTreatment).toBe("");
});

for (const [topic, expected] of [
  ["Heel or arch", "Biomechanical & Gait Assessment"],
  ["Toenail", "Partial Nail Avulsion (PNA)"],
  ["Knee, shin or hip", "Biomechanical & Gait Assessment"],
  ["Skin or general", "General Podiatry Appointment"],
]) {
  it.each(["Yes", "No"])(`preview ${topic} / %s passes the exact service into BookingModal`, answer => {
    vi.stubEnv("SYMPTOM_FINDER_PREVIEW", "true");
    click(topic!); click("Next"); click(answer); click("Next");
    const treatment = answer === "Yes" ? "Diabetic Foot Assessment" : expected;
    expect(render().some(node => node.props.children === "We suggest:")).toBe(true);
    expect(render().some(node => node.props.children === treatment)).toBe(true);
    click("Request this");
    expect(book).toHaveBeenCalledExactlyOnceWith(treatment);
    hooks.values = []; hooks.index = 0;
    const home = () => { hooks.index = 0; return nodes(HomePage({ journalCards: null })); };
    home().find(node => node.type === SymptomFinder)!.props.onBook!(book.mock.calls[0]![0]);
    expect(home().find(node => node.type === BookingModal)!.props.initialTreatment).toBe(treatment);
  });
}
it.each([
  ["development", undefined, "true"],
  ["production", "preview", "true"],
  ["production", "production", "false"],
  ["development", "production", "false"],
  ["production", undefined, "false"],
  ["production", "unknown", "false"],
] as const)("gates build environment %s / %s", async (node, vercel, expected) => {
  vi.stubEnv("NODE_ENV", node);
  vi.stubEnv("VERCEL_ENV", vercel);
  vi.resetModules();
  const config = (await import("../../next.config")).default;
  expect(config.env?.["SYMPTOM_FINDER_PREVIEW"]).toBe(expected);
});
