import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { COURSES } from "@/lib/courses";
import { CourseCard, CourseHeader, DemoNotice } from "@/components/courses/CourseShell";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Online Foot-Health Courses | Footwell Podiatry" },
      { name: "description", content: "Self-paced foot-health education from Footwell Podiatry: everyday foot care, common foot problems and healthy habits." },
      { property: "og:title", content: "Online Foot-Health Courses | Footwell Podiatry" },
      { property: "og:description", content: "Practical, self-paced lessons to help you look after your feet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <div className="min-h-screen">
      <CourseHeader />
      <main>
        <section className="bg-secondary">
          <div className="mx-auto max-w-4xl px-5 py-20 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Online Courses</p>
            <h1 className="text-4xl leading-tight text-primary sm:text-5xl">Foot-health education, <em className="text-accent">at your own pace.</em></h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">Short, practical lessons to help you understand your feet, build healthy routines and know when to seek professional care.</p>
            <a href="#catalogue" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><GraduationCap className="h-4 w-4" aria-hidden />Browse courses</a>
          </div>
        </section>
        <section id="catalogue" className="mx-auto max-w-7xl px-5 py-16" aria-labelledby="catalogue-h">
          <h2 id="catalogue-h" className="mb-6 text-3xl text-primary">Available courses</h2>
          <div className="mb-8"><DemoNotice /></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((c) => <CourseCard key={c.slug} course={c} />)}
          </div>
          <p className="mt-10 text-xs text-muted-foreground">Course content is general education and does not replace an individual clinical assessment.</p>
        </section>
      </main>
    </div>
  );
}
