"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useActiveNavigation } from "@/components/layout/useActiveNavigation";

const links = [["Home", "/"], ["Services", "#services"], ["Courses", "/#courses"], ["Advice & Journal", "#journal"], ["Reviews", "/#reviews"]] as const;

export function HomeHeader({ onBook }: { onBook: () => void }) {
  const isActive = useActiveNavigation();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  return <header className="sticky top-0 z-40 border-b border-[#E8E1EF] bg-white text-[#231A31]">
    <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center justify-between gap-4 px-5 py-2 sm:px-8 lg:px-12">
      <Link href="/" aria-label="Footwell Podiatry home" className="flex shrink-0 items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-[#7136BA]"><Image src="/brand-mark.svg" alt="" width={25} height={25} /></span>
        <span className="block text-xl font-bold leading-tight sm:text-[22px]">Footwell Podiatry</span>
      </Link>
      <nav aria-label="Main" className="hidden items-center gap-6 text-[15px] lg:flex">
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={isActive(href) ? "location" : undefined} className={`border-b-2 py-2.5 transition-colors hover:text-[#7136BA] ${isActive(href) ? "border-[#7136BA] text-[#7136BA]" : "border-transparent"}`}>{label}</Link>)}
      </nav>
      <button type="button" onClick={onBook} className="hidden min-h-11 shrink-0 rounded-2xl bg-[#7136BA] px-[18px] text-sm font-semibold text-white transition-colors hover:bg-[#5B2EA6] lg:block">Book Appointment</button>
      <button ref={menuButton} type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="home-navigation" onClick={() => setOpen(!open)} className="grid size-11 place-items-center rounded-xl border border-[#E8E1EF] lg:hidden">{open ? <X aria-hidden /> : <Menu aria-hidden />}</button>
    </div>
    {open && <nav id="home-navigation" aria-label="Mobile navigation" className="space-y-1 border-t border-[#E8E1EF] px-5 py-4 lg:hidden">
      {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={isActive(href) ? "location" : undefined} className={`block rounded-lg border-b-2 px-3 py-3 hover:bg-[#F5F0FF] ${isActive(href) ? "border-[#7136BA] text-[#7136BA]" : "border-transparent"}`}>{label}</Link>)}
      <button type="button" onClick={() => { setOpen(false); onBook(); }} className="min-h-12 w-full rounded-xl bg-[#7136BA] px-6 font-semibold text-white hover:bg-[#5B2EA6]">Book Appointment</button>
    </nav>}
  </header>;
}
