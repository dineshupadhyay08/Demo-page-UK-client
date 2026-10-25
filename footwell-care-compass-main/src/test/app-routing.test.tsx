import { describe, expect, it } from "vitest";

import { COURSES, getCourse, totalMinutes } from "@/lib/courses";

describe("course routes", () => {
  it("exposes every course used by the App Router detail route", () => {
    for (const course of COURSES) {
      expect(getCourse(course.slug)).toBe(course);
    }
  });

  it("has a positive duration for every course", () => {
    expect(COURSES.every((course) => totalMinutes(course) > 0)).toBe(true);
  });
});
