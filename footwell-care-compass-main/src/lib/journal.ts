import { createHash } from "node:crypto";
export type EditorialStatus = "draft" | "awaiting-review" | "approved" | "published" | "review-required";
export type JournalArticle = {
  slug: string; title: string; excerpt: string; category: string; tags: string[];
  status: EditorialStatus; updatedAt: string; publishedAt?: string;
  publicPreview?: boolean;
  readingTimeMinutes?: number;
  review?: { name: string; reviewedAt: string; approvedAt: string; revision: string };
  image: { src: string; alt: string; source: string; rights: string; approved: boolean };
  sections: { id: string; heading: string; paragraphs: string[]; references: number[] }[];
  faqs: { question: string; answer: string }[];
  references: { organisation: string; title: string; url: string; accessedAt: string }[];
  seoDescription: string;
};
export function contentRevision(article: JournalArticle): string {
  return createHash("sha256").update(JSON.stringify({ title: article.title, excerpt: article.excerpt, category: article.category, tags: article.tags, sections: article.sections, faqs: article.faqs, references: article.references, image: article.image, seoDescription: article.seoDescription })).digest("hex");
}
export function isPublished(article: JournalArticle, now = new Date()): boolean {
  const review = article.review;
  return article.status === "published" && article.image.approved && !!review?.name.trim()
    && review.revision === contentRevision(article)
    && Number.isFinite(Date.parse(review.reviewedAt)) && Date.parse(review.reviewedAt) <= now.getTime()
    && Number.isFinite(Date.parse(review.approvedAt)) && Date.parse(review.approvedAt) <= now.getTime()
    && Date.parse(review.approvedAt) >= Date.parse(review.reviewedAt)
    && !!article.publishedAt && Date.parse(article.publishedAt) <= now.getTime()
    && Date.parse(article.publishedAt) >= Date.parse(review.approvedAt);
}
export function readingMinutes(article: JournalArticle): number {
  // Preserve supplied editorial estimates; calculate for articles without one.
  if (Number.isInteger(article.readingTimeMinutes) && article.readingTimeMinutes! > 0) return article.readingTimeMinutes!;
  const text = [article.title, article.excerpt, ...article.sections.flatMap(s => [s.heading, ...s.paragraphs]), ...article.faqs.flatMap(f => [f.question, f.answer])].join(" ");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}
export function isVisible(article: JournalArticle, now = new Date()): boolean {
  return isPublished(article, now) || (article.status === "awaiting-review" && article.publicPreview === true);
}
export function relatedArticles(article: JournalArticle, library: readonly JournalArticle[], now = new Date(), includePreviews = false): JournalArticle[] {
  const unique = new Map(library.filter(a => a.slug !== article.slug && (includePreviews ? isVisible(a, now) : isPublished(a, now))).map(a => [a.slug, a]));
  const score = (a: JournalArticle) => (isPublished(a, now) ? 1000 : 0) + (a.category === article.category ? 100 : 0) + a.tags.filter(tag => article.tags.includes(tag)).length * 10;
  return [...unique.values()].sort((a, b) => score(b) - score(a) || a.slug.localeCompare(b.slug)).slice(0, 3);
}
export function journalOrigin(): string | undefined {
  const value = process.env["SITE_URL"];
  if (!value) return undefined;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.origin : undefined; } catch { return undefined; }
}
export function articleStructuredData(article: JournalArticle, origin: string) {
  const url = `${origin}/advice-journal/${article.slug}`;
  return [
    { "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`, headline: article.title, description: article.seoDescription,
      mainEntityOfPage: url, image: `${origin}${article.image.src}`, datePublished: article.publishedAt, dateModified: article.updatedAt, inLanguage: "en-GB" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Clinical Insights", item: `${origin}/#journal` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ] },
  ];
}
export function safeJsonLd(value: unknown): string { return JSON.stringify(value).replace(/</g, "\\u003c"); }
