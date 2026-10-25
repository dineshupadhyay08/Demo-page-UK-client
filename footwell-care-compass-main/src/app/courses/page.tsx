import type { Metadata } from "next";
import { CoursesPage } from "@/routes/courses.index";

export const metadata: Metadata = { title: "Online Foot-Health Courses | Footwell Podiatry", description: "Self-paced foot-health education from Footwell Podiatry: everyday foot care, common foot problems and healthy habits." };

export default function Page() { return <CoursesPage />; }
