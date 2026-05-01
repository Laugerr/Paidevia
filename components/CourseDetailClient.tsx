"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Lesson = { title: string; slug: string };

type Props = {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    level: string;
    lessons: number;
    lessonList: Lesson[];
  };
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

export default function CourseDetailClient({ course }: Props) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [enrollRes, progressRes] = await Promise.all([
          fetch("/api/enrollments", { cache: "no-store" }),
          fetch("/api/progress", { cache: "no-store" }),
        ]);
        const enrollData = await enrollRes.json();
        const progressData = await progressRes.json();
        setIsEnrolled((enrollData.enrolledCourses ?? []).includes(course.slug));
        setCompletedLessons(progressData.completedLessons ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [course.slug]);

  const completedCount = useMemo(
    () => course.lessonList.filter((l) => completedLessons.includes(l.slug)).length,
    [completedLessons, course.lessonList]
  );
  const total = course.lessonList.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const nextLesson = course.lessonList.find((l) => !completedLessons.includes(l.slug)) ?? course.lessonList[0];

  const handleEnroll = async () => {
    setEnrolling(true);
    setError(null);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: course.slug }),
      });
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Enrollment failed. Please try again.");
        return;
      }
      setIsEnrolled(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="r-page" style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 32px 80px" }}>

      {/* Breadcrumb */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: 32, fontSize: 13, color: "var(--subtle)",
      }}>
        <Link href="/courses" style={{ color: "var(--muted)", transition: "color 0.15s" }}>
          Courses
        </Link>
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span style={{ color: "var(--text)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {course.title}
        </span>
      </div>

      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: levelColor[course.level] ?? "var(--muted)",
            background: levelBg[course.level] ?? "var(--card)",
            padding: "3px 12px", borderRadius: 99,
            border: `1px solid ${levelColor[course.level] ?? "var(--border)"}22`,
          }}>
            {course.level}
          </span>
          <span style={{ fontSize: 13, color: "var(--subtle)" }}>
            {total} lessons · Self-paced
          </span>
        </div>

        <h1 className="font-heading" style={{
          fontSize: "clamp(26px, 4vw, 42px)",
          fontWeight: 800,
          color: "var(--text)",
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          marginBottom: 14,
        }}>
          {course.title}
        </h1>

        <p style={{
          fontSize: 15, color: "var(--muted)",
          lineHeight: 1.8, maxWidth: 680,
        }}>
          {course.description}
        </p>
      </div>

      {/* Progress bar — only when enrolled */}
      {!loading && isEnrolled && (
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Your progress</span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: pct === 100 ? "var(--green)" : "var(--accent-hover)",
              }}>
                {pct}%
              </span>
            </div>
            <div style={{ height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: pct === 100
                  ? "var(--green)"
                  : "linear-gradient(90deg, var(--accent), #a78bfa)",
                borderRadius: 99,
                transition: "width 0.6s ease",
              }} />
            </div>
            <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 6 }}>
              {completedCount} of {total} lessons completed
            </p>
          </div>

          {pct < 100 && nextLesson ? (
            <Link href={`/lesson/${nextLesson.slug}`} style={{
              padding: "10px 22px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              boxShadow: "0 2px 16px var(--accent-glow)",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {completedCount === 0 ? "Start Course" : "Continue →"}
            </Link>
          ) : pct === 100 ? (
            <span style={{
              padding: "10px 22px",
              background: "rgba(52,211,153,0.1)",
              color: "var(--green)",
              borderRadius: 10, fontSize: 13, fontWeight: 700,
              border: "1px solid rgba(52,211,153,0.2)",
              flexShrink: 0,
            }}>
              ✓ Completed
            </span>
          ) : null}
        </div>
      )}

      {/* Main grid */}
      <div className="r-course-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 272px", gap: 24, alignItems: "start" }}>

        {/* Lesson list */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <h2 className="font-heading" style={{
            fontSize: 16, fontWeight: 700, color: "var(--text)",
            letterSpacing: "-0.02em", marginBottom: 14,
          }}>
            Course Content
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {course.lessonList.map((lesson, i) => {
              const done = completedLessons.includes(lesson.slug);
              const prevDone = i === 0 || completedLessons.includes(course.lessonList[i - 1].slug);
              const unlocked = isEnrolled && prevDone;

              return (
                <div
                  key={lesson.slug}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    background: "var(--card)",
                    border: `1px solid ${done ? "rgba(52,211,153,0.18)" : "var(--border)"}`,
                    borderRadius: 12,
                    opacity: !isEnrolled || unlocked ? 1 : 0.45,
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* Number/checkmark */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    background: done
                      ? "rgba(52,211,153,0.1)"
                      : unlocked
                      ? "var(--accent-bg)"
                      : "var(--surface)",
                    color: done
                      ? "var(--green)"
                      : unlocked
                      ? "var(--accent-hover)"
                      : "var(--subtle)",
                    border: `1px solid ${done
                      ? "rgba(52,211,153,0.2)"
                      : unlocked
                      ? "var(--accent-border)"
                      : "var(--border)"}`,
                  }}>
                    {done ? (
                      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 600,
                      color: done ? "var(--subtle)" : "var(--text)",
                      marginBottom: 2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {lesson.title}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--subtle)" }}>
                      {done
                        ? "Completed"
                        : unlocked
                        ? "Ready to start"
                        : !isEnrolled
                        ? "Enroll to unlock"
                        : "Complete previous lesson first"}
                    </p>
                  </div>

                  {/* CTA */}
                  {unlocked ? (
                    <Link href={`/lesson/${lesson.slug}`} style={{
                      fontSize: 12, fontWeight: 600,
                      color: done ? "var(--subtle)" : "var(--accent-hover)",
                      padding: "5px 14px", borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      whiteSpace: "nowrap", flexShrink: 0,
                      transition: "all 0.15s",
                    }}>
                      {done ? "Review" : "Start"}
                    </Link>
                  ) : (
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
          }}>
            {/* Enrollment section */}
            <div style={{ padding: "24px" }}>
              {loading ? (
                <div style={{
                  padding: "12px", background: "var(--surface)", borderRadius: 10,
                  fontSize: 13, color: "var(--subtle)", textAlign: "center",
                }}>
                  Loading...
                </div>
              ) : isEnrolled ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{
                    padding: "11px 16px",
                    background: "rgba(52,211,153,0.08)",
                    border: "1px solid rgba(52,211,153,0.2)",
                    borderRadius: 10, fontSize: 13,
                    color: "var(--green)", fontWeight: 600,
                    textAlign: "center",
                  }}>
                    ✓ You are enrolled
                  </div>
                  {pct < 100 && nextLesson && (
                    <Link href={`/lesson/${nextLesson.slug}`} style={{
                      display: "block", padding: "12px",
                      background: "var(--accent)", color: "#fff",
                      borderRadius: 10, fontSize: 14, fontWeight: 700,
                      textAlign: "center",
                      boxShadow: "0 2px 16px var(--accent-glow)",
                    }}>
                      {completedCount === 0 ? "Start Learning" : "Continue Learning"}
                    </Link>
                  )}
                  {pct === 100 && (
                    <div style={{
                      padding: "12px",
                      background: "rgba(52,211,153,0.08)",
                      borderRadius: 10, fontSize: 14,
                      fontWeight: 700, color: "var(--green)",
                      textAlign: "center",
                    }}>
                      Course Complete 🎉
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{
                    fontSize: 13, color: "var(--muted)",
                    lineHeight: 1.7, marginBottom: 16,
                  }}>
                    Enroll for free to unlock all lessons and track your progress.
                  </p>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || total === 0}
                    style={{
                      width: "100%", padding: "13px",
                      background: enrolling ? "var(--subtle)" : "var(--accent)",
                      color: "#fff", borderRadius: 10,
                      fontSize: 14, fontWeight: 700,
                      cursor: enrolling || total === 0 ? "not-allowed" : "pointer",
                      boxShadow: enrolling ? "none" : "0 2px 16px var(--accent-glow)",
                      transition: "all 0.15s",
                    }}
                  >
                    {enrolling ? "Enrolling..." : "Enroll for Free"}
                  </button>
                  {error && (
                    <p style={{
                      fontSize: 12, color: "var(--red)",
                      marginTop: 10, textAlign: "center", lineHeight: 1.5,
                    }}>
                      {error}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Course meta */}
            <div style={{ padding: "16px 24px" }}>
              {[
                { label: "Lessons", value: `${total}` },
                { label: "Level", value: course.level },
                { label: "Pace", value: "Self-paced" },
                { label: "Price", value: "Free" },
              ].map((item, idx, arr) => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "10px 0",
                  borderBottom: idx < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}>
                  <span style={{ fontSize: 13, color: "var(--subtle)" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/courses" style={{
            display: "block", marginTop: 12,
            padding: "11px", borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            fontSize: 13, fontWeight: 500,
            color: "var(--muted)", textAlign: "center",
            transition: "all 0.15s",
          }}>
            ← Back to all courses
          </Link>
        </div>
      </div>
    </div>
  );
}
