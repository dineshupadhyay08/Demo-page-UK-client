import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visibleArticle, visibleArticles } from "@/server/journal/articles";
import { articleStructuredData, isPublished, journalOrigin, readingMinutes, relatedArticles, safeJsonLd } from "@/lib/journal";
import { JournalShell } from "@/components/journal/JournalShell";
import { JournalBooking } from "@/components/journal/JournalBooking";
import { ArticleCard } from "@/components/journal/ArticleCard";
type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = visibleArticle((await params).slug);
  if (!article) notFound();
  const origin = journalOrigin();
  const url = origin ? `${origin}/advice-journal/${article.slug}` : undefined;
  const images = origin ? [{ url: `${origin}${article.image.src}`, alt: article.image.alt }] : [];
  return { title: `${article.title} | Footwell Podiatry`, description: article.seoDescription,
    ...(url ? { alternates: { canonical: url } } : {}), robots: { index: !!origin && isPublished(article), follow: true },
    openGraph: { title: article.title, description: article.seoDescription, type: "article", images, ...(url ? { url } : {}), ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}) },
    twitter: { card: "summary_large_image", title: article.title, description: article.seoDescription, images } };
}
const displayDate = (value: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", dateStyle: "long" }).format(new Date(value));
export default async function ArticlePage({ params }: Props) {
  const article = visibleArticle((await params).slug);
  if (!article) notFound();
  const reviewed = isPublished(article);
  const related = relatedArticles(article, visibleArticles(), new Date(), true);
  const origin = journalOrigin();
  return <JournalShell>{origin && reviewed && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleStructuredData(article, origin)) }} />}
    <article className="mx-auto max-w-7xl px-5 py-10 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href="/">Home</Link> / <Link href="/#journal">Clinical Insights</Link> / <span aria-current="page">{article.title}</span></nav>
      <header className="mx-auto my-10 max-w-4xl"><p className="text-xs uppercase tracking-widest text-accent">{article.category}</p><h1 className="mt-5 font-serif text-4xl leading-tight text-heading sm:text-6xl">{article.title}</h1><p className="mt-6 text-xl leading-relaxed text-muted-foreground">{article.excerpt}</p><p className="mt-6 text-sm">{readingMinutes(article)} min read{reviewed && ` · Reviewed by ${article.review!.name}`}</p>{reviewed ? <p className="mt-2 text-sm text-muted-foreground">Published {displayDate(article.publishedAt!)} · Last reviewed {displayDate(article.review!.reviewedAt)}</p> : <aside role="note" className="mt-6 rounded-xl border border-gold/40 bg-secondary p-5 text-sm leading-relaxed"><strong>Awaiting clinical review.</strong> This educational draft has not yet been approved by a practitioner. Do not use it as a personal diagnosis or treatment plan; discuss your symptoms with a qualified clinician.</aside>}</header>
      <figure><Image src={article.image.src} alt={article.image.alt} width={1200} height={800} sizes="(max-width: 1280px) 100vw, 1200px" preload className="max-h-[32rem] w-full rounded-3xl object-cover" /><figcaption className="mt-3 text-xs text-muted-foreground">{article.image.source}</figcaption></figure>
      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[15rem_minmax(0,1fr)]"><nav aria-label="On this page" className="rounded-2xl bg-secondary p-6 lg:sticky lg:top-6"><h2 className="font-serif text-xl">On this page</h2><ol className="mt-4 space-y-3 text-sm">{article.sections.map(s => <li key={s.id}><a href={`#${s.id}`} className="hover:underline">{s.heading}</a></li>)}<li><a href="#questions">Common questions</a></li><li><a href="#references">References</a></li></ol></nav>
      <div className="max-w-prose"><p role="note" className="mb-10 border-l-2 border-accent pl-5 text-sm leading-relaxed text-muted-foreground">General educational information, not a personal diagnosis or treatment plan. Seek professional advice about your own symptoms.</p>
        {article.sections.map(s => <section key={s.id} id={s.id} className="mb-10 scroll-mt-8"><h2 className="font-serif text-3xl leading-snug text-heading">{s.heading}</h2>{s.paragraphs.map((p,i) => <p key={i} className="mt-5 text-base leading-8">{p}</p>)}<p className="mt-3 text-xs text-muted-foreground">Sources: {s.references.map(n => <a key={n} href={`#reference-${n}`} className="mr-3 underline">[{n}]</a>)}</p></section>)}
        <section id="questions"><h2 className="font-serif text-3xl text-heading">Common questions</h2><div className="mt-5 divide-y rounded-2xl border px-5">{article.faqs.map(f => <details key={f.question} className="py-5"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-4 leading-7 text-muted-foreground">{f.answer}</p></details>)}</div></section>
        <section id="references" className="mt-10"><h2 className="font-serif text-3xl text-heading">References & further reading</h2><ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-relaxed">{article.references.map((r,i) => <li id={`reference-${i+1}`} key={r.url}><a href={r.url} className="underline underline-offset-4">{r.organisation}: {r.title}</a><span className="block text-muted-foreground">Accessed {displayDate(r.accessedAt)}</span></li>)}</ol></section>
      </div></div>
      <aside className="my-14 rounded-3xl bg-secondary p-8"><h2 className="font-serif text-3xl text-heading">Discuss your next step</h2><p className="my-4 max-w-2xl leading-relaxed text-muted-foreground">Bring your questions to an individual assessment. Online appointments are requests pending clinic review.</p><JournalBooking /></aside>
      <section aria-labelledby="related-title"><h2 id="related-title" className="mb-6 font-serif text-3xl text-heading">Continue Exploring</h2>{related.length > 0 && <div className="grid gap-6 md:grid-cols-3">{related.map(a => <ArticleCard key={a.slug} article={a} showCategory />)}</div>}{related.length < 3 && <p className="mt-4 text-sm text-muted-foreground">More clinically reviewed guides are being prepared.</p>}</section>
    </article></JournalShell>;
}
