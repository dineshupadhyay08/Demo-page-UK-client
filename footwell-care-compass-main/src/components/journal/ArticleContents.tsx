"use client";
import { useEffect, useState } from "react";
import { JournalBooking } from "@/components/journal/JournalBooking";

type Heading = { id: string; heading: string };
export function ArticleContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = headings[0]?.id ?? "";
      for (const { id } of headings) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 160) current = id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headings]);
  const links = <ol className="space-y-1">{headings.map(({ id, heading }) => <li key={id}><a href={`#${id}`} aria-current={active === id ? "location" : undefined} className="block rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm leading-relaxed text-muted-foreground hover:text-heading aria-[current=location]:border-accent aria-[current=location]:bg-accent-soft aria-[current=location]:text-heading">{heading}</a></li>)}</ol>;
  return <aside className="lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
    <nav aria-label="Article contents" className="hidden lg:block"><h2 className="mb-5 font-serif text-xl text-heading">On this page</h2>{links}<div className="mt-6 border-t pt-6"><JournalBooking /></div></nav>
    <details className="rounded-2xl border bg-card p-5 lg:hidden"><summary className="cursor-pointer font-medium text-heading">On this page</summary><nav aria-label="Article contents" className="mt-4">{links}<div className="mt-5"><JournalBooking /></div></nav></details>
  </aside>;
}
