import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetail } from "@/routes/courses.$slug";
import { getCourse } from "@/lib/courses";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const course = getCourse((await params).slug);
  return course ? { title: `${course.title} | Online Course | Footwell Podiatry`, description: course.description } : { title: "Course unavailable | Footwell Podiatry", robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const course = getCourse((await params).slug);
  if (!course) notFound();
  return <CourseDetail course={course} />;
}
