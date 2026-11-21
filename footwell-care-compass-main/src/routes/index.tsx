"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  Phone, MapPin, ArrowRight, Clock, CalendarDays, Laptop, ChevronDown, Mail, ShieldCheck
} from "lucide-react";
import onlineCareHero from "@/assets/footwell-online-care-hero.png";
import { BookingModal } from "@/components/booking/BookingModal";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";
import { SymptomFinder } from "@/components/home/SymptomFinder";
import { HomeHeader } from "@/components/home/HomeHeader";
import { CLINIC, TREATMENT_CATEGORIES, TREATMENTS, type TreatmentCategory } from "@/config/clinic";
import { COURSES } from "@/lib/courses";

const treatmentPhotos: Record<string, { file: string; alt: string }> = {
  "General Podiatry Appointment": { file: "01_general_podiatry.png", alt: "Gloved practitioner examining the sole of a foot" },
  "Medical Pedicure": { file: "02_medical_pedicure.png", alt: "Gloved practitioner using a foot-care instrument on a toenail" },
  "Biomechanical & Gait Assessment": { file: "03_biomechanical_gait.png", alt: "Treadmill gait assessment beside a foot-pressure display" },
  "Custom 3D-Printed Orthotics": { file: "04_custom_orthotics.png", alt: "Blue contoured orthotic insoles beside a 3D printer" },
  "Partial Nail Avulsion (PNA)": { file: "05_partial_nail_avulsion.png", alt: "Gloved practitioner treating the edge of a toenail" },
  "Verruca Treatment (Swift / Needling)": { file: "06_verruca_treatment.png", alt: "Treatment instrument held near the sole of a foot" },
  "Diabetic Foot Assessment": { file: "07_diabetic_foot.png", alt: "Gloved practitioner examining a foot" },
  "Wound & Ulcer Care Review": { file: "08_wound_ulcer_care.png", alt: "Gloved practitioner applying a dressing beside an ankle wound" },
};

