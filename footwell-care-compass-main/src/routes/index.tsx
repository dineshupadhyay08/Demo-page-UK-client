"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ShieldCheck, Phone, MapPin, Star, ArrowRight, Menu, X, Clock, ScanLine, Printer,
  Microscope, CheckCircle2, ChevronDown, Award, Mail,
} from "lucide-react";
import clinic from "@/assets/clinic.jpg";
import { BookingModal } from "@/components/booking/BookingModal";
import { PlatformPreviews } from "@/components/home/PlatformPreviews";
import { PractitionerProfile } from "@/components/home/PractitionerProfile";
import { SymptomFinder } from "@/components/home/SymptomFinder";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CLINIC, PRIMARY_NAVIGATION, TREATMENT_CATEGORIES, TREATMENTS, type TreatmentCategory } from "@/config/clinic";

export function HomePage() {
  const [menu, setMenu] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);
  const [cat, setCat] = useState<TreatmentCategory>("Routine Foot Care");
  const open = (t = "") => setBooking(t);

  return (
    <div className="min-h-screen">
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
            <a href="#symptoms" className="hidden underline-offset-4 hover:underline sm:inline">Check Symptoms</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 xl:gap-0">
          <a href="#" className="flex shrink-0 items-center gap-2.5" aria-label={`${CLINIC.name} home`}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Image src="/brand-mark.svg" alt="" width={20} height={20} className="h-5 w-5" /></span>
            <span className="font-serif text-xl text-heading">Footwell<span className="text-accent"> Podiatry</span></span>
          </a>
          <nav className="hidden shrink-0 items-center gap-5 xl:ml-4 xl:flex" aria-label="Main">
            {PRIMARY_NAVIGATION.map(([l, h]) => <a key={h} href={h} className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-heading">{l}</a>)}
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
            {PRIMARY_NAVIGATION.map(([l, h]) => <a key={h} href={h} onClick={() => setMenu(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-secondary">{l}</a>)}
            <Link href="/courses" onClick={() => setMenu(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-secondary">Online Courses</Link>
            <ActionButton className="mt-4" onClick={() => { setMenu(false); open(); }}>Request Appointment</ActionButton>
          </div>
        </div>
      )}

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
        <section id="journal" className="mx-auto max-w-7xl px-5 py-20">
          <SectionEyebrow>Advice & journal</SectionEyebrow>
          <h2 className="text-3xl text-heading sm:text-4xl">Clinical insights</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { t: "Recognising the Early Signs of Plantar Fasciitis", e: "Sharp heel pain with your first steps in the morning is the classic warning sign. Here's what to try first, and when to seek help.", r: 6 },
              { t: "Custom Orthotics vs Off-the-Shelf Insoles", e: "Prefabricated insoles help many people. We explain when a prescribed device is genuinely worth the investment.", r: 8 },
              { t: "How to Prevent Recurrent Ingrown Nails", e: "Cutting technique, footwear and when partial nail surgery offers a 95%+ long-term success rate.", r: 5 },
            ].map((a, i) => (
              <article key={a.t} className="group rounded-2xl border bg-card p-7 transition-shadow hover:shadow-xl hover:shadow-primary/5">
                <div className={`mb-6 h-36 rounded-xl ${["bg-secondary", "bg-accent-soft", "bg-gold/15"][i]}`} aria-hidden />
                <p className="text-xs text-muted-foreground">{a.r} min read · Reviewed by {CLINIC.practitioner}</p>
                <h3 className="mt-3 text-xl leading-snug text-heading group-hover:text-accent transition-colors">{a.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.e}</p>
              </article>
            ))}
          </div>
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

/* Legacy implementations moved into focused home and booking components.
function PlatformPreviews({ onBook }: { onBook: () => void }) {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="max-w-2xl">
        <Eyebrow>Coming to your patient platform</Eyebrow>
        <h2 className="text-3xl text-primary sm:text-4xl">Book, consult and learn, all in one place</h2>
        <p className="mt-4 text-muted-foreground">Interactive previews of planned features. These are design prototypes, not yet connected to live systems.</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col rounded-2xl border bg-card p-7">
          <Calendar className="h-7 w-7 text-accent" aria-hidden />
          <h3 className="mt-5 text-xl text-primary">Online booking</h3>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">Choose a treatment, see live availability and set your preferences in under a minute.</p>
          <Btn variant="accent" className="mt-6" onClick={onBook}>Try the booking flow</Btn>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-primary text-primary-foreground">
          <div className="relative grid aspect-video place-items-center bg-primary-foreground/5">
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-primary/80 px-2.5 py-1 text-[11px]"><Lock className="h-3 w-3" aria-hidden />End-to-end encrypted</span>
            <span className="absolute right-3 top-3 rounded-full bg-destructive/80 px-2.5 py-1 text-[11px]">● 12:48</span>
            {cam ? <div className="grid h-20 w-20 place-items-center rounded-full bg-accent font-serif text-2xl">EH</div> : <VideoOff className="h-8 w-8 opacity-60" />}
            <div className="absolute bottom-3 right-3 h-14 w-20 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 text-center text-[10px] leading-[3.5rem]">You</div>
          </div>
          <div className="flex justify-center gap-3 p-4">
            <button onClick={() => setMic(!mic)} aria-label={mic ? "Mute microphone" : "Unmute microphone"} className="grid h-11 w-11 place-items-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20">{mic ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}</button>
            <button onClick={() => setCam(!cam)} aria-label={cam ? "Turn camera off" : "Turn camera on"} className="grid h-11 w-11 place-items-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20">{cam ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}</button>
            <button aria-label="End call (preview)" className="grid h-11 w-11 place-items-center rounded-full bg-destructive"><PhoneOff className="h-5 w-5" /></button>
          </div>
          <div className="px-7 pb-7">
            <h3 className="text-xl">Video consultations</h3>
            <p className="mt-2 text-sm text-primary-foreground/70">Secure, appointment-specific links for remote triage and follow-up reviews.</p>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border bg-card p-7">
          <GraduationCap className="h-7 w-7 text-accent" aria-hidden />
          <h3 className="mt-5 text-xl text-primary">Foot Health Academy</h3>
          <ul className="mt-5 space-y-3">
            {[["Runner's Plantar Fasciitis Recovery Protocol", "8 lessons", "£49", 62], ["Diabetic Daily Foot Care Guide", "5 lessons", "£29", 20]].map(([t, l, p, pr]) => (
              <li key={t as string} className="rounded-xl bg-secondary p-4">
                <div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold">{t}</p><span className="text-sm font-semibold text-accent">{p}</span></div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><PlayCircle className="h-3.5 w-3.5" aria-hidden />{l}</p>
                <div className="mt-3 h-1.5 rounded-full bg-border" role="progressbar" aria-valuenow={pr as number} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress"><div className="h-full rounded-full bg-accent" style={{ width: `${pr}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
*/

/* Legacy implementations moved into focused home and booking components.
function SymptomFinder({ onBook }: { onBook: (t: string) => void }) {
  const Q = [
    { q: "Where is the discomfort?", o: ["Heel or arch", "Toenail", "Knee, shin or hip", "Skin or general"] },
    { q: "Do you have diabetes or circulation concerns?", o: ["Yes", "No"] },
  ];
  const [a, setA] = useState<string[]>([]);
  const result = a.length < 2 ? null
    : a[1] === "Yes" ? "Diabetic Foot Assessment"
    : ({ "Heel or arch": "Biomechanical & Gait Assessment", Toenail: "Partial Nail Avulsion (PNA)", "Knee, shin or hip": "Biomechanical & Gait Assessment", "Skin or general": "General Podiatry Appointment" } as Record<string, string>)[a[0] ?? ""];
  return (
    <div className="self-start rounded-2xl border bg-card p-8 shadow-xl shadow-primary/5">
      <Eyebrow>Symptom finder</Eyebrow>
      <h2 className="text-2xl text-primary">Find the right appointment</h2>
      <div className="mt-2 h-1 rounded-full bg-secondary"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(a.length / 2) * 100}%` }} /></div>
      {result ? (
        <div className="mt-8 animate-in fade-in">
          <p className="text-sm text-muted-foreground">We suggest:</p>
          <p className="mt-1 font-serif text-2xl text-primary">{result}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Btn onClick={() => onBook(result)}>Book this</Btn>
            <Btn variant="outline" onClick={() => setA([])}>Start again</Btn>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Guidance only, not a diagnosis.</p>
        </div>
      ) : (
        <fieldset key={a.length} className="mt-8 animate-in fade-in">
          <legend className="font-medium">{Q[a.length]?.q}</legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Q[a.length]?.o.map((o) => <button key={o} onClick={() => setA([...a, o])} className="min-h-12 rounded-xl border px-4 text-left text-sm hover:border-accent hover:bg-secondary">{o}</button>)}
          </div>
        </fieldset>
      )}
    </div>
  );
}

function BookingModal({ initial, onClose }: { initial: string; onClose: () => void }) {
  const [step, setStep] = useState(initial ? 1 : 0);
  const [t, setT] = useState(initial);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [mode, setMode] = useState("In clinic");
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentError, setDocumentError] = useState("");
  const [isDraggingDocuments, setIsDraggingDocuments] = useState(false);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const days = Array.from({ length: 10 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; }).filter((d) => d.getDay() !== 0);
  const steps = ["Treatment", "Date & time", "Preferences", "Confirm"];
  const addDocuments = (files: FileList | File[]) => {
    const validDocuments: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const acceptedFileTypes: Record<string, string[]> = {
        pdf: ["application/pdf"],
        jpg: ["image/jpeg", "image/jpg"],
        jpeg: ["image/jpeg", "image/jpg"],
        png: ["image/png"],
      };

      if (!extension || !acceptedFileTypes[extension] || (file.type && !acceptedFileTypes[extension].includes(file.type))) {
        errors.push(`${file.name}: PDF, JPG, JPEG and PNG files are supported.`);
      } else if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: files must be 10 MB or smaller.`);
      } else {
        validDocuments.push(file);
      }
    });

    if (validDocuments.length) {
      setDocuments((current) => [...current, ...validDocuments]);
    }
    setDocumentError(errors.join(" "));
  };
  const documentType = (file: File) => file.name.split(".").pop()?.toUpperCase() ?? "Document";
  const documentSize = (size: number) => size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Book an appointment">
      <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-card p-7 shadow-2xl animate-in zoom-in-95">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full hover:bg-secondary"><X className="h-5 w-5" /></button>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Booking preview</p>
        <ol className="mt-4 flex gap-2">{steps.map((s, i) => <li key={s} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-secondary"}`} aria-label={s} />)}</ol>
        <h2 className="mt-5 text-2xl text-primary">{steps[step]}</h2>

        {step === 0 && <div className="mt-5 grid gap-2">{TREATMENTS.map((x) => (
          <button key={x.name} onClick={() => { setT(x.name); setStep(1); }} className="flex min-h-12 items-center justify-between rounded-xl border px-4 text-left text-sm hover:border-accent hover:bg-secondary">
            <span>{x.name}</span><span className="text-muted-foreground">{x.mins} min · £{x.from}</span></button>))}</div>}

        {step === 1 && <div className="mt-5">
          <p className="text-sm text-muted-foreground">{t} with {CLINIC.practitioner}</p>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{days.map((d, i) => (
            <button key={i} onClick={() => setDay(i)} className={`min-w-16 rounded-xl border px-3 py-2 text-center text-sm ${day === i ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <span className="block text-xs opacity-70">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>{d.getDate()}</button>))}</div>
          {day !== null && <div className="mt-4 grid grid-cols-4 gap-2">{["09:00", "10:30", "12:00", "14:15", "15:30", "17:00"].filter((_, i) => (i + day) % 3 !== 0).map((h) => (
            <button key={h} onClick={() => setTime(h)} className={`min-h-11 rounded-lg border text-sm ${time === h ? "border-accent bg-accent text-accent-foreground" : "hover:bg-secondary"}`}>{h}</button>))}</div>}
          <Btn className="mt-6 w-full" disabled={!time} onClick={() => setStep(2)}>Continue</Btn>
        </div>}

        {step === 2 && <div className="mt-5 space-y-3">
          {["In clinic", "Video consultation"].map((m) => (
            <label key={m} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm ${mode === m ? "border-accent bg-secondary" : ""}`}>
              <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} className="accent-[var(--accent)]" />{m}</label>))}
          <section className="rounded-xl border p-4" aria-labelledby="supporting-documents-heading">
            <h3 id="supporting-documents-heading" className="text-sm font-semibold">Supporting Documents</h3>
            <p id="supporting-documents-help" className="mt-1 text-sm text-muted-foreground">Upload any relevant medical documents to help your podiatrist prepare for your appointment. This is optional.</p>
            <div
              className={`mt-3 rounded-xl border border-dashed p-4 text-center transition-colors ${isDraggingDocuments ? "border-accent bg-secondary" : "border-border"}`}
              onDragOver={(event) => { event.preventDefault(); setIsDraggingDocuments(true); }}
              onDragLeave={() => setIsDraggingDocuments(false)}
              onDrop={(event) => { event.preventDefault(); setIsDraggingDocuments(false); addDocuments(event.dataTransfer.files); }}
              aria-describedby="supporting-documents-help"
            >
              <Upload className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium">Drag and drop documents here</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, JPEG or PNG · up to 10 MB per file</p>
              <input
                ref={documentInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="sr-only"
                aria-describedby="supporting-documents-help"
                onChange={(event) => { if (event.target.files) addDocuments(event.target.files); event.currentTarget.value = ""; }}
              />
              <Btn type="button" variant="outline" className="mt-3" onClick={() => documentInputRef.current?.click()}>Choose Files</Btn>
            </div>
            {documentError && <p className="mt-3 text-sm text-destructive" role="alert">{documentError}</p>}
            {documents.length > 0 && <ul className="mt-3 space-y-2" aria-label="Selected documents">
              {documents.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-lg bg-secondary p-3 text-sm">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1 break-all"><span className="block font-medium">{file.name}</span><span className="text-xs text-muted-foreground">{documentType(file)} · {documentSize(file.size)}</span></span>
                <button type="button" onClick={() => setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="min-h-11 rounded-full px-3 text-sm font-medium text-primary hover:bg-background" aria-label={`Remove ${file.name}`}>Remove</button>
              </li>)}
            </ul>}
          </section>
          <label className="block text-sm font-medium">Anything we should know?<textarea className="mt-2 w-full rounded-xl border bg-background p-3 text-sm" rows={3} placeholder="e.g. heel pain for three months" /></label>
          <Btn className="w-full" onClick={() => setStep(3)}>Review booking</Btn>
        </div>}

        {step === 3 && <div className="mt-5 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-accent" aria-hidden />
          <p className="mt-4 font-serif text-xl text-primary">{t}</p>
          <p className="mt-1 text-sm text-muted-foreground">{day !== null && days[day]?.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at {time} · {mode}</p>
          {documents.length > 0 && <p className="mt-2 text-sm text-muted-foreground">{documents.length} supporting document{documents.length === 1 ? "" : "s"} selected for this booking preview.</p>}
          <p className="mt-6 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">This is a design preview. In the live platform, you would receive a confirmation email and optional secure payment link.</p>
          <Btn className="mt-6" onClick={onClose}>Done</Btn>
        </div>}
      </div>
    </div>
  );
}
*/
