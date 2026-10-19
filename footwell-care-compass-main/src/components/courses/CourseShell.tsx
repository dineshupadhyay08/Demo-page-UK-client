import { Link } from "@tanstack/react-router";
import { BookOpen, BarChart3, Clock, ArrowRight } from "lucide-react";
import { type Course, totalMinutes } from "@/lib/courses";

export function CourseHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Footwell Podiatry home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><img src="/brand-mark.svg" alt="" className="h-5 w-5" /></span>
          <span className="font-serif text-xl text-primary">Footwell<span className="text-accent"> Podiatry</span></span>
        </Link>
        <nav className="flex items-center gap-5 text-sm" aria-label="Courses">
          <Link to="/" className="text-muted-foreground hover:text-primary">Home</Link>
          <Link to="/courses" activeOptions={{ exact: true }} activeProps={{ className: "font-semibold text-primary" }} inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}>Online Courses</Link>
        </nav>
      </div>
    </header>
  );
}

export function DemoNotice() {
  return (
    <p role="note" className="rounded-xl border border-gold/40 bg-secondary px-4 py-3 text-sm text-muted-foreground">
      <strong className="text-primary">Demo preview:</strong> accounts, enrolment, payments, video lessons and progress tracking are not yet connected.
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
      <img src={course.image} alt="" loading="lazy" width={1024} height={768} className="aspect-[4/3] w-full object-cover" />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <CourseMeta course={course} />
        <h3 className="font-serif text-2xl text-primary">{course.title}</h3>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
        <Link to="/courses/$slug" params={{ slug: course.slug }} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Explore Course <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
