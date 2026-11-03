import { describe, it, expect, vi, afterEach } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import content from "@/content/journal/articles.json";
import { contentRevision, isPublished, isVisible, readingMinutes, relatedArticles, journalOrigin, articleStructuredData, safeJsonLd, type JournalArticle } from "@/lib/journal";
vi.mock("server-only", () => ({}));
import { publishedArticles, publishedArticle, visibleArticles, visibleArticle } from "@/server/journal/articles";
import sitemap from "@/app/sitemap";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { EducationalSection } from "@/components/journal/EducationalSection";
import { ArticleCard } from "@/components/journal/ArticleCard";
import ArticlePage, { generateMetadata } from "@/app/advice-journal/[slug]/page";
import JournalPage from "@/app/advice-journal/page";
import { PRIMARY_NAVIGATION } from "@/config/clinic";
import { SiteHeader } from "@/components/layout/SiteHeader";
vi.mock("@/components/theme/ThemeToggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/components/journal/JournalBooking", () => ({ JournalBooking: () => null }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); }, redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));

const drafts = content as JournalArticle[];
const now = new Date("2026-11-02T12:00:00Z");
function approved(source: JournalArticle): JournalArticle {
  const article = structuredClone(source);
  article.status = "published";
  article.image.approved = true;
  article.publishedAt = "2026-11-01";
  article.review = { name: "Synthetic test reviewer", reviewedAt: "2026-11-01", approvedAt: "2026-11-01", revision: contentRevision(article) };
  return article;
}
afterEach(() => vi.unstubAllEnvs());
describe("journal publication boundary", () => {
  it("keeps review previews out of approved publication queries and sitemap", () => {
    vi.stubEnv("SITE_URL", "https://example.test");
    expect(publishedArticles()).toEqual([]);
    for (const a of drafts) expect(publishedArticle(a.slug)).toBeUndefined();
    expect(publishedArticle("unknown")).toBeUndefined();
    expect(sitemap().map(a => a.url)).toEqual(["https://example.test"]);
  });
  it("shows only explicitly authorized awaiting-review previews", () => {
    expect(visibleArticles()).toHaveLength(4);
    for (const a of drafts) expect(visibleArticle(a.slug)?.status).toBe("awaiting-review");
    expect(visibleArticle("not-an-article")).toBeUndefined();
    expect(isVisible({ ...drafts[0]!, publicPreview: false })).toBe(false);
    expect(isVisible({ ...drafts[0]!, status: "draft", publicPreview: true })).toBe(false);
    expect(isVisible({ ...drafts[0]!, status: "review-required", publicPreview: true })).toBe(false);
    for (const a of drafts) {
      const related = relatedArticles(a, drafts, now, true);
      expect(related).toHaveLength(3);
      expect(new Set(related.map(r => r.slug)).size).toBe(3);
      expect(related.some(r => r.slug === a.slug)).toBe(false);
    }
  });
  it("requires publication, image permission and genuine matching review metadata", () => {
    const a = approved(drafts[0]!);
    expect(isPublished(a, now)).toBe(true);
    for (const status of ["draft", "awaiting-review", "approved", "review-required"] as const) expect(isPublished({ ...a, status }, now)).toBe(false);
    expect(isPublished({ ...a, image: { ...a.image, approved: false } }, now)).toBe(false);
    const missing = structuredClone(a); delete missing.review;
    expect(isPublished(missing, now)).toBe(false);
    expect(isPublished({ ...a, title: "Unreviewed edit" }, now)).toBe(false);
    expect(isPublished({ ...a, publishedAt: "2099-01-01" }, now)).toBe(false);
    expect(isPublished({ ...a, review: { ...a.review!, approvedAt: "2026-10-01" } }, now)).toBe(false);
    expect(isPublished({ ...a, review: { ...a.review!, reviewedAt: "invalid" } }, now)).toBe(false);
  });
});
describe("editorial library", () => {
  it("uses the same header markup with home anchors resolved on article pages", () => {
    const home = renderToStaticMarkup(createElement(SiteHeader, { onBook: () => {}, onHome: true }));
    const article = renderToStaticMarkup(createElement(SiteHeader, { onBook: () => {} }));
    expect(home.replaceAll('href="#', 'href="/#')).toBe(article);
    expect(article).toContain('href="/#treatments"');
    expect(article).toContain('aria-label="Open menu"');
  });
  it("routes navigation to the homepage anchor and redirects the old listing", () => {
    expect(drafts.slice(0, 3).map(readingMinutes)).toEqual([6, 8, 5]);
    expect(PRIMARY_NAVIGATION).toContainEqual(["Clinical Insights", "/#journal"]);
    expect(() => JournalPage()).toThrow("REDIRECT:/#journal");
  });
  it("renders full preview pages, clear review notices and exactly three linked neighbours", async () => {
    for (const a of drafts) {
      const html = renderToStaticMarkup(await ArticlePage({ params: Promise.resolve({ slug: a.slug }) }));
      expect(html).toContain("Awaiting clinical review.");
      expect(html).toContain('role="tabpanel"');
      expect(html).toContain("Continue Exploring");
      expect(html).toContain("At a glance");
      expect(html).toContain('aria-label="Article topics"');
      expect(html).toContain('aria-selected="true"');
      expect(html).toContain("On this page: ");
      expect(html).not.toContain('href="#overview"');
      expect(a.overview).toHaveLength(5);
      expect((html.match(/role="tabpanel"/g) ?? []).length).toBe(1);
      expect(html).not.toContain("Reviewed by Dr Eleanor Hart");
      for (const other of drafts.filter(d => d.slug !== a.slug)) expect(html).toContain(`href="/advice-journal/${other.slug}"`);
      expect((html.match(/after:absolute/g) ?? []).length).toBe(3);
      const card = renderToStaticMarkup(createElement(ArticleCard, { article: a }));
      expect(card).toContain(`href="/advice-journal/${a.slug}"`);
      expect(card).toContain("h-36");
      expect(card).toContain("Awaiting clinical review");
    }
    await expect(ArticlePage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow("NOT_FOUND");
  });
  it("provides unique preview metadata with noindex and correct canonical/images", async () => {
    vi.stubEnv("SITE_URL", "https://example.test");
    const titles = [];
    for (const a of drafts) {
      const meta = await generateMetadata({ params: Promise.resolve({ slug: a.slug }) });
      titles.push(meta.title);
      expect(meta.robots).toEqual({ index: false, follow: true });
      expect(meta.alternates?.canonical).toBe(`https://example.test/advice-journal/${a.slug}`);
      expect(meta.openGraph?.images).toEqual([{ url: `https://example.test${a.image.src}`, alt: a.image.alt }]);
    }
    expect(new Set(titles).size).toBe(4);
    await expect(generateMetadata({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow("NOT_FOUND");
  });
  it("has unique routes, images, descriptions and complete reference-linked content", () => {
    expect(drafts.length).toBeGreaterThanOrEqual(4);
    for (const field of ["slug", "seoDescription"] as const) expect(new Set(drafts.map(a => a[field])).size).toBe(drafts.length);
    expect(new Set(drafts.map(a => a.image.src)).size).toBe(drafts.length);
    for (const a of drafts) {
      expect(a.slug).toMatch(/^[a-z0-9-]+$/);
      expect(existsSync(path.join(process.cwd(), "public", a.image.src))).toBe(true);
      expect(a.image.alt.length).toBeGreaterThan(20);
      expect(a.sections.length).toBeGreaterThanOrEqual(8);
      expect(new Set(a.sections.map(s => s.id)).size).toBe(a.sections.length);
      expect(a.faqs.length).toBeGreaterThanOrEqual(3);
      expect(readingMinutes(a)).toBeGreaterThanOrEqual(4);
      for (const s of a.sections) for (const ref of s.references) expect(a.references[ref - 1]?.url).toMatch(/^https:\/\//);
    }
  });
  it("selects exactly three distinct approved neighbours and never the current article", () => {
    const library = drafts.map(approved);
    for (const a of library) {
      const related = relatedArticles(a, [...library, library[1]!, drafts[0]!], now);
      expect(related).toHaveLength(3);
      expect(new Set(related.map(r => r.slug)).size).toBe(3);
      expect(related.some(r => r.slug === a.slug)).toBe(false);
    }
    expect(relatedArticles(library[0]!, [library[0]!, ...drafts], now)).toEqual([]);
  });
  it("produces valid, safely escaped structured data without fabricated author claims", () => {
    const a = approved(drafts[0]!);
    a.title = "</script><script>test</script>";
    const json = safeJsonLd(articleStructuredData(a, "https://example.test"));
    expect(json).not.toContain("<");
    const parsed = JSON.parse(json);
    expect(parsed[0].headline).toBe(a.title);
    expect(parsed[0].author).toBeUndefined();
    expect(parsed[1].itemListElement).toHaveLength(3);
  });
  it("does not invent a canonical origin", () => {
    for (const invalid of ["", "invalid", "http://example.test", "https://secret:password@example.test"]) {
      vi.stubEnv("SITE_URL", invalid); expect(journalOrigin()).toBeUndefined(); expect(sitemap()).toEqual([]);
    }
    vi.stubEnv("SITE_URL", "https://example.test/"); expect(journalOrigin()).toBe("https://example.test");
  });
});


describe("educational article layouts", () => {
  for (const article of drafts.slice(0, 3)) it(`preserves all content and prepares five distinct image positions for ${article.slug}`, () => {
    const sections = article.sections.map(section => renderToStaticMarkup(createElement(EducationalSection, { article, section })));
    for (const [index, section] of article.sections.entries()) {
      for (const paragraph of section.paragraphs) {
        const escaped = renderToStaticMarkup(createElement("p", null, paragraph)).slice(3, -4);
        expect(sections[index]).toContain(escaped);
      }
      for (const number of section.references) expect(sections[index]).toContain(`href="${article.references[number - 1]!.url}"`);
    }
    const html = sections.join("");
    const slots = [...html.matchAll(/data-image-slot="([^"]+)"/g)].map(match => match[1]);
    expect(slots).toHaveLength(5);
    expect(new Set(slots).size).toBe(5);
    expect((html.match(/data-image-alt=/g) ?? [])).toHaveLength(5);
    expect(html).not.toContain("<img");
    expect(html).toContain("aspect-[16/9]");
    expect(html).toContain("aspect-[4/3]");
    if (article.slug.includes("plantar") || article.slug.includes("orthotics")) expect(html).toContain("<table");
  });
});
