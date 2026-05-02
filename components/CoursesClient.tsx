"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Course = {
  slug: string;
  title: string;
  description: string;
  level: string;
  lessonCount: number;
  enrollmentCount: number;
  instructorName: string | null;
};

type Props = {
  courses: Course[];
  enrolledSlugs: string[];
  totalEnrollments: number;
};

const LEVELS = ["All Courses", "Beginner", "Intermediate", "Advanced"] as const;

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #0f3d2e 0%, #166534 100%)",
  "linear-gradient(135deg, #1e3356 0%, #1d4ed8 100%)",
  "linear-gradient(135deg, #0e3d3a 0%, #0f766e 100%)",
  "linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)",
  "linear-gradient(135deg, #3b0764 0%, #7c3aed 100%)",
  "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
  "linear-gradient(135deg, #164e63 0%, #0e7490 100%)",
  "linear-gradient(135deg, #4a1942 0%, #9333ea 100%)",
];

const CARD_ICONS = ["📗", "📘", "⚛️", "🌐", "💻", "🔐", "📊", "🤖"];

const levelColor: Record<string, string> = {
  Beginner: "var(--green)",
  Intermediate: "var(--yellow)",
  Advanced: "var(--red)",
};
const levelBg: Record<string, string> = {
  Beginner: "var(--green-bg)",
  Intermediate: "var(--yellow-bg)",
  Advanced: "var(--red-bg)",
};

const CATEGORIES = [
  "Web Development",
  "Programming",
  "Cybersecurity",
  "Data Science",
  "Mobile Development",
];

