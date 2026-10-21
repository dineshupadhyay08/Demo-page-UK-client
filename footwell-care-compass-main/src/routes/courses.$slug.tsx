"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, PlayCircle, Lock, X } from "lucide-react";
import { type Course } from "@/lib/courses";
import { CourseAvailabilityNotice, CourseHeader, CourseMeta } from "@/components/courses/CourseShell";

export function CourseDetail({ course }: { course: Course }) {
  const [active, setActive] = useState(0);
  const [enrol, setEnrol] = useState(false);

  return (
    <div className="min-h-screen">
      <CourseHeader />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <Link href="/courses" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-heading"><ArrowLeft className="h-4 w-4" aria-hidden />All courses</Link>

        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <CourseMeta course={course} />
            <h1 className="mt-4 text-4xl leading-tight text-heading sm:text-5xl">{course.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{course.overview}</p>
            <button onClick={() => setEnrol(true)} className="mt-8 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">Enrol in this course</button>
          </div>
          <Image src={course.image} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        </section>

        <section className="mt-16" aria-labelledby="obj-h">
          <h2 id="obj-h" className="text-3xl text-heading">What you&apos;ll learn</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {course.objectives.map((o) => (
              <li key={o} className="flex gap-3 rounded-xl border bg-card p-4 text-sm"><CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden />{o}</li>
            ))}
          </ul>
        </section>

        <section className="mt-16" aria-labelledby="player-h">
          <h2 id="player-h" className="text-3xl text-heading">Course outline</h2>
          <div className="mt-4"><CourseAvailabilityNotice /></div>
          <div className="mt-6 grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[320px_1fr]">
            <nav aria-label="Course outline" className="border-b bg-secondary/60 p-4 lg:border-b-0 lg:border-r">
              <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Course outline</p>
              <ol className="space-y-1">
                {course.lessons.map((l, i) => (
                  <li key={l.title}>
                    <button onClick={() => setActive(i)} aria-current={active === i ? "step" : undefined}
                      className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${active === i ? "bg-background font-semibold text-heading shadow-sm" : "text-muted-foreground hover:bg-background/60"}`}>
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs">{i + 1}</span>
                      <span className="flex-1">{l.title}<span className="block text-xs font-normal text-muted-foreground">{l.minutes} min</span></span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="p-6 sm:p-8">
              <div className="grid aspect-video place-items-center rounded-xl bg-primary text-primary-foreground">
                <div className="text-center">
                  <PlayCircle className="mx-auto h-12 w-12 opacity-80" aria-hidden />
                  <p className="mt-2 text-sm opacity-80">Video lessons will be available when course access is introduced.</p>
                </div>
              </div>
              <h3 className="mt-6 font-serif text-2xl text-heading">Lesson {active + 1} · {course.lessons[active]!.title}</h3>
              <p className="mt-2 text-muted-foreground">{course.lessons[active]!.summary}</p>
              <div className="mt-4 flex gap-3">
                <button disabled={active === 0} onClick={() => setActive(active - 1)} className="min-h-11 rounded-full border px-5 text-sm font-semibold text-heading disabled:opacity-40">Previous</button>
                <button disabled={active === course.lessons.length - 1} onClick={() => setActive(active + 1)} className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40">Next lesson</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-2" aria-labelledby="sample-h">
          <div className="rounded-2xl border bg-card p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Free content preview</p>
            <h2 id="sample-h" className="mt-2 font-serif text-2xl text-heading">{course.preview.heading}</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">{course.preview.body.map((p) => <p key={p}>{p}</p>)}</div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-primary p-8 text-primary-foreground">
            <Lock className="h-6 w-6 text-gold" aria-hidden />
            <h2 className="mt-3 font-serif text-2xl">Ready to start learning?</h2>
            <p className="mt-2 text-sm opacity-80">Register your interest and we&apos;ll let you know when full enrolment opens.</p>
            <button onClick={() => setEnrol(true)} className="mt-6 inline-flex min-h-11 w-fit items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">Enrol now</button>
          </div>
        </section>
      </main>
      {enrol && <EnrolDialog title={course.title} onClose={() => setEnrol(false)} />}
    </div>
  );
}

function EnrolDialog({ title, onClose }: { title: string; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="enrol-h">
      <div className="absolute inset-0 bg-primary/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border"><X className="h-4 w-4" /></button>
        <h2 id="enrol-h" className="font-serif text-2xl text-heading">Enrol: {title}</h2>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">This enquiry form is not connected to a course enrolment service, so nothing has been sent or saved.</p>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <label className="block text-sm font-medium">Full name<input required className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5" /></label>
            <label className="block text-sm font-medium">Email<input required type="email" className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5" /></label>
            <p className="text-xs text-muted-foreground">Enrolment and payment are not yet connected.</p>
            <button className="min-h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground">Register interest</button>
          </form>
        )}
      </div>
    </div>
  );
}
