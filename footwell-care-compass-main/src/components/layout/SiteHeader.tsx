"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShieldCheck, Phone, MapPin, Award, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ActionButton } from "@/components/shared/ActionButton";
import { CLINIC, PRIMARY_NAVIGATION } from "@/config/clinic";

export function SiteHeader({ onBook, onHome = false }: { onBook: () => void; onHome?: boolean }) {
  const [menu, setMenu] = useState(false);
  const open = onBook;
  const homeHref = (href: string) => !onHome && href.startsWith("#") ? "/" + href : href;
  return <>
      {/* Trust bar */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden />HCPC Registered</span>
            <span className="hidden items-center gap-1.5 sm:flex"><Award className="h-3.5 w-3.5 text-gold" aria-hidden />Royal College of Podiatry Member</span>
            <span className="hidden items-center gap-1.5 md:flex"><MapPin className="h-3.5 w-3.5" aria-hidden />Marylebone, Central London</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`tel:${CLINIC.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:underline"><Phone className="h-3.5 w-3.5" aria-hidden />{CLINIC.phone}</a>
            <a href={homeHref("#symptoms")} className="hidden underline-offset-4 hover:underline sm:inline">Check Symptoms</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 xl:gap-0">
          <a href={homeHref("#")} className="flex shrink-0 items-center gap-2.5" aria-label={`${CLINIC.name} home`}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Image src="/brand-mark.svg" alt="" width={20} height={20} className="h-5 w-5" /></span>
            <span className="font-serif text-xl text-heading">Footwell<span className="text-accent"> Podiatry</span></span>
          </a>
          <nav className="hidden shrink-0 items-center gap-5 xl:ml-4 xl:flex" aria-label="Main">
            {PRIMARY_NAVIGATION.map(([l, h]) => <a key={h} href={homeHref(h)} className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-heading">{l}</a>)}
            <Link href="/courses" className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-heading">Online Courses</Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2 xl:ml-4">
            <ThemeToggle />
            <span className="hidden sm:block"><ActionButton onClick={() => open()}>Request Appointment</ActionButton></span>
            <button className="grid h-11 w-11 place-items-center rounded-full border xl:hidden" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(true)}><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-primary/40" onClick={() => setMenu(false)} />
          <div className="absolute right-0 top-0 flex h-full w-80 max-w-full flex-col gap-1 bg-background p-6 animate-in slide-in-from-right">
            <button className="mb-4 self-end grid h-11 w-11 place-items-center rounded-full border" aria-label="Close menu" onClick={() => setMenu(false)}><X className="h-5 w-5" /></button>
            {PRIMARY_NAVIGATION.map(([l, h]) => <a key={h} href={homeHref(h)} onClick={() => setMenu(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-secondary">{l}</a>)}
            <Link href="/courses" onClick={() => setMenu(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-secondary">Online Courses</Link>
            <ActionButton className="mt-4" onClick={() => { setMenu(false); open(); }}>Request Appointment</ActionButton>
          </div>
        </div>
      )}

  </>;
}
