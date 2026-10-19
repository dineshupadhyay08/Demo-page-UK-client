import care from "@/assets/course-care.jpg";
import problems from "@/assets/course-problems.jpg";
import habits from "@/assets/course-habits.jpg";

export type Level = "Beginner" | "Intermediate";
export type Lesson = { title: string; minutes: number; summary: string };
export type Course = {
  slug: string;
  title: string;
  description: string;
  overview: string;
  image: string;
  level: Level;
  objectives: string[];
  lessons: Lesson[];
  preview: { heading: string; body: string[] };
};

// Demo educational content: review with the client's clinician before launch.
export const COURSES: Course[] = [
  {
    slug: "everyday-foot-care",
    title: "Everyday Foot Care",
    description: "Simple daily routines for clean, comfortable and healthy feet at any age.",
    overview: "A practical introduction to looking after your feet at home: washing and drying, moisturising, nail trimming and when to seek professional advice.",
    image: care,
    level: "Beginner",
    objectives: [
      "Build a safe daily foot-care routine",
      "Trim toenails correctly to reduce the risk of ingrowing nails",
      "Recognise early skin changes worth monitoring",
      "Know when to book a podiatry appointment",
    ],
    lessons: [
      { title: "Why foot health matters", minutes: 6, summary: "How your feet support the rest of your body." },
      { title: "Washing, drying and moisturising", minutes: 8, summary: "Keeping skin supple without encouraging fungal infection." },
      { title: "Nail care basics", minutes: 9, summary: "Cutting straight across and avoiding common mistakes." },
      { title: "Checking your feet", minutes: 7, summary: "A quick weekly self-check routine." },
      { title: "When to seek help", minutes: 5, summary: "Signs that need a professional opinion." },
    ],
    preview: {
      heading: "Lesson 3 · Nail care basics",
      body: [
        "Trim toenails straight across using clean, sharp nail clippers, leaving a small amount of white edge.",
        "Avoid cutting down the sides or into the corners, as this can encourage the nail to grow into the skin.",
        "If you have diabetes, reduced sensation or circulation problems, ask a podiatrist before cutting your own nails.",
      ],
    },
  },
  {
    slug: "understanding-common-foot-problems",
    title: "Understanding Common Foot Problems",
    description: "Clear explanations of heel pain, bunions, corns, verrucae and more.",
    overview: "Learn what commonly causes everyday foot complaints, how they typically present, and which self-care steps are generally considered safe. This course is educational and does not replace a clinical assessment.",
    image: problems,
    level: "Intermediate",
    objectives: [
      "Understand the typical causes of heel and arch pain",
      "Distinguish corns, calluses and verrucae",
      "Learn general self-care approaches",
      "Identify red-flag symptoms needing urgent care",
    ],
    lessons: [
      { title: "Heel pain and plantar fasciitis", minutes: 10, summary: "Common causes and gentle self-care." },
      { title: "Bunions explained", minutes: 8, summary: "What they are and footwear considerations." },
      { title: "Corns, calluses and verrucae", minutes: 9, summary: "How to tell them apart." },
      { title: "Ingrowing toenails", minutes: 7, summary: "Why they happen and how to reduce risk." },
      { title: "Fungal skin and nail infections", minutes: 8, summary: "Recognising athlete's foot and nail changes." },
      { title: "Red flags", minutes: 6, summary: "Symptoms that need prompt medical attention." },
    ],
    preview: {
      heading: "Lesson 1 · Heel pain and plantar fasciitis",
      body: [
        "Plantar heel pain is often worst with the first steps in the morning or after a period of rest.",
        "General measures such as supportive footwear, gradual calf stretching and managing activity levels may help.",
        "Persistent pain, swelling, numbness or pain after an injury should be assessed by a qualified clinician.",
      ],
    },
  },
  {
    slug: "healthy-foot-care-habits",
    title: "Healthy Foot-Care Habits",
    description: "Footwear, socks, activity and lifestyle habits that support your feet long term.",
    overview: "Small, sustainable habits that make a difference: choosing footwear, caring for feet during exercise, and supporting foot health as you age.",
    image: habits,
    level: "Beginner",
    objectives: [
      "Choose footwear that fits well and supports your activity",
      "Select socks that manage moisture and friction",
      "Prepare your feet for walking and exercise",
      "Adapt your routine as your needs change",
    ],
    lessons: [
      { title: "Finding well-fitting shoes", minutes: 9, summary: "Length, width, depth and fastening." },
      { title: "Socks and hosiery", minutes: 5, summary: "Materials and seams that reduce rubbing." },
      { title: "Feet and exercise", minutes: 8, summary: "Building activity gradually." },
      { title: "Foot health through the years", minutes: 7, summary: "Changes to expect and plan for." },
    ],
    preview: {
      heading: "Lesson 1 · Finding well-fitting shoes",
      body: [
        "Shop for shoes later in the day, when feet are naturally slightly larger.",
        "Allow roughly a thumb's width between your longest toe and the end of the shoe.",
        "Laces or straps help hold the foot securely and reduce friction.",
      ],
    },
  },
];

export const getCourse = (slug: string) => COURSES.find((c) => c.slug === slug);
export const totalMinutes = (c: Course) => c.lessons.reduce((s, l) => s + l.minutes, 0);
