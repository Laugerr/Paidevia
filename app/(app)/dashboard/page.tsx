import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login");

  const [enrollments, allPublished, progress] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id, course: { status: "published" } },
      select: {
        course: {
          select: {
            id: true, slug: true, title: true, level: true,
            courseLessons: { orderBy: { position: "asc" }, select: { slug: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { status: "published", courseLessons: { some: {} } },
      select: {
        id: true, slug: true, title: true, level: true,
        _count: { select: { courseLessons: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completed: true },
      select: { lessonSlug: true },
    }),
  ]);

  const completedSlugs = new Set(progress.map((p) => p.lessonSlug));
  const enrolledCourses = enrollments
    .map((e) => e.course)
    .filter((c) => c.courseLessons.length > 0);
  const enrolledIds = new Set(enrolledCourses.map((c) => c.id));
  const recommended = allPublished.filter((c) => !enrolledIds.has(c.id)).slice(0, 3);

  const totalLessons = enrolledCourses.reduce((t, c) => t + c.courseLessons.length, 0);
  const completedCount = enrolledCourses.reduce(
    (t, c) => t + c.courseLessons.filter((l) => completedSlugs.has(l.slug)).length,
    0
  );
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const firstName = user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const levelColor: Record<string, string> = {
    Beginner: "var(--green)",
    Intermediate: "var(--yellow)",
    Advanced: "var(--red)",
  };

  // Find the active course (first in-progress, or first enrolled if none)
  const activeCourse = enrolledCourses.find((c) => {
    const done = c.courseLessons.filter((l) => completedSlugs.has(l.slug)).length;
    return done > 0 && done < c.courseLessons.length;
  }) ?? (enrolledCourses.length > 0 ? enrolledCourses[0] : null);

  const activeNext = activeCourse?.courseLessons.find((l) => !completedSlugs.has(l.slug));
  const activeDone = activeCourse ? activeCourse.courseLessons.filter((l) => completedSlugs.has(l.slug)).length : 0;
  const activeTotal = activeCourse?.courseLessons.length ?? 0;
  const activePct = activeTotal > 0 ? Math.round((activeDone / activeTotal) * 100) : 0;

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-heading" style={{
          fontSize: 28, fontWeight: 800, color: "var(--text)",
          letterSpacing: "-0.02em", marginBottom: 4,
        }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          {enrolledCourses.length > 0
            ? `You're enrolled in ${enrolledCourses.length} course${enrolledCourses.length !== 1 ? "s" : ""} · ${completedCount} lesson${completedCount !== 1 ? "s" : ""} completed`
            : "Start learning by enrolling in a course below."}
        </p>
      </div>

      {/* Continue Learning hero */}
      {activeCourse && (
        <div style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(109,92,247,0.15) 0%, rgba(109,92,247,0.05) 60%, rgba(52,211,153,0.05) 100%)",
          border: "1px solid var(--accent-border)",
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 28,
        }}>
          {/* Glow orbs */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 200, height: 200,
            background: "radial-gradient(circle, rgba(109,92,247,0.2), transparent)",
            borderRadius: "50%", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: "40%",
            width: 120, height: 120,
            background: "radial-gradient(circle, rgba(52,211,153,0.1), transparent)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "var(--accent-hover)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  Continue Learning
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: levelColor[activeCourse.level] ?? "var(--muted)",
                  padding: "2px 8px", borderRadius: 99,
                  border: "1px solid currentColor", opacity: 0.8,
                }}>
                  {activeCourse.level}
                </span>
              </div>
              <h2 className="font-heading" style={{
                fontSize: 20, fontWeight: 800, color: "var(--text)",
                letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14,
              }}>
                {activeCourse.title}
              </h2>
              {/* Progress bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 360 }}>
                <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    width: `${activePct}%`, height: "100%",
                    background: "linear-gradient(90deg, var(--accent), #a78bfa)",
                    borderRadius: 99,
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", fontWeight: 500 }}>
                  {activeDone}/{activeTotal} lessons
                </span>
              </div>
            </div>

            <Link
              href={activeNext ? `/lesson/${activeNext.slug}` : `/courses/${activeCourse.slug}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px",
                background: "var(--accent)",
                color: "#fff",
                borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                boxShadow: "0 4px 20px var(--accent-glow)",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              {activePct === 0 ? "Start" : "Continue"}
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 36 }}>
        {[
          { label: "Enrolled", value: enrolledCourses.length, color: "var(--accent)" },
          { label: "Completed", value: completedCount, color: "var(--green)" },
          { label: "Progress", value: `${overallProgress}%`, color: "var(--yellow)" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "20px 24px",
          }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>
              {s.value}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 className="font-heading" style={{
            fontSize: 17, fontWeight: 700, color: "var(--text)",
            letterSpacing: "-0.01em", marginBottom: 14,
          }}>
            My Courses
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {enrolledCourses.map((course) => {
              const done = course.courseLessons.filter((l) => completedSlugs.has(l.slug)).length;
              const total = course.courseLessons.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const nextLesson = course.courseLessons.find((l) => !completedSlugs.has(l.slug));

              return (
                <div key={course.id} style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <h3 className="font-heading" style={{
                        fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em",
                      }}>
                        {course.title}
                      </h3>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: levelColor[course.level] ?? "var(--muted)",
                        padding: "2px 8px", borderRadius: 99,
                        border: "1px solid currentColor", flexShrink: 0,
                      }}>
                        {course.level}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          width: `${pct}%`, height: "100%",
                          background: pct === 100 ? "var(--green)" : "linear-gradient(90deg, var(--accent), #a78bfa)",
                          borderRadius: 99,
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                        {done}/{total}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={nextLesson ? `/lesson/${nextLesson.slug}` : `/courses/${course.slug}`}
                    style={{
                      padding: "8px 18px",
                      background: pct === 100 ? "transparent" : "var(--accent)",
                      color: pct === 100 ? "var(--muted)" : "#fff",
                      borderRadius: 8,
                      fontSize: 13, fontWeight: 600,
                      whiteSpace: "nowrap",
                      border: pct === 100 ? "1px solid var(--border)" : "none",
                      flexShrink: 0,
                    }}
                  >
                    {pct === 100 ? "Done ✓" : pct > 0 ? "Continue" : "Start"}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 className="font-heading" style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
              {enrolledCourses.length === 0 ? "Start Learning" : "Discover More"}
            </h2>
            <Link href="/courses" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-hover)" }}>
              Browse all →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {recommended.map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="glow-card" style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 20,
                display: "block",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: levelColor[course.level] ?? "var(--muted)",
                    padding: "2px 8px", borderRadius: 99, border: "1px solid currentColor",
                  }}>
                    {course.level}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--subtle)" }}>
                    {course._count.courseLessons} lessons
                  </span>
                </div>
                <p className="font-heading" style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
                  {course.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {enrolledCourses.length === 0 && recommended.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 24px", border: "1px dashed var(--border)", borderRadius: 12 }}>
          <p className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            No courses available yet
          </p>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Check back soon.</p>
        </div>
      )}
    </div>
  );
}
