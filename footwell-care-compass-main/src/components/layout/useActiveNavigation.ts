"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const sections = ["services", "courses", "journal", "reviews"] as const;
type ActiveSection = "home" | (typeof sections)[number];

export function useActiveNavigation() {
  const pathname = usePathname();
  const [section, setSection] = useState<ActiveSection>("home");

  useEffect(() => {
    if (pathname !== "/") return;
    const elements = sections.flatMap(id => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    const update = () => {
      const headerHeight = document.querySelector("header > div")?.getBoundingClientRect().height ?? 68;
      const readingLine = Math.max(headerHeight + 1, window.innerHeight * 0.35);
      let current: ActiveSection = "home";
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= readingLine) current = element.id as ActiveSection;
      }
      setSection(current);
    };
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      const headerHeight = document.querySelector("header > div")?.getBoundingClientRect().height ?? 68;
      const readingLine = Math.max(headerHeight + 1, window.innerHeight * 0.35);
      observer = new IntersectionObserver(update, {
        rootMargin: `-${headerHeight}px 0px -${Math.max(0, window.innerHeight - readingLine)}px 0px`, threshold: 0,
      });
      elements.forEach(element => observer.observe(element));
    };
    observe();
    window.addEventListener("resize", observe);
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    window.addEventListener("pageshow", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", observe);
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
      window.removeEventListener("pageshow", update);
    };
  }, [pathname]);

  return (href: string) => {
    if (pathname === "/") {
      const target = href.split("#")[1];
      return target ? target === section : href === "/" && section === "home";
    }
    if (pathname === "/courses" || pathname.startsWith("/courses/")) {
      return href === "/#courses" || href === "/courses";
    }
    if (pathname.startsWith("/advice-journal")) return href === "#journal" || href === "/#journal";
    return href === pathname;
  };
}
