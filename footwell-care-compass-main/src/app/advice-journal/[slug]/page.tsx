import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footprints, CircleDot, Layers, HandHeart, Cross, Leaf } from "lucide-react";
import { notFound } from "next/navigation";
import { visibleArticle, visibleArticles } from "@/server/journal/articles";
import { articleStructuredData, isPublished, journalOrigin, readingMinutes, relatedArticles, safeJsonLd } from "@/lib/journal";
import { JournalShell } from "@/components/journal/JournalShell";
import { JournalBooking } from "@/components/journal/JournalBooking";
import { ArticleCard } from "@/components/journal/ArticleCard";
import { EducationalSection } from "@/components/journal/EducationalSection";
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
  const isOrthotics = article.slug === "custom-orthotics-vs-off-the-shelf-insoles";
  const related = relatedArticles(article, visibleArticles(), new Date(), true);
  const overviewItems = article.slug === "recognising-early-signs-of-plantar-fasciitis" ? [
    { title: "What it is", icon: Footprints },
    { title: "Main symptoms", icon: CircleDot },
    { title: "Contributing factors", icon: Layers },
    { title: "What you can do", icon: HandHeart },
    { title: "Seek help if", icon: Cross },
  ] : article.slug === "custom-orthotics-vs-off-the-shelf-insoles" ? [
    { title: "Custom-made", icon: Footprints }, { title: "Ready-made", icon: Layers },
    { title: "Design and fit", icon: CircleDot }, { title: "Assessment", icon: Cross },
    { title: "Individual needs", icon: HandHeart },
  ] : article.slug === "preventing-recurrent-ingrown-nails" ? [
    { title: "What it is", icon: Footprints }, { title: "Contributing factors", icon: Layers },
    { title: "Prevention", icon: HandHeart }, { title: "Seek advice", icon: Cross },
    { title: "Treatment", icon: CircleDot },
  ] : [];
  const origin = journalOrigin();

  // Build topics for continuous scroll layout
  const topics = [
    { id: "at-a-glance", title: "At a glance", content: <section className="overflow-hidden rounded-3xl border border-accent/20 bg-secondary/20"><h2 className="flex items-center gap-3 bg-secondary/60 px-5 py-3 font-serif text-3xl text-heading"><Leaf aria-hidden="true" className="size-7 text-accent" />At a glance</h2><ul className="grid gap-y-6 px-5 py-6 text-sm leading-6 sm:grid-cols-2 xl:grid-cols-5">{article.overview?.map((point, index) => { const item = overviewItems[index]; const Icon = item?.icon; return <li key={point} className="px-4 text-center sm:border-l sm:border-accent/20 sm:first:border-0">{Icon && <Icon aria-hidden="true" strokeWidth={1.3} className="mx-auto mb-3 size-8 text-heading" />}{item && <h3 className="mb-2 font-semibold text-heading">{item.title}</h3>}{point}</li>; })}</ul></section> },
    ...article.sections.map(section => ({ id: section.id, title: section.heading, content: <EducationalSection key={section.id} article={article} section={section} /> })),
    { id: "questions", title: "Common questions", content: <section><h2 className="font-serif text-3xl text-heading">Common questions</h2><div className="mt-5 divide-y rounded-2xl border px-5">{article.faqs.map(f => <details key={f.question} open className="py-5"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-4 leading-7 text-muted-foreground">{f.answer}</p></details>)}</div></section> },
    { id: "references", title: "References and further reading", content: <section><h2 className="font-serif text-3xl text-heading">References and further reading</h2><ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-relaxed">{article.references.map((r,i) => <li id={`reference-${i+1}`} key={r.url}><a href={r.url} className="underline underline-offset-4">{r.organisation}: {r.title}</a><span className="block text-muted-foreground">Accessed {displayDate(r.accessedAt)}</span></li>)}</ol></section> },
  ];
  return <JournalShell>{origin && (reviewed || isOrthotics) && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleStructuredData(article, origin)) }} />}
    <article className={`${styles["article"]} mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-10`}>
      <ArticleContents topics={topics} introduction={<>{isOrthotics && <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap gap-2 text-xs text-muted-foreground"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/#journal">Advice &amp; Journal</Link><span aria-hidden="true">/</span><span aria-current="page">{article.title}</span></nav>}<header className="mb-8"><p className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">{article.category}</p><h1 className="mt-3 max-w-[24ch] font-serif text-4xl leading-tight text-heading sm:text-5xl">{article.title}</h1><p className="mt-4 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p><p className="mt-4 text-sm">{readingMinutes(article)} min read{reviewed && ` · Reviewed by ${article.review!.name}`}</p>{reviewed ? <p className="mt-2 text-sm text-muted-foreground">Published {displayDate(article.publishedAt!)} · Last reviewed {displayDate(article.review!.reviewedAt)}</p> : <aside role="note" className="mt-4 rounded-xl border border-gold/40 bg-secondary px-4 py-3 text-sm leading-relaxed"><strong>Awaiting clinical review.</strong> This educational draft has not yet been approved by a practitioner. Do not use it as a personal diagnosis or treatment plan; discuss your symptoms with a qualified clinician.</aside>}</header>
      <figure className=""><Image src={article.image.src} alt={article.image.alt} width={isOrthotics ? 757 : 1200} height={isOrthotics ? 332 : 800} sizes="(max-width: 1024px) 100vw, 1024px" preload className={isOrthotics ? "h-auto w-full rounded-3xl" : "aspect-[5/2] w-full rounded-3xl object-cover"} /><figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">{article.image.source}</figcaption></figure></>} />
      <div className="md:ml-[14rem] lg:ml-[16rem]">
      <aside className="my-14 rounded-3xl bg-secondary p-8"><h2 className="font-serif text-3xl text-heading">{isOrthotics ? "Not Sure Which Support Is Right for You?" : "Discuss your next step"}</h2><p className="my-4 max-w-2xl leading-relaxed text-muted-foreground">{isOrthotics ? "Discuss your symptoms, footwear and daily activities in an individual assessment. Online appointments are requests pending clinic review." : "Bring your questions to an individual assessment. Online appointments are requests pending clinic review."}</p><JournalBooking /></aside>
      <section aria-labelledby="related-title"><h2 id="related-title" className="mb-6 font-serif text-3xl text-heading">Continue Exploring</h2>{related.length > 0 && <div className="grid gap-6 md:grid-cols-3">{related.map(a => <ArticleCard key={a.slug} article={a} showCategory />)}</div>}{related.length < 3 && <p className="mt-4 text-sm text-muted-foreground">More clinically reviewed guides are being prepared.</p>}</section>
      </div>
    </article></JournalShell>;
}
