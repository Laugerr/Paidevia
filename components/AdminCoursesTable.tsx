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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "blue" | "emerald" | "amber" | "slate";
}) {
  const toneClassName =
    tone === "blue"
      ? "bg-blue-100 text-blue-600"
      : tone === "emerald"
      ? "bg-emerald-100 text-emerald-600"
      : tone === "amber"
      ? "bg-amber-100 text-amber-600"
      : "bg-slate-100 text-slate-600";

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)] sm:p-6">
      <span
        className={`inline-flex rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${toneClassName}`}
      >
        Live
      </span>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

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

  const totalPublished = courses.filter(
    (course) => course.status === "published"
  ).length;
  const totalDrafts = courses.filter((course) => course.status === "draft").length;
  const totalArchived = courses.filter(
    (course) => course.status === "archived"
  ).length;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.72),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-cyan-200/25 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_340px] xl:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                Admin Area
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Course inventory control
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Review course visibility, monitor catalog activity, and manage
                draft, published, and archived states from one cleaner admin
                inventory screen.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/92 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  Back to Admin Dashboard
                </Link>
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/90 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Catalog Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Published</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                    {totalPublished}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Drafts</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">
                    {totalDrafts}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Archived</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-700">
                    {totalArchived}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Courses"
            value={courses.length}
            detail="Courses currently tracked in the admin catalog"
            tone="slate"
          />
          <StatCard
            label="Published"
            value={totalPublished}
            detail="Courses visible in the live LMS flow"
            tone="emerald"
          />
          <StatCard
            label="Drafts"
            value={totalDrafts}
            detail="Courses waiting for review or completion"
            tone="amber"
          />
          <StatCard
            label="Archived"
            value={totalArchived}
            detail="Courses removed from active visibility"
            tone="blue"
          />
        </section>

        <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200/80 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Course Directory
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Manage statuses and visibility
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {courses.length} total courses
              </span>
            </div>
          </div>

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
                    Completed
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Status Update
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white/90">
                {courses.map((course) => {
                  const isLoading = loadingCourseId === course.id;

                  return (
                    <tr
                      key={course.id}
                      className="transition duration-200 hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="font-semibold text-slate-950">
                            {course.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {course.slug}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {course.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {course.level}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                            course.status === "published" &&
                              "bg-emerald-100 text-emerald-700",
                            course.status === "draft" &&
                              "bg-amber-100 text-amber-700",
                            course.status === "archived" &&
                              "bg-slate-200 text-slate-700"
                          )}
                        >
                          {course.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {course.lessons}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {course.enrollments.length}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {course.progress.length}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <select
                            value={course.status}
                            disabled={isLoading}
                            onChange={(event) =>
                              handleStatusChange(
                                course.id,
                                event.target.value as
                                  | "draft"
                                  | "published"
                                  | "archived"
                              )
                            }
                            className="min-w-[160px] rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition duration-200 hover:border-slate-400 focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>

                          <Link
                            href={`/courses/${course.slug}`}
                            className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                          >
                            Open public page
                          </Link>

                          {isLoading ? (
                            <p className="text-xs text-slate-400">
                              Updating status...
                            </p>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
