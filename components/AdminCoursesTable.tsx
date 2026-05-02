"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

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
  instructor: { name: string | null; image: string | null } | null;
  _count: { courseLessons: number };
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
const levelColor: Record<string, string> = {
  Beginner: "var(--green)",
  Intermediate: "var(--yellow)",
  Advanced: "var(--red)",
};
const levelBg: Record<string, string> = {
  Beginner: "rgba(52,211,153,0.1)",
  Intermediate: "rgba(251,191,36,0.1)",
  Advanced: "rgba(248,113,113,0.1)",
};
const cardGradients = [
  "linear-gradient(135deg,#6d5cf7,#a78bfa)",
  "linear-gradient(135deg,#3b82f6,#60a5fa)",
  "linear-gradient(135deg,#10b981,#34d399)",
  "linear-gradient(135deg,#f59e0b,#fbbf24)",
  "linear-gradient(135deg,#ef4444,#f87171)",
  "linear-gradient(135deg,#8b5cf6,#c084fc)",
];
const cardEmoji = ["📘","🧠","⚡","🎯","🔬","🚀","💡","🎓"];

function CoursesDonut({ published, draft, archived, total }: { published: number; draft: number; archived: number; total: number }) {
  const r = 44; const cx = 56; const cy = 56;
  const circ = 2 * Math.PI * r;
  const safe = total || 1;
  const pubDash = (published / safe) * circ;
  const draftDash = (draft / safe) * circ;
  const archDash = (archived / safe) * circ;
  return (
    <svg viewBox="0 0 112 112" width={112} height={112}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={12} />
      {archDash > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--subtle)" strokeWidth={12}
        strokeDasharray={`${archDash} ${circ}`} strokeDashoffset={-(pubDash + draftDash)}
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />}
      {draftDash > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fbbf24" strokeWidth={12}
        strokeDasharray={`${draftDash} ${circ}`} strokeDashoffset={-pubDash}
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />}
      {pubDash > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#34d399" strokeWidth={12}
        strokeDasharray={`${pubDash} ${circ}`} strokeDashoffset={0}
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={18} fontWeight={800} fill="var(--text)">{total}</text>
    </svg>
  );
}