export function HomePage({ journalCards }: { journalCards: ReactNode }) {
  const [booking, setBooking] = useState<string | null>(null);
  const [cat, setCat] = useState<TreatmentCategory>("Routine Foot Care");
  const open = (t = "") => setBooking(t);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <HomeHeader onBook={() => open()} />

      <main>
        <section aria-labelledby="online-care-heading" className="overflow-hidden bg-[#F5F0FF] text-[#231A31]">
          <div className="mx-auto grid max-w-[1440px] items-center gap-5 px-5 pt-10 sm:px-8 sm:pt-14 lg:min-h-[630px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-0 lg:px-12 lg:py-[clamp(3rem,4.8vw,4.25rem)]">
            <div className="relative z-10 pb-3 lg:-mr-10 lg:pb-0">
              <p className="mb-6 inline-block rounded-full bg-[#EDE4FF] px-4 py-1.5 text-sm font-semibold text-[#7136BA]">ONLINE FOOT CARE &amp; SUPPORT</p>
              <h1 id="online-care-heading" className="max-w-[18ch] text-[clamp(2.25rem,4.1vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[#231A31]">
                Expert Foot Care and Professional Support, <span className="italic text-[#7136BA]">Online.</span>
              </h1>
              <p className="mt-5 max-w-[33rem] text-[clamp(1.0625rem,1.4vw,1.1875rem)] leading-relaxed">Book appointments, get expert advice and access trusted resources for healthier feet — all in one place.</p>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <button type="button" onClick={() => open()} className="inline-flex min-h-[50px] items-center justify-center gap-3 rounded-2xl bg-[#7136BA] px-6 text-base font-semibold text-white transition-colors hover:bg-[#5B2EA6]">Book Appointment <ArrowRight className="size-[18px]" aria-hidden /></button>
                <a href="#services" className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-[#7136BA]/40 px-6 text-base font-semibold transition-colors hover:bg-white">Explore Services</a>
              </div>
              <ul className="mt-10 grid max-w-[32rem] grid-cols-3 divide-x divide-[#7136BA]/25 pb-3 text-center text-[0.8125rem] font-semibold sm:mt-12 sm:text-sm">
                {[{ icon: Laptop, label: "Book Online" }, { icon: CalendarDays, label: "Expert Care" }, { icon: ShieldCheck, label: "Trusted Support" }].map(({ icon: Icon, label }) => <li key={label} className="px-2"><Icon className="mx-auto mb-2.5 size-7 text-[#7136BA]" strokeWidth={1.5} aria-hidden />{label}</li>)}
              </ul>
            </div>
            <div className="relative -mx-5 sm:-mx-8 lg:-mr-12 lg:ml-0">
              <Image src={onlineCareHero} alt="Conceptual Footwell online-care workspace with a laptop, appointment-booking phone visual, plant and notebook" sizes="(max-width: 1023px) 95vw, 55vw" preload className="mx-auto h-auto w-[95%] [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] lg:w-full lg:[mask-image:linear-gradient(to_right,transparent,black_15%,black_92%,transparent)]" />
            </div>
          </div>
        </section>

        {/* 2. Services / Treatment Categories — Clean image-led service presentation */}
        <section id="services" className="home-services bg-[#FAF7FF] py-16 lg:py-[90px] scroll-mt-24">
          <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <SectionEyebrow>Services & Treatments</SectionEyebrow>
              <h2 className="text-3xl font-bold text-heading sm:text-4xl">Clinical care categories</h2>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Treatment categories">
              {TREATMENT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={cat === c}
                  onClick={() => setCat(c)}
                  className={`min-h-11 rounded-full border px-5 text-sm font-medium transition-colors ${
                    cat === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-heading hover:bg-secondary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2" role="tabpanel">
            {TREATMENTS.filter((t) => t.cat === cat).map((t) => (
              <article key={t.name} className="relative isolate flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-8">
                <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/2 [mask-image:linear-gradient(to_right,transparent,black_20%)]">
                  <Image src={`/images/treatments/${treatmentPhotos[t.name]!.file}`} alt={treatmentPhotos[t.name]!.alt} fill sizes="(min-width: 1280px) 310px, (min-width: 768px) 25vw, 50vw" className="object-cover object-center" />
                </div>
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-accent">
                      <t.icon className="h-6 w-6" aria-hidden />
                    </span>
                    <div className="relative rounded-lg bg-[rgba(245,240,255,0.88)] px-3 py-1 text-right text-[#5B2EA6]">
                      <span className="block text-xs font-medium uppercase leading-4 tracking-wider">From</span>
                      <span className="block text-xl font-bold leading-6">£{t.from}</span>
                    </div>
                  </div>
                  <h3 className="w-fit bg-white text-xl font-bold text-heading">{t.name}</h3>
                  <p className="mt-2 flex w-fit items-center gap-2 bg-white text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" aria-hidden /> {t.mins} minute session
                  </p>
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {t.symptoms.map((s) => (
                      <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between pt-[25px]">
                  <span className="bg-white text-xs text-muted-foreground">Includes clinical assessment</span>
                  <button
                    onClick={() => open(t.name)}
                    className="-mx-3 -my-1 inline-flex items-center gap-1.5 rounded-lg bg-[rgba(245,240,255,0.9)] px-3 py-1 text-sm font-bold text-[#5B2EA6] underline-offset-4 hover:underline"
                  >
                    Request appointment <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          </div>
        </section>

        {/* 3. Courses Preview — Clean Coursera-like trending course cards */}
        <section id="courses" className="bg-secondary/40 py-16 lg:py-[90px] border-y border-border/60 scroll-mt-24">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <SectionEyebrow>Foot Health Academy</SectionEyebrow>
                <h2 className="text-3xl font-bold text-heading sm:text-4xl">Featured educational courses</h2>
              </div>
              <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline">
                View all courses <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {COURSES.map((course) => (
                <div key={course.slug} className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="aspect-[16/10] relative w-full bg-secondary">
                    <Image src={course.image} alt="" className="object-cover w-full h-full" />
                  </div>
                  <div className="p-6 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent">{course.level}</span>
                        <span className="text-xs text-muted-foreground">{course.lessons.length} lessons</span>
                      </div>
                      <h3 className="font-bold text-lg text-heading">{course.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Self-paced learning</span>
                      <Link href={`/courses/${course.slug}`} className="text-sm font-bold text-accent hover:underline">
                        Explore course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Advice & Journal */}
        <section id="journal" className="bg-secondary/40 py-16 lg:py-[90px] border-y border-border/60 scroll-mt-24">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <SectionEyebrow>Advice & Journal</SectionEyebrow>
                <h2 className="text-3xl font-bold text-heading sm:text-4xl">Clinical insights and guides</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {journalCards}
            </div>
          </div>
        </section>

        {/* 5. Testimonials — Clean Coursera-like quote blocks */}
        <section id="reviews" className="mx-auto max-w-7xl px-5 py-16 lg:py-[90px] scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <SectionEyebrow>Patient Testimonials</SectionEyebrow>
            <h2 className="text-3xl font-bold text-heading sm:text-4xl">Stories of recovery</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { q: "Eight months of morning heel pain resolved within ten weeks. The clarity of the assessment and home exercise plan made all the difference.", n: "Sarah M.", c: "Plantar fasciitis" },
              { q: "Clear explanation of my gait mechanics and custom orthotics that actually fit comfortably into my work and running shoes.", n: "James T.", c: "Biomechanical assessment" },
              { q: "Professional, reassuring, and completely painless minor nail surgery. Excellent follow-up care instructions.", n: "Margaret L.", c: "Minor nail surgery" },
            ].map((t, idx) => (
              <blockquote key={idx} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8">
                <p className="text-muted-foreground leading-relaxed italic">&ldquo;{t.q}&rdquo;</p>
                <footer className="mt-6 pt-4 border-t border-border/60">
                  <p className="font-bold text-heading text-sm">{t.n}</p>
                  <p className="text-xs text-accent mt-0.5">{t.c}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-16 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:py-[90px]">
          <div className="min-w-0">
          <div className="mb-8">
            <SectionEyebrow>Common Questions</SectionEyebrow>
            <h2 className="text-3xl font-bold text-heading sm:text-4xl">Everything you need to know</h2>
          </div>
          <div className="divide-y divide-border/80 rounded-2xl border border-border bg-card">
            {[
              ["Do I need a GP or NHS referral?", "No. You can self-refer directly for private podiatry assessments. We communicate with your GP if further medical collaboration is needed."],
              ["What should I bring to my appointment?", "Please bring your everyday footwear as well as any specific sports or running shoes you use regularly."],
              ["Are treatments covered by health insurance?", "We are recognised by major private insurers including Bupa and AXA. Please verify your individual policy prior to booking."],
              ["Where is the clinic located?", "Our practice is situated at 42 Wimpole Street, Marylebone, London W1G 8YF, offering easy access and ground-floor facilities."]
            ].map(([q, a]) => (
              <details key={q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-heading text-base">
                  {q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
          </div>
          <SymptomFinder onBook={open} />
        </section>

        {/* 7. Final Booking CTA */}
        <section className="mx-auto max-w-7xl px-5 pb-16">
          <div className="rounded-3xl bg-primary text-primary-foreground p-10 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to start your recovery?</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto text-base leading-relaxed">
              Book your consultation in Marylebone or request an appointment online today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => open()}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-white px-6 py-3 text-base font-bold text-[#5B2EA6] transition-colors hover:bg-[#F5F0FF] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
              >
                <CalendarDays className="h-5 w-5 shrink-0" aria-hidden /> Request Appointment
              </button>
              <a
                href={`tel:${CLINIC.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/40 bg-transparent px-6 py-3 text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
              >
                <Phone className="h-5 w-5 shrink-0" aria-hidden /> {CLINIC.phone}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-heading text-background pt-16 pb-12 border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-bold text-xl text-white">Footwell Podiatry</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Specialist podiatry and lower-limb care in Marylebone, London.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-bold text-white text-xs uppercase tracking-wider">Contact</p>
            <p className="flex items-start gap-2 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 mt-1 text-accent" />{CLINIC.address}</p>
            <a href={`tel:${CLINIC.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-muted-foreground hover:text-white"><Phone className="h-4 w-4 text-accent" />{CLINIC.phone}</a>
            <a href={`mailto:${CLINIC.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-white"><Mail className="h-4 w-4 text-accent" />{CLINIC.email}</a>
          </div>
          <div className="text-sm">
            <p className="font-bold text-white text-xs uppercase tracking-wider">Hours</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-muted-foreground">
              <dt>Mon – Thu</dt><dd className="text-right text-white">08:00 – 19:00</dd>
              <dt>Friday</dt><dd className="text-right text-white">08:00 – 17:00</dd>
              <dt>Saturday</dt><dd className="text-right text-white">09:00 – 13:00</dd>
            </dl>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/20">
            <iframe
              title="Marylebone clinic map"
              className="h-full w-full min-h-[160px] border-0 grayscale opacity-90"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1520%2C51.5160%2C-0.1440%2C51.5210&layer=mapnik&marker=51.5186%2C-0.1480"
            />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 mt-12 pt-8 border-t border-border/10 text-xs text-muted-foreground flex flex-wrap justify-between items-center gap-4">
          <p>{CLINIC.practitioner} is registered with the Health and Care Professions Council (HCPC).</p>
          <div className="flex gap-6">
            <span>© 2026 Footwell Podiatry</span>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </footer>

      {booking !== null && <BookingModal initialTreatment={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}
