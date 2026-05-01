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

type Props = { courses: AdminCourse[] };

const statusColor: Record<string, string> = {
  published: "var(--green)",
  draft: "var(--yellow)",
  archived: "var(--subtle)",
};
const statusBg: Record<string, string> = {
  published: "rgba(52,211,153,0.1)",
  draft: "rgba(251,191,36,0.1)",
  archived: "rgba(74,74,101,0.15)",
};

export default function AdminCoursesTable({ courses: initialCourses }: Props) {
  const [courses, setCourses] = useState(initialCourses);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (courseId: string, status: "draft" | "published" | "archived") => {
    setLoadingId(courseId);
    try {
      const res = await fetch("/api/admin/courses/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update status");
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, status } : c));
    } catch (e) {
      console.error(e);
      alert("Failed to update course status");
    } finally {
      setLoadingId(null);
    }
  };

  const totalPublished = courses.filter((c) => c.status === "published").length;
  const totalDrafts = courses.filter((c) => c.status === "draft").length;
  const totalArchived = courses.filter((c) => c.status === "archived").length;

  return (
    <div className="r-page" style={{ padding: "32px 32px 64px", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hover)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Admin · Courses
        </p>
        <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Course Management
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Review course visibility and manage published, draft, and archived states.
        </p>
      </div>

      {/* Stat cards */}
      <div className="r-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Courses", value: courses.length, color: "var(--text)" },
          { label: "Published", value: totalPublished, color: "var(--green)" },
          { label: "Drafts", value: totalDrafts, color: "var(--yellow)" },
          { label: "Archived", value: totalArchived, color: "var(--subtle)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="r-table-wrap" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2.5fr 90px 100px 80px 100px 80px 150px",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          {["Course", "Level", "Status", "Lessons", "Enrolled", "Done", "Change Status"].map((col) => (
            <span key={col} style={{ fontSize: 11, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {courses.map((course, i) => {
          const isLoading = loadingId === course.id;

          return (
            <div
              key={course.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2.5fr 90px 100px 80px 100px 80px 150px",
                padding: "14px 20px",
                alignItems: "center",
                borderBottom: i < courses.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              {/* Course */}
              <div style={{ minWidth: 0, paddingRight: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {course.title}
                </p>
                <p style={{ fontSize: 11, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {course.slug}
                </p>
              </div>

              {/* Level */}
              <p style={{ fontSize: 12, color: "var(--muted)" }}>{course.level}</p>

              {/* Status badge */}
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700,
                color: statusColor[course.status] ?? "var(--subtle)",
                background: statusBg[course.status] ?? "transparent",
                padding: "3px 10px", borderRadius: 99,
                border: `1px solid ${statusColor[course.status] ?? "var(--border)"}22`,
              }}>
                {course.status}
              </span>

              {/* Lessons */}
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{course.lessons}</p>

              {/* Enrolled */}
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{course.enrollments.length}</p>

              {/* Completed */}
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{course.progress.length}</p>

              {/* Status select */}
              <div>
                <select
                  value={course.status}
                  disabled={isLoading}
                  onChange={(e) => handleStatusChange(course.id, e.target.value as "draft" | "published" | "archived")}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.5 : 1,
                    marginBottom: 4,
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <Link href={`/courses/${course.slug}`} style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-hover)" }}>
                  View page →
                </Link>
                {isLoading && <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Saving…</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
