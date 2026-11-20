import { existsSync } from "node:fs";
import path from "node:path";
import { isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hooks = vi.hoisted(() => ({ values: [] as unknown[], index: 0 }));
vi.mock("react", async original => ({
  ...await original<typeof import("react")>(),
  useRef: () => ({ current: null }),
  useEffect: () => {},
  useState: (initial: unknown) => {
    const index = hooks.index++;
    if (!(index in hooks.values)) hooks.values[index] = initial;
    return [hooks.values[index], (value: unknown) => { hooks.values[index] = value; }];
  },
}));
vi.mock("@/components/layout/useActiveNavigation", () => ({ useActiveNavigation: () => (href: string) => href === "/#reviews" }));
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomePage } from "@/routes/index";
import { BookingModal } from "@/components/booking/BookingModal";
import { TREATMENTS, TREATMENT_CATEGORIES } from "@/config/clinic";

type Props = { href?: string; "aria-label"?: string; "aria-current"?: string; id?: string; className?: string; children?: ReactNode; src?: string; onClick?: () => void; initialTreatment?: string };
function nodes(node: ReactNode): { type: unknown; props: Props }[] {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!isValidElement<Props>(node)) return [];
  return [{ type: node.type, props: node.props }, ...nodes(node.props.children)];
}
function render() {
  hooks.index = 0;
  return nodes(HomePage({ journalCards: null }));
}

beforeEach(() => { hooks.values = []; hooks.index = 0; });
describe("supplied treatment image integration", () => {
  for (const category of TREATMENT_CATEGORIES) it(`keeps exactly two ${category} cards with the correct photos and booking selection`, () => {
    render().find(node => node.type === "button" && node.props.children === category)!.props.onClick!();
    const cards = render().filter(node => node.type === "article");
    expect(cards).toHaveLength(2);
    const expected = TREATMENTS.filter(treatment => treatment.cat === category);
    for (const [index, card] of cards.entries()) {
      const treatment = expected[index]!;
      const contents = nodes(card.props.children);
      const photo = contents.find(node => typeof node.props.src === "string" && node.props.src.startsWith("/images/treatments/"))!;
      expect(photo).toBeDefined();
      const expectedFiles: Record<string, string> = {
        "General Podiatry Appointment": "01_general_podiatry.png", "Medical Pedicure": "02_medical_pedicure.png",
        "Biomechanical & Gait Assessment": "03_biomechanical_gait.png", "Custom 3D-Printed Orthotics": "04_custom_orthotics.png",
        "Partial Nail Avulsion (PNA)": "05_partial_nail_avulsion.png", "Verruca Treatment (Swift / Needling)": "06_verruca_treatment.png",
        "Diabetic Foot Assessment": "07_diabetic_foot.png", "Wound & Ulcer Care Review": "08_wound_ulcer_care.png",
      };
      expect(photo.props.src).toBe(`/images/treatments/${expectedFiles[treatment.name]}`);
      expect(existsSync(path.join(process.cwd(), "public", photo.props.src!))).toBe(true);
      expect(contents.some(node => node.type === "h3" && node.props.children === treatment.name)).toBe(true);
      contents.find(node => node.type === "button")!.props.onClick!();
      expect(render().find(node => node.type === BookingModal)?.props.initialTreatment).toBe(treatment.name);
    }
  });
});

it("places journal immediately before reviews with sticky-header clearance", () => {
  const sections = render().filter(node => node.type === "section");
  const journal = sections.findIndex(node => node.props.id === "journal");
  expect(journal).toBeGreaterThan(-1);
  expect(sections[journal + 1]?.props.id).toBe("reviews");
  expect(sections[journal + 1]?.props.className).toContain("scroll-mt-24");
});

it("links Reviews to the homepage and closes the mobile menu on selection", () => {
  const header = () => {
    hooks.index = 0;
    return nodes(HomeHeader({ onBook: () => {} }));
  };
  expect(header().filter(node => node.props.href).slice(1).map(node => node.props.children))
    .toEqual(["Home", "Services", "Courses", "Advice & Journal", "Reviews"]);
  header().find(node => node.props["aria-label"] === "Open menu")!.props.onClick!();
  const menu = header().find(node => node.props.id === "home-navigation")!;
  const review = nodes(menu.props.children).find(node => node.props.children === "Reviews")!;
  expect(review.props.href).toBe("/#reviews");
  expect(review.props["aria-current"]).toBe("location");
  review.props.onClick!();
  expect(header().some(node => node.props.id === "home-navigation")).toBe(false);
});
