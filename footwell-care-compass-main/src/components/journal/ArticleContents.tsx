"use client";
import { useRef, useEffect, useState, type ReactNode } from "react";
import { JournalBooking } from "@/components/journal/JournalBooking";

type Topic = { id: string; title: string; content: ReactNode };

export function ArticleContents({ topics, introduction }: { topics: Topic[]; introduction: ReactNode }) {
  const [activeId, setActiveId] = useState<string>(topics[0]?.id || "");
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mobileSelector = useRef<HTMLDetailsElement>(null);

  // Intersection Observer for tracking active section during scroll
  useEffect(() => {
    // Track all observed sections and their visibility
    const observedSections = new Map<string, number>();

    const callback = (entries: IntersectionObserverEntry[]) => {
      // Update the map with visibility ratios
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).id;
        if (entry.isIntersecting) {
          observedSections.set(id, entry.intersectionRatio);
        } else {
          observedSections.delete(id);
        }
      });

      // Find the section that is most visible (highest intersection ratio)
      // If tied, prefer the one closest to the top of the viewport
      let activeId: string | null = null;
      let maxRatio = 0;
      let minDistance = Infinity;

      observedSections.forEach((ratio: number, id: string) => {
        const element = document.getElementById(id);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const distanceFromTop = rect.top;

        if (ratio > maxRatio) {
          maxRatio = ratio;
          activeId = id;
          minDistance = Math.abs(distanceFromTop);
        } else if (
          ratio === maxRatio &&
          Math.abs(distanceFromTop) < minDistance &&
          distanceFromTop >= 0
        ) {
          // If ratios are equal, prefer the section closest to the top
          activeId = id;
          minDistance = Math.abs(distanceFromTop);
        }
      });

      if (activeId) {
        setActiveId(activeId);
      }
    };

    const observer = new IntersectionObserver(callback, {
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    });

    // Observe all topic sections
    topics.forEach((topic) => {
      const element = document.getElementById(topic.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [topics]);

  const handleSidebarClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Close mobile selector after navigation
      if (mobileSelector.current) {
        mobileSelector.current.open = false;
      }
    }
  };

  const activeTopic = topics.find((t) => t.id === activeId) || topics[0];

  return (
    <div className="grid items-start gap-6 md:grid-cols-[12.5rem_minmax(0,1fr)] lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10">
      {/* Desktop Sidebar */}
      <aside className="md:sticky md:top-28">
        <div className="hidden rounded-3xl border bg-background p-3 md:block">
          <h2 className="px-2 py-3 font-serif text-xl text-heading">On this page</h2>
          <nav ref={sidebarRef} aria-label="Article topics" className="max-h-[calc(100svh-20rem)] overflow-y-auto">
            <ul className="space-y-1">
              {topics.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSidebarClick(item.id);
                    }}
                    className={`block rounded-xl px-3 py-2.5 text-left text-sm leading-relaxed transition-colors ${
                      activeId === item.id
                        ? "bg-accent-soft font-semibold text-heading"
                        : "text-heading hover:bg-secondary"
                    }`}
                  >
                    {index > 0 ? `${index}. ` : ""}{item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-5 border-t pt-5">
            <JournalBooking />
          </div>
        </div>

        {/* Mobile Selector */}
        <details ref={mobileSelector} className="relative rounded-2xl border bg-card md:hidden">
          <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-heading">
            On this page: {activeTopic?.title}
          </summary>
          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[60svh] overflow-y-auto rounded-2xl border bg-card p-2 shadow-lg">
            <nav aria-label="Article topics (mobile)" className="space-y-1">
              {topics.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSidebarClick(item.id);
                  }}
                  className={`block rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                    activeId === item.id
                      ? "bg-accent-soft font-semibold text-heading"
                      : "text-heading hover:bg-secondary"
                  }`}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </details>
      </aside>

      {/* Main Content */}
      <div className="min-w-0">
        {introduction}
        <div ref={contentRef} className="mt-7 space-y-16">
          {topics.map((topic) => (
            <section
              key={topic.id}
              id={topic.id}
              className="scroll-mt-28"
            >
              {topic.content}
            </section>
          ))}
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          General education, not a personal diagnosis or treatment plan.
        </p>
      </div>
    </div>
  );
}
