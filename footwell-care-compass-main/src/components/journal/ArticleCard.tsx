import Image from "next/image";
import Link from "next/link";
import { isPublished, readingMinutes, type JournalArticle } from "@/lib/journal";
export function ArticleCard({ article, showCategory = false }: { article: JournalArticle; showCategory?: boolean }) {
  const reviewed = isPublished(article);
  return <article className="group relative rounded-2xl border bg-card p-7 transition-shadow hover:shadow-xl hover:shadow-primary/5 focus-within:ring-2 focus-within:ring-ring">
    <Image src={article.image.src} alt={article.image.alt} width={1200} height={800} sizes="(max-width: 767px) 100vw, 33vw" className="mb-6 h-36 w-full rounded-xl object-cover" />
    {showCategory && <p className="mb-2 text-xs uppercase tracking-widest text-accent">{article.category}</p>}
    <p className="text-xs text-muted-foreground">{readingMinutes(article)} min read · {reviewed ? `Reviewed by ${article.review!.name}` : "Awaiting clinical review"}</p>
    <h3 className="mt-3 text-xl leading-snug text-heading transition-colors group-hover:text-accent"><Link href={`/advice-journal/${article.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">{article.title}</Link></h3>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
  </article>;
}
