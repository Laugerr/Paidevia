export function enrollCourse(slug: string) {
  const enrolled = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");

  if (!enrolled.includes(slug)) {
    enrolled.push(slug);
    localStorage.setItem("enrolledCourses", JSON.stringify(enrolled));
  }
}

export function getEnrolledCourses(): string[] {
  return JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
}

export function isCourseEnrolled(slug: string): boolean {
  const enrolled = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
  return enrolled.includes(slug);
}