"use client";

import Link from "next/link";
import { useState } from "react";

type AdminCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  lessons: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  enrollments: { id: string }[];
  progress: { id: string }[];
};

type Props = {
  courses: AdminCourse[];
};

export default function AdminCoursesTable({ courses: initialCourses }: Props) {
  const [courses, setCourses] = useState(initialCourses);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  const handleStatusChange = async (
    courseId: string,
    status: "draft" | "published" | "archived"
  ) => {
    try {
      setLoadingCourseId(courseId);

      const response = await fetch("/api/admin/courses/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update course status");
      }

      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, status } : course
        )
      );
    } catch (error) {
      console.error("Failed to update course status:", error);
      alert("Failed to update course status");
    } finally {
      setLoadingCourseId(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-[radial-gradient(circle_at_left,_rgba(125,211,252,0.3),_transparent_26%),linear-gradient(135deg,_#f4fbff_0%,_#ffffff_60%,_#eff6ff_100%)] p-8">
          <div className="absolute -left-4 top-7 h-24 w-24 rounded-full border-[10px] border-blue-200/40" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Admin Area
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Course management
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Review live inventory, update course visibility, and oversee
                how learning paths are exposed across the platform.
              </p>
            </div>

            <Link
              href="/admin"
              className="inline-flex rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Admin Dashboard
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-500">Total courses</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {courses.length}
            </p>
          </article>
          <article className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-500">Published</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-600">
              {courses.filter((course) => course.status === "published").length}
            </p>
          </article>
          <article className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-500">Drafts</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-amber-600">
              {courses.filter((course) => course.status === "draft").length}
            </p>
          </article>
        </section>

        <section className="mt-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/92 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/90">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Course
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Level
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Lessons
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Enrollments
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Completed Lessons
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white/90">
                {courses.map((course) => {
                  const isLoading = loadingCourseId === course.id;

                  return (
                    <tr key={course.id} className="transition hover:bg-slate-50/80">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {course.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{course.slug}</p>
                          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {course.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-slate-700">
                        {course.level}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            course.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : course.status === "draft"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-slate-900">
                        {course.lessons}
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-slate-900">
                        {course.enrollments.length}
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-slate-900">
                        {course.progress.length}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleStatusChange(course.id, "draft")}
                            disabled={isLoading}
                            className="rounded-2xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isLoading && course.status !== "draft"
                              ? "Updating..."
                              : "Draft"}
                          </button>

                          <button
                            onClick={() => handleStatusChange(course.id, "published")}
                            disabled={isLoading}
                            className="rounded-2xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isLoading && course.status !== "published"
                              ? "Updating..."
                              : "Publish"}
                          </button>

                          <button
                            onClick={() => handleStatusChange(course.id, "archived")}
                            disabled={isLoading}
                            className="rounded-2xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isLoading && course.status !== "archived"
                              ? "Updating..."
                              : "Archive"}
                          </button>

                          <Link
                            href={`/courses/${course.slug}`}
                            className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
