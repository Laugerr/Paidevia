"use client";

import Link from "next/link";
import { courses } from "@/lib/courses";
import { enrollCourse } from "@/lib/enrollment";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;

  const foundCourse = courses.find((course) => course.slug === slug);

  if (!foundCourse) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900">
          Course Not Found
        </h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">

        {/* LEFT SIDE */}
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {foundCourse.level}
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            {foundCourse.title}
          </h1>

          <p className="mt-4 text-slate-600">
            {foundCourse.description}
          </p>

          <div className="mt-8 flex gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm">
              {foundCourse.lessons} lessons
            </span>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <aside className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">

          <h2 className="text-2xl font-semibold text-slate-900">
            Course Access
          </h2>

          <button
            onClick={() => enrollCourse(foundCourse.slug)}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Enroll in Course
          </button>

          <Link
            href="/dashboard"
            className="mt-4 block w-full rounded-xl border border-slate-300 px-5 py-3 text-center font-medium hover:bg-slate-50"
          >
            Go to Dashboard
          </Link>

        </aside>

      </section>

      {/* LESSON LIST */}
      <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">

        <h2 className="text-2xl font-semibold text-slate-900">
          Course Lessons
        </h2>

        <ul className="mt-6 space-y-3">

          {foundCourse.lessonList.map((lesson, index) => (
            <li
              key={lesson.slug}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
            >
              <span>
                Lesson {index + 1} — {lesson.title}
              </span>

              <Link
                href={`/lesson/${lesson.slug}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Open Lesson
              </Link>
            </li>
          ))}

        </ul>

      </section>

    </main>
  );
}