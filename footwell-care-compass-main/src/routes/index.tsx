"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import {
  Phone, MapPin, Star, ArrowRight, Clock, ScanLine, Printer,
  Microscope, CheckCircle2, ChevronDown, Mail,
} from "lucide-react";
import clinic from "@/assets/clinic.jpg";
import { BookingModal } from "@/components/booking/BookingModal";
import { PlatformPreviews } from "@/components/home/PlatformPreviews";
import { PractitionerProfile } from "@/components/home/PractitionerProfile";
import { SymptomFinder } from "@/components/home/SymptomFinder";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CLINIC, TREATMENT_CATEGORIES, TREATMENTS, type TreatmentCategory } from "@/config/clinic";

export function HomePage({ journalCards }: { journalCards: ReactNode }) {
  const [booking, setBooking] = useState<string | null>(null);
  const [cat, setCat] = useState<TreatmentCategory>("Routine Foot Care");
  const open = (t = "") => setBooking(t);

  return (
    <div className="min-h-screen">
      <SiteHeader onBook={() => open()} onHome />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <SectionEyebrow>Private podiatry · Marylebone</SectionEyebrow>
            <h1 className="text-4xl leading-[1.08] text-heading sm:text-5xl lg:text-6xl">
              Specialist podiatry and lower-limb care <em className="text-[#328673]">tailored to your movement.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Clinically precise assessment, evidence-based treatment and personalised plans that help patients of all ages move without pain.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionButton onClick={() => open()}>Request an Assessment <ArrowRight className="h-4 w-4" /></ActionButton>
              <a href="#treatments" className="inline-flex min-h-11 items-center rounded-full border border-primary/20 px-6 text-sm font-semibold text-heading hover:bg-secondary">Explore Treatments</a>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t pt-6">
              {[["HCPC", "Registered practitioner"], ["15+ yrs", "NHS & private experience"], ["4.9★", "From 380+ patient reviews"]].map(([a, b]) => (
                <div key={a}><dt className="font-serif text-2xl text-heading">{a}</dt><dd className="mt-1 text-xs text-muted-foreground">{b}</dd></div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <Image src={clinic} alt="Treatment room at Footwell Podiatry, Marylebone" className="aspect-[5/6] w-full rounded-[2rem] object-cover shadow-2xl shadow-primary/10 dark:brightness-110 dark:saturate-90" priority />
            {[["Gait Analysis", "top-8 -left-3 sm:-left-6"], ["Custom Orthotics", "top-1/2 -right-3 sm:-right-6"], ["Nail Surgery", "bottom-10 left-6"]].map(([t, pos]) => (
              <a key={t} href="#treatments" className={`absolute ${pos} flex items-center gap-2 rounded-full border bg-card/95 px-4 py-2.5 text-sm font-medium text-heading shadow-lg backdrop-blur transition-transform hover:-translate-y-0.5`}>
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />{t}
              </a>
            ))}
          </div>
        </section>

        {/* Treatments */}
        <section id="treatments" className="bg-card py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <SectionEyebrow>Treatments & services</SectionEyebrow>
                <h2 className="text-3xl text-heading sm:text-4xl">Care for every stage of foot health</h2>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">Indicative fees shown. Your exact plan is confirmed after assessment. Most major insurers accepted.</p>
            </div>
            <div className="mt-10 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Treatment categories">
              {TREATMENT_CATEGORIES.map((c) => (
                <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
                  className={`min-h-11 shrink-0 rounded-full border px-5 text-sm font-medium transition-colors ${cat === c ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{c}</button>
              ))}
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2" role="tabpanel">
              {TREATMENTS.filter((t) => t.cat === cat).map((t) => (
                <article key={t.name} className="group rounded-2xl border bg-background p-7 transition-shadow hover:shadow-xl hover:shadow-primary/5 animate-in fade-in">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-accent"><t.icon className="h-6 w-6" aria-hidden /></span>
                    <div className="text-right"><p className="text-xs text-muted-foreground">From</p><p className="font-serif text-2xl text-heading">£{t.from}</p></div>
                  </div>
                  <h3 className="mt-5 text-xl text-heading">{t.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-4 w-4" aria-hidden />{t.mins} minutes</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Helps with:</span>
                    {t.symptoms.map((s) => <span key={s} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{s}</span>)}
                  </div>
                  <button onClick={() => open(t.name)} className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all">Request Consultation <ArrowRight className="h-4 w-4" /></button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Technology */}
        <section id="technology" className="bg-primary py-20 text-primary-foreground">
          <div className="mx-auto max-w-7xl px-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Technology & clinical standards</p>
            <h2 className="max-w-2xl text-3xl sm:text-4xl">Measured precisely. Treated conservatively.</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { i: ScanLine, t: "Pressure plate & video gait analysis", d: "Dynamic plantar pressure mapping and slow-motion treadmill capture reveal how load moves through your foot with every step." },
                { i: Printer, t: "Custom 3D-printed orthotics", d: "Scan, prescribe, print, review. Lightweight devices built to your prescription and refined at a six-week follow-up." },
                { i: Microscope, t: "Evidence-based procedures", d: "Minimally invasive nail surgery and verruca treatments under local anaesthetic, following NICE and College guidance." },
              ].map(({ i: I, t, d }, n) => (
                <div key={t} className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-7">
                  <div className="flex items-center justify-between"><I className="h-7 w-7 text-gold" aria-hidden /><span className="font-serif text-4xl text-primary-foreground/20">0{n + 1}</span></div>
                  <h3 className="mt-6 text-xl">{t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">{d}</p>
                </div>
              ))}
            </div>
            <ol className="mt-12 grid gap-4 sm:grid-cols-4">
              {["3D foot scan", "Clinical prescription", "Printed in 10 days", "Fit & 6-week review"].map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* Platform previews */}
        <PlatformPreviews onBook={() => open()} />

        <PractitionerProfile />

        {/* Stories */}
        <section id="stories" className="bg-card py-20">
          <div className="mx-auto max-w-7xl px-5">
            <SectionEyebrow>Patient stories</SectionEyebrow>
            <h2 className="text-3xl text-heading sm:text-4xl">Recoveries, step by step</h2>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {[
                { n: "Sarah M., 42", c: "Plantar fasciitis", q: "Eight months of morning heel pain gone in ten weeks. The gait video made everything click.", steps: ["Wk 0: Gait assessment", "Wk 2: Orthotics + loading plan", "Wk 10: Back to 10k runs"] },
                { n: "James T., 29", c: "Runner's knee", q: "Eleanor spotted a hip-driven collapse no one else had. Marathon completed pain-free.", steps: ["Wk 0: Pressure plate scan", "Wk 3: Strength programme", "Wk 14: London Marathon"] },
                { n: "Margaret L., 67", c: "Chronic ingrown nail", q: "Years of infections, sorted with one calm, painless procedure. I wish I had come sooner.", steps: ["Day 0: Consultation", "Day 7: PNA procedure", "Wk 6: Fully healed"] },
              ].map((r) => (
                <figure key={r.n} className="flex flex-col rounded-2xl border bg-background p-7">
                  <div className="flex gap-0.5 text-gold" aria-label="5 out of 5 stars">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" aria-hidden />)}</div>
                  <span className="mt-4 w-fit rounded-full bg-secondary px-3 py-1 text-xs font-medium text-accent">{r.c}</span>
                  <blockquote className="mt-4 flex-1 font-serif text-lg leading-relaxed text-heading">&ldquo;{r.q}&rdquo;</blockquote>
                  <ol className="mt-6 space-y-2 border-l border-accent/30 pl-4">
                    {r.steps.map((s) => <li key={s} className="relative text-xs text-muted-foreground before:absolute before:-left-[1.3rem] before:top-1 before:h-2 before:w-2 before:rounded-full before:bg-accent">{s}</li>)}
                  </ol>
                  <figcaption className="mt-5 flex items-center gap-1.5 text-sm font-semibold">{r.n}<CheckCircle2 className="h-4 w-4 text-accent" aria-label="Verified patient" /></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Journal */}
        <section id="journal" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20">
          <SectionEyebrow>Advice & journal</SectionEyebrow>
          <h2 className="text-3xl text-heading sm:text-4xl">Clinical insights</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">{journalCards}</div>
        </section>

        {/* FAQ + Symptom */}
        <section id="symptoms" className="bg-secondary py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2">
            <div>
              <SectionEyebrow>Questions</SectionEyebrow>
              <h2 className="text-3xl text-heading sm:text-4xl">Before your visit</h2>
              <div className="mt-8 divide-y rounded-2xl border bg-card">
                {[
                  ["Do I need a GP or NHS referral?", "No. You can self-refer for private podiatry. NHS podiatry is available via your GP but waiting times vary by area and eligibility criteria apply."],
                  ["What should I wear to an assessment?", "Shorts or loose trousers that roll above the knee, plus your usual everyday and sports shoes so we can review wear patterns."],
                  ["Is treatment covered by health insurance?", "We are recognised by most major UK insurers including Bupa, AXA Health and Vitality. Please check your policy and pre-authorisation before attending."],
                  ["How long is recovery after nail surgery?", "Most people return to work the next day. Full healing typically takes four to eight weeks with simple dressing changes."],
                ].map(([q, a]) => (
                  <details key={q} className="group p-5">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium">{q}<ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden /></summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
                  </details>
                ))}
              </div>
            </div>
            <SymptomFinder onBook={open} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-2xl">Footwell Podiatry</p>
            <p className="mt-3 text-sm text-primary-foreground/70">Specialist podiatry and lower-limb care in the heart of Marylebone.</p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-semibold">Contact</p>
            <p className="flex gap-2 text-primary-foreground/80"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{CLINIC.address}</p>
            <a href={`tel:${CLINIC.phone.replace(/\s/g, "")}`} className="flex gap-2 text-primary-foreground/80 hover:underline"><Phone className="h-4 w-4" aria-hidden />{CLINIC.phone}</a>
            <a href={`mailto:${CLINIC.email}`} className="flex gap-2 text-primary-foreground/80 hover:underline"><Mail className="h-4 w-4" aria-hidden />{CLINIC.email}</a>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Opening hours</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-primary-foreground/80">
              <dt>Mon – Thu</dt><dd>08:00 – 19:00</dd><dt>Friday</dt><dd>08:00 – 17:00</dd><dt>Saturday</dt><dd>09:00 – 13:00</dd><dt>Sunday</dt><dd>Closed</dd>
            </dl>
          </div>
          <iframe title="Map of the clinic in Marylebone" className="h-44 w-full rounded-xl border-0 grayscale" loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1520%2C51.5160%2C-0.1440%2C51.5210&layer=mapnik&marker=51.5186%2C-0.1480" />
        </div>
        <div className="border-t border-primary-foreground/10">
          <div className="mx-auto max-w-7xl space-y-3 px-5 py-6 text-xs text-primary-foreground/60">
            <p>{CLINIC.practitioner} is registered with the Health and Care Professions Council (HCPC) and is a member of the Royal College of Podiatry. Information on this site is for general education and does not replace individual clinical advice. In an emergency, call 999 or contact NHS 111.</p>
            <div className="flex flex-wrap gap-5">
              <span>© 2026 Footwell Podiatry</span>
              <a href="#" className="hover:underline">Privacy policy</a><a href="#" className="hover:underline">Accessibility</a><a href="#" className="hover:underline">Complaints procedure</a>
            </div>
          </div>
        </div>
      </footer>

      {booking !== null && <BookingModal initialTreatment={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}
