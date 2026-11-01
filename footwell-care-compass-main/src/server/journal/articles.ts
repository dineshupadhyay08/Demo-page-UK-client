import "server-only";
import content from "@/content/journal/articles.json";
import { isPublished, isVisible, type JournalArticle } from "@/lib/journal";

export const articles = content as JournalArticle[];
export function publishedArticles(): JournalArticle[] { return articles.filter(a => isPublished(a)); }
export function publishedArticle(slug: string): JournalArticle | undefined { return publishedArticles().find(a => a.slug === slug); }
export function visibleArticles(): JournalArticle[] { return articles.filter(a => isVisible(a)); }
export function visibleArticle(slug: string): JournalArticle | undefined { return visibleArticles().find(a => a.slug === slug); }