export default function CoursesClient({ courses, enrolledSlugs, totalEnrollments }: Props) {
  const [activeLevel, setActiveLevel] = useState<string>("All Courses");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const enrolledSet = new Set(enrolledSlugs);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchLevel = activeLevel === "All Courses" || c.level === activeLevel;
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [courses, activeLevel, search]);

  return (
    <div style={{ padding: "28px 28px 64px", maxWidth: 1200 }}>

      {/* ── Top header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 24,
        marginBottom: 28, flexWrap: "wrap",
      }}>
        <div>
          <h1 className="font-heading" style={{
            fontSize: 26, fontWeight: 800, color: "var(--text)",
            letterSpacing: "-0.02em", marginBottom: 4,
          }}>
            Browse Courses
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            Explore expertly crafted courses and accelerate your learning journey.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 16px",
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 10, width: 240,
          }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for courses…"
              style={{
                flex: 1, background: "transparent", border: "none",
                outline: "none", fontSize: 13, color: "var(--text)",
              }}
            />
          </div>
          {/* Bell */}
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "var(--card)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--muted)", flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="r-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { icon: "📚", value: `${courses.length}+`, label: "Courses Available" },
          { icon: "👥", value: `${totalEnrollments}+`, label: "Happy Learners" },
          { icon: "⭐", value: "4.8", label: "Average Rating" },
          { icon: "🆕", value: "Weekly", label: "New Courses" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "var(--subtle)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Level tabs ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            style={{
              padding: "7px 18px", borderRadius: 99,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
              background: activeLevel === level ? "var(--accent)" : "var(--card)",
              color: activeLevel === level ? "#fff" : "var(--muted)",
              border: `1px solid ${activeLevel === level ? "var(--accent)" : "var(--border)"}`,
              boxShadow: activeLevel === level ? "0 2px 12px var(--accent-glow)" : "none",
            }}
          >
            {level}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--subtle)", alignSelf: "center" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Main + Right panel ── */}
      <div className="r-course-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 220px", gap: 24, alignItems: "start" }}>

        {/* Course grid */}
        <div>
          {filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map((course, i) => {
                const enrolled = enrolledSet.has(course.slug);
                const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                const icon = CARD_ICONS[i % CARD_ICONS.length];

                return (
                  <div key={course.slug} style={{
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 16, overflow: "hidden",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                    className="glow-card"
                  >
                    {/* Card header */}
                    <div style={{
                      height: 120, background: gradient,
                      position: "relative", overflow: "hidden",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {/* Decorative circles */}
                      <div style={{
                        position: "absolute", top: -20, right: -20,
                        width: 100, height: 100, borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                      }} />
                      <div style={{
                        position: "absolute", bottom: -30, left: -10,
                        width: 80, height: 80, borderRadius: "50%",
                        background: "rgba(255,255,255,0.04)",
                      }} />
                      {/* Icon */}
                      <span style={{ fontSize: 42, position: "relative", zIndex: 1 }}>{icon}</span>
                      {/* Badge top-right */}
                      <div style={{ position: "absolute", top: 12, right: 12 }}>
                        {enrolled ? (
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                            textTransform: "uppercase", color: "#fff",
                            background: "rgba(52,211,153,0.7)",
                            padding: "3px 10px", borderRadius: 99,
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}>
                            Enrolled
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#fff",
                            background: "rgba(0,0,0,0.3)",
                            padding: "3px 10px", borderRadius: 99,
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255,255,255,0.15)",
                          }}>
                            {course.level}
                          </span>
                        )}
                      </div>
                      {/* Lesson count bottom-left */}
                      <div style={{ position: "absolute", bottom: 10, left: 14 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                          {course.lessonCount} lessons
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "16px 18px 18px" }}>
                      <h2 className="font-heading" style={{
                        fontSize: 15, fontWeight: 700, color: "var(--text)",
                        letterSpacing: "-0.01em", lineHeight: 1.35, marginBottom: 8,
                      }}>
                        {course.title}
                      </h2>
                      <p style={{
                        fontSize: 12, color: "var(--muted)", lineHeight: 1.65,
                        marginBottom: 16,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {course.description}
                      </p>

                      {/* Footer */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          {/* Instructor avatar */}
                          <div style={{
                            width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg, var(--accent), #a78bfa)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 800, color: "#fff",
                          }}>
                            {(course.instructorName?.[0] ?? "P").toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {course.instructorName ?? "Paidevia"}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <span style={{ color: "var(--yellow)", fontSize: 10 }}>★</span>
                              <span style={{ fontSize: 10, color: "var(--subtle)" }}>4.8</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/courses/${course.slug}`} style={{
                          fontSize: 12, fontWeight: 700,
                          color: "var(--accent-hover)",
                          display: "flex", alignItems: "center", gap: 3,
                          flexShrink: 0,
                          padding: "6px 12px",
                          background: "var(--accent-bg)",
                          borderRadius: 8,
                          border: "1px solid var(--accent-border)",
                        }}>
                          View Course
                          <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: "center", padding: "64px 24px",
              border: "1px dashed var(--border)", borderRadius: 16,
            }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
              <p className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                No courses found
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>
                Try adjusting your search or level filter.
              </p>
              <button onClick={() => { setSearch(""); setActiveLevel("All Courses"); }} style={{
                marginTop: 16, padding: "9px 20px",
                background: "var(--accent)", color: "#fff",
                borderRadius: 9, fontSize: 13, fontWeight: 700,
                cursor: "pointer", boxShadow: "0 2px 12px var(--accent-glow)",
              }}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* ── Right filter panel ── */}
        <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Filter header */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Filters</p>
              <button onClick={() => { setActiveLevel("All Courses"); setSearch(""); setSelectedCategories([]); }} style={{
                fontSize: 11, fontWeight: 600, color: "var(--accent-hover)", cursor: "pointer",
              }}>
                Clear All
              </button>
            </div>

            {/* Level filter */}
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Level
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                <label key={lvl} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={activeLevel === lvl}
                    onChange={() => setActiveLevel(activeLevel === lvl ? "All Courses" : lvl)}
                    style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
                  />
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{lvl}</span>
                  <span style={{
                    marginLeft: "auto", fontSize: 10, fontWeight: 700,
                    color: levelColor[lvl], background: levelBg[lvl],
                    padding: "1px 7px", borderRadius: 99,
                  }}>
                    {courses.filter((c) => c.level === lvl).length}
                  </span>
                </label>
              ))}
            </div>

            {/* Category filter (decorative for now) */}
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Category
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <label key={cat} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                      )
                    }
                    style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
                  />
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Enrolled summary */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Your Progress</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em" }}>
              {enrolledSlugs.length}
            </p>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 12 }}>
              course{enrolledSlugs.length !== 1 ? "s" : ""} enrolled
            </p>
            <Link href="/dashboard" style={{
              display: "block", textAlign: "center",
              padding: "8px", background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)", borderRadius: 9,
              fontSize: 12, fontWeight: 700, color: "var(--accent-hover)",
            }}>
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
