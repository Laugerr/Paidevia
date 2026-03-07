"use client";

import { useEffect, useState } from "react";
import { getCompletedLessons } from "@/lib/progress";
import { getEnrolledCourses } from "@/lib/enrollment";

export default function DashboardPage() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  
  useEffect(() => {
    setCompletedLessons(getCompletedLessons());
    setEnrolledCourses(getEnrolledCourses());
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Student Area
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          Track your enrolled courses and learning progress.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Enrolled Courses
          </h2>

          <p className="mt-3 text-3xl font-bold text-blue-600">
            3
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Completed Lessons
          </h2>

          <p className="mt-3 text-3xl font-bold text-blue-600">
            {completedLessons.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Progress
          </h2>

          <p className="mt-3 text-3xl font-bold text-blue-600">
            {completedLessons.length * 25}%
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          Enrolled Courses
        </h2>

        {enrolledCourses.length === 0 ? (
          <p className="mt-4 text-slate-600">
            You are not enrolled in any courses yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {enrolledCourses.map((course) => (
              <li
                key={course}
                className="rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
              >
                {course.replaceAll("-", " ")}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          Completed Lessons
        </h2>

        {completedLessons.length === 0 ? (
          <p className="mt-4 text-slate-600">
            You have not completed any lessons yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {completedLessons.map((lesson) => (
              <li
                key={lesson}
                className="rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
              >
                {lesson.replaceAll("-", " ")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}