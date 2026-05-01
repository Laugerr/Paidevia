"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LessonPlayerClientProps = {
  course: {
    id: string;
    slug: string;
    title: string;
    lessonList: { title: string; slug: string }[];
  };
  lesson: {
    title: string;
    slug: string;
    summary: string | null;
  };
};

export default function LessonPlayerClient({ course, lesson }: LessonPlayerClientProps) {
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJustCompleted(false);
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => setCompletedLessons(d.completedLessons ?? []))
      .catch(console.error);
  }, [lesson.slug]);

  const total = course.lessonList.length;
  const idx = course.lessonList.findIndex((l) => l.slug === lesson.slug);
  const completedCount = course.lessonList.filter((l) => completedLessons.includes(l.slug)).length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isCompleted = completedLessons.includes(lesson.slug);
  const prevLesson = idx > 0 ? course.lessonList[idx - 1] : null;
  const nextLesson = idx < total - 1 ? course.lessonList[idx + 1] : null;
  const courseComplete = total > 0 && completedCount >= total;

  const handleMarkCompleted = async () => {
    setMarking(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: course.slug, lessonSlug: lesson.slug }),
      });
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to save progress.");
        return;
      }
      const refreshed = await fetch("/api/progress");
      const data = await refreshed.json();
      setCompletedLessons(data.completedLessons ?? []);
      setJustCompleted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="r-page" style={{ padding: "36px 40px 80px", maxWidth: 800, margin: "0 auto" }}>

      {/* Breadcrumb */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: 28, fontSize: 13, color: "var(--subtle)",
        flexWrap: "wrap",
      }}>
        <Link href="/courses" style={{ color: "var(--muted)" }}>Courses</Link>
        <Chevron />
        <Link href={`/courses/${course.slug}`} style={{ color: "var(--muted)" }}>
          {course.title}
        </Link>
        <Chevron />
        <span style={{ color: "var(--text)" }}>{lesson.title}</span>
      </div>

      {/* Course progress strip */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "14px 20px",
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              Lesson {idx + 1} of {total}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: pct === 100 ? "var(--green)" : "var(--accent-hover)",
            }}>
              {pct}% complete
            </span>
          </div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: pct === 100
                ? "var(--green)"
                : "linear-gradient(90deg, var(--accent), #a78bfa)",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        <Link href={`/courses/${course.slug}`} style={{
          fontSize: 12, fontWeight: 500,
          color: "var(--subtle)", flexShrink: 0,
          padding: "5px 12px",
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--surface)",
          whiteSpace: "nowrap",
        }}>
          View Course
        </Link>
      </div>

      {/* Lesson title */}
      <h1 className="font-heading" style={{
        fontSize: "clamp(22px, 3.5vw, 34px)",
        fontWeight: 800,
        color: "var(--text)",
        letterSpacing: "-0.03em",
        lineHeight: 1.2,
        marginBottom: lesson.summary ? 12 : 28,
      }}>
        {lesson.title}
      </h1>

      {lesson.summary && (
        <p style={{
          fontSize: 15, color: "var(--muted)",
          lineHeight: 1.8, marginBottom: 32,
        }}>
          {lesson.summary}
        </p>
      )}

      {/* Media area */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 28,
      }}>
        <div style={{
          height: 340,
          background: "linear-gradient(135deg, rgba(109,92,247,0.07) 0%, rgba(109,92,247,0.02) 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 24px var(--accent-glow)",
          }}>
            <svg viewBox="0 0 24 24" width={24} height={24} fill="white" stroke="none">
              <path d="M8 5.5v13l10-6.5z" />
            </svg>
          </div>
          <p style={{ fontSize: 13, color: "var(--subtle)" }}>
            Lesson media — video or interactive content goes here
          </p>
        </div>
      </div>

      {/* Mark complete */}
      <div style={{
        background: "var(--card)",
        border: `1px solid ${isCompleted ? "rgba(52,211,153,0.2)" : "var(--border)"}`,
        borderRadius: 14,
        padding: "22px 24px",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
            {isCompleted ? "Lesson completed" : "Mark lesson as complete"}
          </p>
          <p style={{ fontSize: 13, color: "var(--subtle)" }}>
            {isCompleted
              ? "Your progress has been saved."
              : "Saves your progress and unlocks the next lesson."}
          </p>
        </div>

        {isCompleted ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px",
            background: "rgba(52,211,153,0.1)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 9,
            fontSize: 13, fontWeight: 700,
            color: "var(--green)",
          }}>
            <CheckIcon /> Completed
          </div>
        ) : (
          <button
            onClick={handleMarkCompleted}
            disabled={marking}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px",
              background: marking ? "var(--surface)" : "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.25)",
              borderRadius: 9,
              fontSize: 13, fontWeight: 700,
              color: marking ? "var(--subtle)" : "var(--green)",
              cursor: marking ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            <CheckIcon /> {marking ? "Saving..." : "Mark as Complete"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: 10,
          fontSize: 13, color: "var(--red)",
          marginBottom: 24,
        }}>
          {error}
        </div>
      )}

      {/* Just-completed banner */}
      {justCompleted && (
        <div style={{
          background: "rgba(52,211,153,0.06)",
          border: "1px solid rgba(52,211,153,0.18)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 28,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", marginBottom: 4 }}>
            {courseComplete ? "🎉 Course complete!" : "Nice work!"}
          </p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: nextLesson ? 16 : 0 }}>
            {nextLesson
              ? "The next lesson is now unlocked."
              : courseComplete
              ? "You've finished every lesson in this course."
              : "Progress saved."}
          </p>
          {nextLesson && (
            <Link href={`/lesson/${nextLesson.slug}`} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px",
              background: "var(--accent)", color: "#fff",
              borderRadius: 9, fontSize: 13, fontWeight: 700,
              boxShadow: "0 2px 12px var(--accent-glow)",
            }}>
              Next Lesson →
            </Link>
          )}
        </div>
      )}

      {/* Prev / Next navigation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 40 }}>
        {prevLesson ? (
          <Link href={`/lesson/${prevLesson.slug}`} className="glow-card" style={{
            padding: "16px 18px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12, display: "block",
          }}>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 5 }}>← Previous</p>
            <p style={{
              fontSize: 13, fontWeight: 600, color: "var(--text)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {prevLesson.title}
            </p>
          </Link>
        ) : (
          <div style={{
            padding: "16px 18px",
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12, opacity: 0.35,
          }}>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 5 }}>← Previous</p>
            <p style={{ fontSize: 13, color: "var(--subtle)" }}>First lesson</p>
          </div>
        )}

        {nextLesson ? (
          <Link href={`/lesson/${nextLesson.slug}`} className="glow-card" style={{
            padding: "16px 18px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12, display: "block",
            textAlign: "right",
          }}>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 5 }}>Next →</p>
            <p style={{
              fontSize: 13, fontWeight: 600, color: "var(--text)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {nextLesson.title}
            </p>
          </Link>
        ) : (
          <div style={{
            padding: "16px 18px",
            background: courseComplete ? "rgba(52,211,153,0.06)" : "var(--surface)",
            border: `1px solid ${courseComplete ? "rgba(52,211,153,0.18)" : "var(--border-subtle)"}`,
            borderRadius: 12, textAlign: "right",
          }}>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 5 }}>Next →</p>
            <p style={{ fontSize: 13, color: courseComplete ? "var(--green)" : "var(--subtle)", fontWeight: 600 }}>
              {courseComplete ? "Course complete 🎉" : "Last lesson"}
            </p>
          </div>
        )}
      </div>

      {/* Lesson list */}
      <div>
        <h2 className="font-heading" style={{
          fontSize: 15, fontWeight: 700, color: "var(--text)",
          letterSpacing: "-0.01em", marginBottom: 12,
        }}>
          All Lessons
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {course.lessonList.map((l, i) => {
            const isActive = l.slug === lesson.slug;
            const isDone = completedLessons.includes(l.slug);
            const prevDone = i === 0 || completedLessons.includes(course.lessonList[i - 1].slug);
            const isUnlocked = prevDone;

            return (
              <div key={l.slug}>
                {isUnlocked ? (
                  <Link href={`/lesson/${l.slug}`} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 14px",
                    background: isActive ? "var(--accent-bg)" : "transparent",
                    border: `1px solid ${isActive ? "var(--accent-border)" : "transparent"}`,
                    borderRadius: 10,
                    transition: "all 0.12s",
                  }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                      background: isDone ? "rgba(52,211,153,0.12)" : isActive ? "var(--accent)" : "var(--surface)",
                      color: isDone ? "var(--green)" : isActive ? "#fff" : "var(--subtle)",
                      border: `1px solid ${isDone ? "rgba(52,211,153,0.2)" : isActive ? "transparent" : "var(--border)"}`,
                    }}>
                      {isDone ? <CheckIcon size={11} /> : i + 1}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--text)" : isDone ? "var(--subtle)" : "var(--muted)",
                      flex: 1, minWidth: 0,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {l.title}
                    </span>
                    {isDone && !isActive && (
                      <span style={{ fontSize: 11, color: "var(--green)", flexShrink: 0 }}>Done</span>
                    )}
                  </Link>
                ) : (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 14px", borderRadius: 10,
                    opacity: 0.4, cursor: "default",
                  }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}>
                      <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="var(--subtle)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <span style={{
                      fontSize: 13, color: "var(--subtle)",
                      flex: 1, minWidth: 0,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {l.title}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
