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

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", minHeight: "100vh", alignItems: "start" }}>

      {/* ── Main content ── */}
      <div style={{ padding: "28px 32px 80px", minWidth: 0 }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "var(--subtle)", flexWrap: "wrap" }}>
          <Link href="/courses" style={{ color: "var(--muted)" }}>Courses</Link>
          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <Link href={`/courses/${course.slug}`} style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
            {course.title}
          </Link>
          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span style={{ color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
            {lesson.title}
          </span>
        </div>

        {/* Progress strip */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "14px 20px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Lesson {idx + 1} of {total}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? "var(--green)" : "var(--accent-hover)" }}>
                {pct}% complete
              </span>
            </div>
            <div style={{ height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: pct === 100 ? "var(--green)" : "linear-gradient(90deg, var(--accent), #a78bfa)",
                borderRadius: 99, transition: "width 0.5s ease",
              }} />
            </div>
          </div>
          <Link href={`/courses/${course.slug}`} style={{
            fontSize: 12, fontWeight: 500, color: "var(--subtle)",
            padding: "6px 12px", borderRadius: 8, flexShrink: 0,
            border: "1px solid var(--border)", background: "var(--surface)",
            whiteSpace: "nowrap",
          }}>
            ← Course
          </Link>
        </div>

        {/* Lesson title */}
        <h1 className="font-heading" style={{
          fontSize: "clamp(22px, 3vw, 32px)",
          fontWeight: 800, color: "var(--text)",
          letterSpacing: "-0.03em", lineHeight: 1.2,
          marginBottom: lesson.summary ? 12 : 24,
        }}>
          {lesson.title}
        </h1>

        {lesson.summary && (
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.8, marginBottom: 24 }}>
            {lesson.summary}
          </p>
        )}

        {/* Video / media area */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 16, overflow: "hidden", marginBottom: 24,
        }}>
          <div style={{
            aspectRatio: "16/9",
            background: "linear-gradient(135deg, rgba(109,92,247,0.1) 0%, rgba(109,92,247,0.04) 100%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 14,
            minHeight: 260,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 28px var(--accent-glow)",
            }}>
              <svg viewBox="0 0 24 24" width={26} height={26} fill="white" stroke="none">
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
          borderRadius: 14, padding: "20px 24px", marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
              {isCompleted ? "Lesson completed" : "Mark lesson as complete"}
            </p>
            <p style={{ fontSize: 13, color: "var(--subtle)" }}>
              {isCompleted ? "Your progress has been saved." : "Saves your progress and unlocks the next lesson."}
            </p>
          </div>
          {isCompleted ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px",
              background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: 9, fontSize: 13, fontWeight: 700, color: "var(--green)",
            }}>
              <CheckIcon /> Completed
            </div>
          ) : (
            <button onClick={handleMarkCompleted} disabled={marking} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px",
              background: marking ? "var(--surface)" : "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.25)",
              borderRadius: 9, fontSize: 13, fontWeight: 700,
              color: marking ? "var(--subtle)" : "var(--green)",
              cursor: marking ? "not-allowed" : "pointer", transition: "all 0.15s",
            }}>
              <CheckIcon /> {marking ? "Saving..." : "Mark as Complete"}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "12px 16px", marginBottom: 20,
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 10, fontSize: 13, color: "var(--red)",
          }}>
            {error}
          </div>
        )}

        {/* Just-completed banner */}
        {justCompleted && (
          <div style={{
            background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)",
            borderRadius: 14, padding: "20px 24px", marginBottom: 20,
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", marginBottom: 4 }}>
              {courseComplete ? "🎉 Course complete!" : "Nice work!"}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: nextLesson ? 14 : 0 }}>
              {nextLesson ? "The next lesson is now unlocked." : courseComplete ? "You've finished every lesson in this course." : "Progress saved."}
            </p>
            {nextLesson && (
              <Link href={`/lesson/${nextLesson.slug}`} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 18px", background: "var(--accent)", color: "#fff",
                borderRadius: 9, fontSize: 13, fontWeight: 700,
                boxShadow: "0 2px 12px var(--accent-glow)",
              }}>
                Next Lesson →
              </Link>
            )}
          </div>
        )}

        {/* Prev / Next navigation */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {prevLesson ? (
            <Link href={`/lesson/${prevLesson.slug}`} style={{
              padding: "16px 18px", background: "var(--card)",
              border: "1px solid var(--border)", borderRadius: 12, display: "block",
            }}>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 4 }}>← Previous</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {prevLesson.title}
              </p>
            </Link>
          ) : (
            <div style={{
              padding: "16px 18px", background: "var(--surface)",
              border: "1px solid var(--border-subtle)", borderRadius: 12, opacity: 0.35,
            }}>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 4 }}>← Previous</p>
              <p style={{ fontSize: 13, color: "var(--subtle)" }}>First lesson</p>
            </div>
          )}

          {nextLesson ? (
            <Link href={`/lesson/${nextLesson.slug}`} style={{
              padding: "16px 18px", background: "var(--card)",
              border: "1px solid var(--border)", borderRadius: 12,
              display: "block", textAlign: "right",
            }}>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 4 }}>Next →</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
              <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 4 }}>Next →</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: courseComplete ? "var(--green)" : "var(--subtle)" }}>
                {courseComplete ? "Course complete 🎉" : "Last lesson"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right sidebar: lesson list ── */}
      <div style={{
        borderLeft: "1px solid var(--border)",
        minHeight: "100vh", position: "sticky", top: 0,
        background: "var(--surface)",
        display: "flex", flexDirection: "column",
        maxHeight: "100vh", overflowY: "auto",
      }}>
        {/* Sidebar header */}
        <div style={{
          padding: "20px 16px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          position: "sticky", top: 0, zIndex: 1,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Course Content
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.4, marginBottom: 10 }}>
            {course.title}
          </p>
          {/* Mini progress bar */}
          <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: pct === 100 ? "var(--green)" : "linear-gradient(90deg, var(--accent), #a78bfa)",
              borderRadius: 99, transition: "width 0.5s ease",
            }} />
          </div>
          <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 5 }}>
            {completedCount} / {total} completed
          </p>
        </div>

        {/* Lesson items */}
        <div style={{ padding: "8px 0", flex: 1 }}>
          {course.lessonList.map((l, i) => {
            const isActive = l.slug === lesson.slug;
            const isDone = completedLessons.includes(l.slug);
            const prevDone = i === 0 || completedLessons.includes(course.lessonList[i - 1].slug);
            const isUnlocked = prevDone;

            const content = (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px",
                background: isActive ? "var(--accent-bg)" : "transparent",
                borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                transition: "all 0.12s",
                cursor: isUnlocked ? "pointer" : "default",
                opacity: isUnlocked ? 1 : 0.4,
              }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: isDone ? "rgba(52,211,153,0.12)" : isActive ? "var(--accent)" : "var(--card)",
                  color: isDone ? "var(--green)" : isActive ? "#fff" : "var(--subtle)",
                  border: `1px solid ${isDone ? "rgba(52,211,153,0.2)" : isActive ? "transparent" : "var(--border)"}`,
                }}>
                  {isDone ? <CheckIcon size={11} /> : i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--text)" : isDone ? "var(--subtle)" : "var(--muted)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    lineHeight: 1.3,
                  }}>
                    {l.title}
                  </p>
                  {isDone && !isActive && (
                    <p style={{ fontSize: 10, color: "var(--green)", marginTop: 2 }}>Done</p>
                  )}
                </div>
              </div>
            );

            return isUnlocked ? (
              <Link key={l.slug} href={`/lesson/${l.slug}`} style={{ display: "block" }}>
                {content}
              </Link>
            ) : (
              <div key={l.slug}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
