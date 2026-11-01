import type { MetadataRoute } from "next";
import { journalOrigin } from "@/lib/journal";
import { publishedArticles } from "@/server/journal/articles";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = journalOrigin();
  if (!origin) return [];
  return [{ url: origin }, ...publishedArticles().map(a => ({ url: `${origin}/advice-journal/${a.slug}`, lastModified: a.updatedAt }))];
}
