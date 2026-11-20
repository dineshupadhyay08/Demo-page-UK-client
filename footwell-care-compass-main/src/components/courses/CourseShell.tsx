"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, BarChart3, Clock, ArrowRight } from "lucide-react";
import { type Course, totalMinutes } from "@/lib/courses";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useActiveNavigation } from "@/components/layout/useActiveNavigation";

export function CourseHeader() {
  const isActive = useActiveNavigation();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Footwell Podiatry home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Image src="/brand-mark.svg" alt="" width={20} height={20} className="h-5 w-5" /></span>
          <span className="font-serif text-xl text-heading">Footwell<span className="text-accent"> Podiatry</span></span>
        </Link>
        <nav className="flex items-center gap-3 text-sm" aria-label="Courses">
          <Link href="/" aria-current={isActive("/") ? "page" : undefined} className="border-b-2 border-transparent text-muted-foreground hover:text-heading">Home</Link>
          <Link href="/#courses" aria-current={isActive("/#courses") ? "page" : undefined} className={`border-b-2 hover:text-heading ${isActive("/#courses") ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Online Courses</Link>
          <Link href="/#reviews" aria-current={isActive("/#reviews") ? "location" : undefined} className={`border-b-2 hover:text-heading ${isActive("/#reviews") ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Reviews</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function CourseAvailabilityNotice() {
  return (
    <p role="note" className="rounded-xl border border-gold/40 bg-secondary px-4 py-3 text-sm text-muted-foreground">
      <strong className="text-heading">Online enrolment is not yet available.</strong> Course accounts, payments, video lessons and progress tracking are not connected.
    </p>
  );
}

export function CourseMeta({ course }: { course: Course }) {
  return (
    <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      <li className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" aria-hidden />{course.lessons.length} lessons</li>
      <li className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden />~{totalMinutes(course)} min</li>
      <li className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" aria-hidden />{course.level}</li>
    </ul>
  );
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg">
      <Image src={course.image} alt="" className="aspect-[4/3] w-full object-cover" />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <CourseMeta course={course} />
        <h3 className="font-serif text-2xl text-heading">{course.title}</h3>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
        <Link href={`/courses/${course.slug}`} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
          Explore Course <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
