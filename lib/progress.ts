export function markLessonCompleted(slug: string) {
  const completed = JSON.parse(
    localStorage.getItem("completedLessons") || "[]"
  );

  if (!completed.includes(slug)) {
    completed.push(slug);
    localStorage.setItem("completedLessons", JSON.stringify(completed));
  }
}

export function getCompletedLessons(): string[] {
  return JSON.parse(localStorage.getItem("completedLessons") || "[]");
}