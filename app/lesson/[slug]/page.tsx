"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { courses } from "@/lib/courses";
import { markLessonCompleted, setCurrentLesson } from "@/lib/progress";

export default function LessonPage() {
  const params = useParams();
  const slug = params.slug as string;

  const foundCourse = courses.find((course) =>
    course.lessonList.some((lesson) => lesson.slug === slug)
  );

  const foundLesson = foundCourse?.lessonList.find(
    (lesson) => lesson.slug === slug
  );

  useEffect(() => {
    if (foundLesson) {
      setCurrentLesson(foundLesson.slug);
    }
  }, [foundLesson]);

  if (!foundCourse || !foundLesson) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Lesson Not Found
          </h1>
          <p className="mt-4 text-slate-600">
            The lesson you are looking for does not exist.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {foundCourse.title}
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {foundLesson.title}
          </h1>

          <p className="mt-4 text-slate-600">
            This is the lesson page where video content, reading materials,
            downloadable resources, and completion tracking will appear later.
          </p>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-lg font-medium text-slate-700">Lesson Video Area</p>
            <p className="mt-2 text-sm text-slate-500">
              Video player or embedded lesson content will go here.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Lesson Notes
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              In future steps, this section can contain lesson text, summaries,
              practical exercises, downloadable files, and quizzes.
            </p>

            <button
              onClick={() => markLessonCompleted(foundLesson.slug)}
              className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
            >
              Mark Lesson as Completed
            </button>
          </div>
        </section>

        <aside className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900">
            Lesson Navigation
          </h2>

          <p className="mt-4 text-slate-600">
            Continue learning through the lessons in this course.
          </p>

          <div className="mt-6 space-y-3">
            {foundCourse.lessonList.map((lesson, index) => (
              <Link
                key={lesson.slug}
                href={`/lesson/${lesson.slug}`}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  lesson.slug === foundLesson.slug
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                Lesson {index + 1} — {lesson.title}
              </Link>
            ))}
          </div>

          <Link
            href={`/courses/${foundCourse.slug}`}
            className="mt-6 block w-full rounded-xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Back to Course
          </Link>
        </aside>
      </div>
    </main>
  );
}