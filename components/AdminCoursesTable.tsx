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
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Admin Area
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Course Management
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          View all courses and manage their visibility across the platform.
        </p>

        <div className="mt-6">
          <Link
            href="/admin"
            className="inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Lessons
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Enrollments
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Completed Lessons
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {courses.map((course) => {
                const isLoading = loadingCourseId === course.id;

                return (
                  <tr key={course.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {course.title}
                        </p>
                        <p className="text-sm text-slate-500">{course.slug}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {course.level}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          course.status === "published"
                            ? "bg-green-100 text-green-700"
                            : course.status === "draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {course.lessons}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {course.enrollments.length}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {course.progress.length}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStatusChange(course.id, "draft")}
                          disabled={isLoading}
                          className="rounded-lg border border-yellow-300 px-3 py-2 text-xs font-medium text-yellow-700 transition hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Draft
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(course.id, "published")
                          }
                          disabled={isLoading}
                          className="rounded-lg border border-green-300 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Publish
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(course.id, "archived")
                          }
                          disabled={isLoading}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Archive
                        </button>

                        <Link
                          href={`/courses/${course.slug}`}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
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
    </main>
  );
}