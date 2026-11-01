import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visibleArticle, visibleArticles } from "@/server/journal/articles";
import { articleStructuredData, isPublished, journalOrigin, readingMinutes, relatedArticles, safeJsonLd } from "@/lib/journal";
import { JournalShell } from "@/components/journal/JournalShell";
import { JournalBooking } from "@/components/journal/JournalBooking";
import { ArticleCard } from "@/components/journal/ArticleCard";
import { ArticleContents } from "@/components/journal/ArticleContents";
import styles from "./article.module.css";
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
    <article className={`${styles["article"]} mx-auto max-w-7xl px-5 py-10 sm:py-16`}>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href="/">Home</Link> / <Link href="/#journal">Clinical Insights</Link> / <span aria-current="page">{article.title}</span></nav>
      <header className="mx-auto my-10 max-w-4xl"><p className="text-xs uppercase tracking-widest text-accent">{article.category}</p><h1 className="mt-5 font-serif text-4xl leading-tight text-heading sm:text-6xl">{article.title}</h1><p className="mt-6 text-xl leading-relaxed text-muted-foreground">{article.excerpt}</p><p className="mt-6 text-sm">{readingMinutes(article)} min read{reviewed && ` · Reviewed by ${article.review!.name}`}</p>{reviewed ? <p className="mt-2 text-sm text-muted-foreground">Published {displayDate(article.publishedAt!)} · Last reviewed {displayDate(article.review!.reviewedAt)}</p> : <aside role="note" className="mt-6 rounded-xl border border-gold/40 bg-secondary p-5 text-sm leading-relaxed"><strong>Awaiting clinical review.</strong> This educational draft has not yet been approved by a practitioner. Do not use it as a personal diagnosis or treatment plan; discuss your symptoms with a qualified clinician.</aside>}</header>
      <figure className="mx-auto max-w-5xl"><Image src={article.image.src} alt={article.image.alt} width={1200} height={800} sizes="(max-width: 1024px) 100vw, 1024px" preload className="h-auto w-full rounded-3xl" /><figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">{article.image.source}</figcaption></figure>
      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
      <ArticleContents headings={[...(article.overview ? [{ id: "at-a-glance", heading: "At a glance" }] : []), ...article.sections.map(({ id, heading }) => ({ id, heading })), { id: "questions", heading: "Common questions" }, { id: "references", heading: "References & further reading" }]} />
      <div className="min-w-0 max-w-prose">
        {article.overview && <section id="at-a-glance" className="mb-12 rounded-3xl bg-secondary p-6 sm:p-8"><p className="text-xs uppercase tracking-widest text-accent">The essentials</p><h2 className="mt-2 font-serif text-3xl text-heading">At a glance</h2><ul className="mt-6 list-disc space-y-4 pl-5 leading-7 marker:text-accent">{article.overview.map(point => <li key={point}>{point}</li>)}</ul></section>}
        <p role="note" className="mb-12 border-l-2 border-accent pl-5 text-sm leading-relaxed text-muted-foreground">General educational information, not a personal diagnosis or treatment plan. Seek professional advice about your own symptoms.</p>
        {article.sections.map(s => <section key={s.id} id={s.id} className={`mb-12 ${s.presentation === "warning" ? "rounded-2xl border-l-2 border-gold bg-secondary p-6 sm:p-8" : ""}`}><h2 className="font-serif text-3xl leading-snug text-heading">{s.heading}</h2>
          {s.presentation === "bullets" ? <ul className="mt-5 list-disc space-y-4 pl-5 leading-8 marker:text-accent">{s.paragraphs.map(p => <li key={p}>{p}</li>)}</ul> : s.presentation === "steps" ? <ol className="mt-5 list-decimal space-y-5 pl-6 leading-8 marker:font-semibold marker:text-accent">{s.paragraphs.map(p => <li key={p} className="pl-2">{p}</li>)}</ol> : s.paragraphs.map((p,i) => <p key={i} className="mt-5 text-base leading-8">{p}</p>)}
          {s.comparison && <div className="mt-8 overflow-x-auto rounded-2xl border" role="region" aria-label="Orthoses comparison" tabIndex={0}><table className="w-full min-w-[32rem] border-collapse text-left text-sm leading-7"><caption className="p-5 text-left font-serif text-xl text-heading">Prefabricated and custom orthoses: practical differences</caption><thead className="bg-secondary"><tr><th scope="col" className="p-4">Consideration</th><th scope="col" className="p-4">Prefabricated</th><th scope="col" className="p-4">Custom-made</th></tr></thead><tbody>{s.comparison.map(row => <tr key={row.label} className="border-t"><th scope="row" className="p-4 align-top font-medium">{row.label}</th><td className="p-4 align-top">{row.prefabricated}</td><td className="p-4 align-top">{row.custom}</td></tr>)}</tbody></table></div>}
          <p className="mt-4 text-xs text-muted-foreground">Sources: {s.references.map(n => <a key={n} href={`#reference-${n}`} className="mr-3 underline">[{n}]</a>)}</p></section>)}
        <section id="questions"><h2 className="font-serif text-3xl text-heading">Common questions</h2><div className="mt-5 divide-y rounded-2xl border px-5">{article.faqs.map(f => <details key={f.question} className="py-5"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-4 leading-7 text-muted-foreground">{f.answer}</p></details>)}</div></section>
        <section id="references" className="mt-10"><h2 className="font-serif text-3xl text-heading">References & further reading</h2><ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-relaxed">{article.references.map((r,i) => <li id={`reference-${i+1}`} key={r.url}><a href={r.url} className="underline underline-offset-4">{r.organisation}: {r.title}</a><span className="block text-muted-foreground">Accessed {displayDate(r.accessedAt)}</span></li>)}</ol></section>
      </div></div>
      <aside className="my-14 rounded-3xl bg-secondary p-8"><h2 className="font-serif text-3xl text-heading">Discuss your next step</h2><p className="my-4 max-w-2xl leading-relaxed text-muted-foreground">Bring your questions to an individual assessment. Online appointments are requests pending clinic review.</p><JournalBooking /></aside>
      <section aria-labelledby="related-title"><h2 id="related-title" className="mb-6 font-serif text-3xl text-heading">Continue Exploring</h2>{related.length > 0 && <div className="grid gap-6 md:grid-cols-3">{related.map(a => <ArticleCard key={a.slug} article={a} showCategory />)}</div>}{related.length < 3 && <p className="mt-4 text-sm text-muted-foreground">More clinically reviewed guides are being prepared.</p>}</section>
    </article></JournalShell>;
}
