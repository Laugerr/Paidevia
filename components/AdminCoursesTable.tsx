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
  tone: "blue" | "green" | "amber" | "slate";
}) {
  const toneClass =
    tone === "blue" ? "bg-[rgba(32,156,238,0.12)] text-[#209cee]"
    : tone === "green" ? "bg-[rgba(146,204,65,0.12)] text-[#92cc41]"
    : tone === "amber" ? "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]"
    : "bg-[rgba(139,148,158,0.12)] text-[#8b949e]";

  const barClass =
    tone === "blue" ? "from-[#209cee] to-[#92cc41]"
    : tone === "green" ? "from-[#92cc41] to-[#209cee]"
    : tone === "amber" ? "from-[#f7d51d] to-[#e59400]"
    : "from-[#8b949e] to-[#6e7681]";

  return (
    <article className="rounded-xl border border-[#30363d] bg-[#21262d] p-4 transition duration-200 hover:border-[#3d444d] hover:-translate-y-0.5 sm:p-5">
      <span className={`inline-flex rounded-lg px-3 py-1 font-pixel text-[8px] ${toneClass}`}>Live</span>
      <p className="mt-4 text-xs font-medium text-[#8b949e]">{label}</p>
      <p className="mt-1.5 text-3xl font-bold text-[#e6edf3] sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs text-[#6e7681]">{detail}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#2d333b]">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${barClass}`} />
      </div>
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
        body: JSON.stringify({ courseId, status }),
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

  const totalPublished = courses.filter((c) => c.status === "published").length;
  const totalDrafts = courses.filter((c) => c.status === "draft").length;
  const totalArchived = courses.filter((c) => c.status === "archived").length;

  return (
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-[#209cee]/6 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#92cc41]/6 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#209cee]/40 to-transparent" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px] xl:items-center">
            <div className="max-w-2xl">
              <p className="font-pixel text-[9px] text-[#e76e55]">Admin Area</p>
              <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl lg:text-4xl">
                Course inventory control
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#8b949e] sm:text-base">
                Review course visibility, monitor catalog activity, and manage
                draft, published, and archived states from one cleaner admin
                inventory screen.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b] hover:-translate-y-0.5"
                >
                  Back to Admin Dashboard
                </Link>
              </div>
            </div>

            <aside className="rounded-xl border border-[#30363d] bg-[#21262d] p-5">
              <p className="font-pixel text-[8px] text-[#6e7681]">Catalog Snapshot</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Published", value: totalPublished, color: "text-[#92cc41]" },
                  { label: "Drafts", value: totalDrafts, color: "text-[#f7d51d]" },
                  { label: "Archived", value: totalArchived, color: "text-[#8b949e]" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3.5">
                    <p className="text-xs font-medium text-[#8b949e]">{item.label}</p>
                    <p className={`mt-1.5 text-2xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Courses" value={courses.length} detail="Courses tracked in the admin catalog" tone="slate" />
          <StatCard label="Published" value={totalPublished} detail="Courses visible in the live LMS flow" tone="green" />
          <StatCard label="Drafts" value={totalDrafts} detail="Courses waiting for review or completion" tone="amber" />
          <StatCard label="Archived" value={totalArchived} detail="Courses removed from active visibility" tone="blue" />
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="border-b border-[#30363d] px-5 py-5">
            <p className="font-pixel text-[9px] text-[#e76e55]">Course Directory</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-heading text-xl font-bold text-[#e6edf3]">
                Manage statuses and visibility
              </h2>
              <span className="inline-flex rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 font-pixel text-[8px] text-[#8b949e]">
                {courses.length} total courses
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#30363d]">
              <thead className="bg-[#21262d]">
                <tr>
                  {["Course", "Level", "Status", "Lessons", "Enrollments", "Completed", "Status Update"].map((col) => (
                    <th key={col} className="px-5 py-4 text-left font-pixel text-[8px] text-[#6e7681]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#30363d] bg-[#161b22]">
                {courses.map((course) => {
                  const isLoading = loadingCourseId === course.id;

                  const statusClass = cn(
                    "inline-flex rounded-lg px-3 py-1 font-pixel text-[8px]",
                    course.status === "published" && "bg-[rgba(146,204,65,0.12)] text-[#92cc41]",
                    course.status === "draft" && "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]",
                    course.status === "archived" && "bg-[rgba(139,148,158,0.12)] text-[#8b949e]"
                  );

                  return (
                    <tr
                      key={course.id}
                      className="transition duration-200 hover:bg-[#21262d]"
                    >
                      <td className="px-5 py-4">
                        <div className="max-w-xs">
                          <p className="font-semibold text-[#e6edf3]">{course.title}</p>
                          <p className="mt-0.5 text-xs text-[#6e7681]">{course.slug}</p>
                          <p className="mt-1.5 text-xs leading-5 text-[#8b949e]">
                            {course.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#8b949e]">
                        {course.level}
                      </td>

                      <td className="px-5 py-4">
                        <span className={statusClass}>{course.status}</span>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#e6edf3]">
                        {course.lessons}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#e6edf3]">
                        {course.enrollments.length}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#e6edf3]">
                        {course.progress.length}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <select
                            value={course.status}
                            disabled={isLoading}
                            onChange={(event) =>
                              handleStatusChange(
                                course.id,
                                event.target.value as "draft" | "published" | "archived"
                              )
                            }
                            className="min-w-[155px] rounded-xl border border-[#30363d] bg-[#21262d] px-3 py-2 text-sm font-medium text-[#e6edf3] outline-none transition duration-200 hover:border-[#3d444d] focus:border-[#209cee] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>

                          <Link
                            href={`/courses/${course.slug}`}
                            className="text-xs font-semibold text-[#209cee] transition hover:text-[#1786c9]"
                          >
                            Open public page
                          </Link>

                          {isLoading ? (
                            <p className="text-xs text-[#6e7681]">Updating status...</p>
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