export default function AdminCoursesTable({ courses: initialCourses }: Props) {
  const [courses, setCourses] = useState(initialCourses);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const filtered = useMemo(() => courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  }), [courses, search, statusFilter]);

  const topEnrolled = [...courses]
    .sort((a, b) => b.enrollments.length - a.enrollments.length)
    .slice(0, 4);

  const stats = [
    { label: "Total Courses", value: courses.length, color: "var(--text)", pct: "+5%" },
    { label: "Published", value: totalPublished, color: "var(--green)", pct: "+8%" },
    { label: "Drafts", value: totalDrafts, color: "var(--yellow)", pct: "+0%" },
    { label: "Archived", value: totalArchived, color: "var(--subtle)", pct: "+0%" },
  ];

  return (
    <div style={{ padding: "28px 28px 80px", display: "grid", gridTemplateColumns: "1fr 248px", gap: 20, alignItems: "start" }}>

      {/* ── Main ── */}
      <div style={{ minWidth: 0 }}>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 13, color: "var(--subtle)" }}>
            <Link href="/admin" style={{ color: "var(--muted)" }}>Admin Panel</Link>
            <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>Courses</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>
                Course Management
              </h1>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>
                Review course visibility and manage published, draft, and archived states.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 500,
                color: "var(--muted)", background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer",
              }}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filters
              </button>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 500,
                color: "var(--muted)", background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer",
              }}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "16px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--subtle)" }}>{s.label}</p>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "var(--green)",
                  background: "rgba(52,211,153,0.1)", padding: "2px 6px", borderRadius: 99,
                }}>
                  ↑ {s.pct}
                </span>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 4 }}>vs last month</p>
            </div>
          ))}
        </div>

        {/* Search + filter pills */}
        <div style={{ marginBottom: 10, position: "relative" }}>
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 36px",
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 10, fontSize: 13, color: "var(--text)", outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {["all", "published", "draft", "archived"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s", textTransform: "capitalize",
              background: statusFilter === s ? "var(--accent)" : "var(--card)",
              color: statusFilter === s ? "#fff" : "var(--muted)",
              border: statusFilter === s ? "none" : "1px solid var(--border)",
              boxShadow: statusFilter === s ? "0 2px 8px var(--accent-glow)" : "none",
            }}>
              {s === "all" ? "All Courses" : s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 100px 100px 70px 90px 80px 140px",
            padding: "11px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}>
            {["Course", "Level", "Status", "Lessons", "Enrolled", "Done", "Actions"].map((col) => (
              <span key={col} style={{ fontSize: 10, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {col}
              </span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--subtle)" }}>No courses match your search.</p>
            </div>
          ) : filtered.map((course, i) => {
            const isLoading = loadingId === course.id;
            const lessonCount = course._count.courseLessons;
            const completedPct = course.enrollments.length > 0
              ? Math.round((course.progress.length / course.enrollments.length) * 100)
              : 0;
            const gradient = cardGradients[i % cardGradients.length];
            const emoji = cardEmoji[i % cardEmoji.length];
            const instructorInitial = (course.instructor?.name?.[0] ?? "?").toUpperCase();

            return (
              <div key={course.id} style={{
                display: "grid",
                gridTemplateColumns: "2.5fr 100px 100px 70px 90px 80px 140px",
                padding: "13px 20px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}>
                {/* Course */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, paddingRight: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: gradient,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>
                    {emoji}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {course.title}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                      {course.instructor?.image ? (
                        <img src={course.instructor.image} alt="" referrerPolicy="no-referrer"
                          style={{ width: 14, height: 14, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{
                          width: 14, height: 14, borderRadius: "50%",
                          background: "var(--accent)", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff",
                        }}>
                          {instructorInitial}
                        </div>
                      )}
                      <span style={{ fontSize: 11, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {course.instructor?.name ?? "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Level */}
                <span style={{
                  display: "inline-block", fontSize: 10, fontWeight: 700,
                  color: levelColor[course.level] ?? "var(--muted)",
                  background: levelBg[course.level] ?? "transparent",
                  padding: "3px 9px", borderRadius: 99,
                  border: `1px solid ${levelColor[course.level] ?? "var(--border)"}33`,
                }}>
                  {course.level}
                </span>

                {/* Status */}
                <span style={{
                  display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "capitalize",
                  color: statusColor[course.status] ?? "var(--subtle)",
                  background: statusBg[course.status] ?? "transparent",
                  padding: "3px 9px", borderRadius: 99,
                  border: `1px solid ${statusColor[course.status] ?? "var(--border)"}22`,
                }}>
                  {course.status}
                </span>

                {/* Lessons */}
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{lessonCount}</p>

                {/* Enrolled */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{course.enrollments.length}</p>
                  <div style={{ height: 3, background: "var(--border)", borderRadius: 99 }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      background: "var(--accent)",
                      width: `${Math.min((course.enrollments.length / Math.max(...filtered.map(c => c.enrollments.length), 1)) * 100, 100)}%`,
                    }} />
                  </div>
                </div>

                {/* Completed % */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{completedPct}%</p>
                  <div style={{ height: 3, background: "var(--border)", borderRadius: 99 }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      background: "var(--green)",
                      width: `${completedPct}%`,
                    }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <select
                    value={course.status}
                    disabled={isLoading}
                    onChange={(e) => handleStatusChange(course.id, e.target.value as "draft" | "published" | "archived")}
                    style={{
                      width: "100%", padding: "6px 8px",
                      background: "var(--surface)", border: "1px solid var(--border)",
                      borderRadius: 7, fontSize: 12, fontWeight: 500, color: "var(--text)",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link href={`/courses/${course.slug}`} style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-hover)" }}>
                      View →
                    </Link>
                    <Link href={`/instructor/courses/${course.id}`} style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>
                      Edit
                    </Link>
                  </div>
                  {isLoading && <p style={{ fontSize: 10, color: "var(--muted)" }}>Saving…</p>}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 12 }}>
          Showing {filtered.length} of {courses.length} courses
        </p>
      </div>

      {/* ── Right panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Courses Overview donut */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Courses Overview</p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <CoursesDonut
              published={totalPublished}
              draft={totalDrafts}
              archived={totalArchived}
              total={courses.length}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Published", value: totalPublished, dot: "#34d399" },
              { label: "Draft", value: totalDrafts, dot: "#fbbf24" },
              { label: "Archived", value: totalArchived, dot: "var(--subtle)" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot }} />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{item.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{item.value}</span>
                  <span style={{ fontSize: 11, color: "var(--subtle)" }}>
                    ({courses.length > 0 ? Math.round((item.value / courses.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Enrolled Courses */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Top Enrolled Courses</p>
          </div>
          <div style={{ padding: "6px 0" }}>
            {topEnrolled.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--subtle)" }}>No enrollments yet</p>
              </div>
            ) : topEnrolled.map((c, i) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 16px",
                borderBottom: i < topEnrolled.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: cardGradients[i % cardGradients.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13,
                }}>
                  {cardEmoji[i % cardEmoji.length]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--subtle)" }}>{c.enrollments.length} enrolled</p>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: "capitalize",
                  color: statusColor[c.status] ?? "var(--subtle)",
                  background: statusBg[c.status] ?? "transparent",
                  padding: "2px 7px", borderRadius: 99, flexShrink: 0,
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Quick Actions</p>
          </div>
          <div style={{ padding: "6px 0" }}>
            {[
              { label: "Create New Course", sub: "Start from scratch", href: "/instructor/courses/new" },
              { label: "Course Settings", sub: "Manage course configs", href: "/instructor" },
              { label: "View Catalog", sub: "Browse all courses", href: "/courses" },
            ].map((item, i, arr) => (
              <Link key={item.label} href={item.href} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
                textDecoration: "none",
              }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 1 }}>{item.sub}</p>
                </div>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
