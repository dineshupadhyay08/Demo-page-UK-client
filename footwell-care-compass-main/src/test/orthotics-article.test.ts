import { describe, it, expect, vi, afterEach } from "vitest";
import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import content from "@/content/journal/articles.json";
import type { JournalArticle } from "@/lib/journal";
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("@/components/theme/ThemeToggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/components/journal/JournalBooking", () => ({ JournalBooking: () => null }));
import ArticlePage, { generateMetadata } from "@/app/advice-journal/[slug]/page";
import { EducationalSection } from "@/components/journal/EducationalSection";
const article = (content as JournalArticle[]).find(a => a.slug === "custom-orthotics-vs-off-the-shelf-insoles")!;
afterEach(() => vi.unstubAllEnvs());
describe("orthotics educational article", () => {
  it("renders six real image layouts, full-width explanations and the balanced comparison", () => {
    const html = article.sections.map(section => renderToStaticMarkup(createElement(EducationalSection, { article, section }))).join("");
    expect((html.match(/data-editorial-visual-row/g) ?? [])).toHaveLength(6);
    expect((html.match(/data-editorial-body/g) ?? [])).toHaveLength(6);
    expect(html).not.toContain("Approved illustration to be added");
    expect(html).toContain("Custom Orthotics");
    expect(html).toContain("Off-the-Shelf Insoles");
    expect(article.sections.find(s => s.id === "evidence")!.comparison).toHaveLength(8);
    for (const name of ["01-foot-anatomy-arch-support", "02-custom-vs-standard-insoles", "03-custom-orthotic-construction", "04-foot-pressure-assessment", "05-materials-cushioning-support", "06-orthotic-in-everyday-footwear"]) {
      expect(existsSync(`public/journal/Custom Orthotics/${name}.png`)).toBe(true);
      expect(html).toContain(name);
    }
  });
  it("keeps review safeguards, valid unique anchors, eight FAQs and three distinct neighbours", async () => {
    const html = renderToStaticMarkup(await ArticlePage({ params: Promise.resolve({ slug: article.slug }) }));
    expect(html).toContain("Awaiting clinical review.");
    expect(article.faqs).toHaveLength(8);
    for (const section of article.sections) {
      expect(html.split(`id="${section.id}"`)).toHaveLength(2);
      expect(html).toContain(`href="#${section.id}"`);
      for (const reference of section.references) expect(article.references[reference - 1]?.url).toMatch(/^https:/);
    }
    expect((html.match(/after:absolute/g) ?? [])).toHaveLength(3);
    expect(html).toContain("Not Sure Which Support Is Right for You?");
  });
  it("provides canonical and social metadata when a real site origin is configured, with noindex pending review", async () => {
    vi.stubEnv("SITE_URL", "https://example.test");
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: article.slug }) });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe(`https://example.test/advice-journal/${article.slug}`);
    expect(metadata.openGraph?.images).toEqual([{ url: `https://example.test${article.image.src}`, alt: article.image.alt }]);
    const html = renderToStaticMarkup(await ArticlePage({ params: Promise.resolve({ slug: article.slug }) }));
    expect(html).toContain('"@type":"Article"');
    expect(html).not.toContain("Reviewed by Dr");
  });
});
