import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
      select: { lessonSlug: true, completedAt: true },
    }),
  ]);

  const completedSlugs = new Set(progress.map((p) => p.lessonSlug));
  const enrolledCourses = enrollments.map((e) => e.course).filter((c) => c.courseLessons.length > 0);
  const enrolledIds = new Set(enrolledCourses.map((c) => c.id));
  const recommended = allPublished.filter((c) => !enrolledIds.has(c.id)).slice(0, 4);

  const totalLessons = enrolledCourses.reduce((t, c) => t + c.courseLessons.length, 0);
  const completedCount = enrolledCourses.reduce(
    (t, c) => t + c.courseLessons.filter((l) => completedSlugs.has(l.slug)).length, 0
  );
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const firstName = user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const activeCourse = enrolledCourses.find((c) => {
    const done = c.courseLessons.filter((l) => completedSlugs.has(l.slug)).length;
    return done > 0 && done < c.courseLessons.length;
  }) ?? (enrolledCourses.length > 0 ? enrolledCourses[0] : null);

  const activeNext = activeCourse?.courseLessons.find((l) => !completedSlugs.has(l.slug));
  const activeDone = activeCourse ? activeCourse.courseLessons.filter((l) => completedSlugs.has(l.slug)).length : 0;
  const activeTotal = activeCourse?.courseLessons.length ?? 0;
  const activePct = activeTotal > 0 ? Math.round((activeDone / activeTotal) * 100) : 0;

  // Learning streak: check last 7 days for lesson completions
  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
  const completionDates = new Set(
    progress
      .filter((p) => p.completedAt)
      .map((p) => {
        const d = new Date(p.completedAt!);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  );
  const streakDays = last7.map((d) => ({
    label: days[d.getDay()],
    active: completionDates.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`),
  }));

  // Consecutive streak count (from today backwards)
  let streakCount = 0;
  for (let i = 6; i >= 0; i--) {
    if (streakDays[i].active) streakCount++;
    else break;
  }

  // Circular progress SVG
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - overallProgress / 100);

  return (
    <div className="r-page" style={{ padding: "28px 28px 64px", maxWidth: 1200 }}>

      {/* ── Top header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-heading" style={{
          fontSize: 26, fontWeight: 800, color: "var(--text)",
          letterSpacing: "-0.02em", marginBottom: 4,
        }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Keep learning, keep growing. You&apos;re doing great!
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="r-course-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: 24, alignItems: "start" }}>

        {/* ── Main column ── */}
        <div style={{ minWidth: 0 }}>

          {/* Hero banner */}
          {activeCourse ? (
            <div className="r-hero" style={{
              position: "relative", overflow: "hidden",
              background: "linear-gradient(135deg, var(--accent) 0%, #8b7dff 60%, #a78bfa 100%)",
              borderRadius: 16, padding: "28px 32px", marginBottom: 20,
            }}>
              {/* Decorative blobs */}
              <div style={{
                position: "absolute", top: -30, right: -30, width: 180, height: 180,
                background: "rgba(255,255,255,0.06)", borderRadius: "50%", pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -40, right: 80, width: 120, height: 120,
                background: "rgba(255,255,255,0.04)", borderRadius: "50%", pointerEvents: "none",
              }} />

              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    display: "inline-block", fontSize: 10, fontWeight: 700,
                    color: "#fff", background: "rgba(255,255,255,0.2)",
                    padding: "3px 10px", borderRadius: 99, letterSpacing: "0.1em",
                    textTransform: "uppercase", marginBottom: 12,
                  }}>
                    Enrolled
                  </span>
                  <h2 className="font-heading" style={{
                    fontSize: 20, fontWeight: 800, color: "#fff",
                    letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {activeCourse.title}
                  </h2>
                  {/* Progress */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 340, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.25)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        width: `${activePct}%`, height: "100%",
                        background: "#fff", borderRadius: 99, transition: "width 0.6s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", fontWeight: 500 }}>
                      {activeDone} of {activeTotal} lessons completed
                    </span>
                  </div>
                  <Link href={activeNext ? `/lesson/${activeNext.slug}` : `/courses/${activeCourse.slug}`} style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 22px",
                    background: "#fff", color: "var(--accent)",
                    borderRadius: 10, fontSize: 13, fontWeight: 700,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  }}>
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    {activePct === 0 ? "Start Learning" : "Continue Learning"}
                  </Link>
                </div>

                {/* Decorative illustration area */}
                <div className="r-hide-mobile" style={{
                  width: 120, height: 90, flexShrink: 0,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 40,
                }}>
                  🎓
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: "var(--card)", border: "1px dashed var(--border)",
              borderRadius: 16, padding: "32px", marginBottom: 20, textAlign: "center",
            }}>
              <p style={{ fontSize: 28, marginBottom: 10 }}>📚</p>
              <p className="font-heading" style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                No courses yet
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
                Browse and enroll in a course to get started.
              </p>
              <Link href="/courses" style={{
                display: "inline-block", padding: "10px 22px",
                background: "var(--accent)", color: "#fff",
                borderRadius: 10, fontSize: 13, fontWeight: 700,
                boxShadow: "0 2px 12px var(--accent-glow)",
              }}>
                Browse Courses
              </Link>
            </div>
          )}

          {/* Stats row */}
          <div className="r-grid-4c" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
            {[
              {
                label: "Enrolled Courses", value: enrolledCourses.length,
                sub: enrolledCourses.length === 0 ? "Going!" : "Keep going!",
                icon: "📘", color: "var(--accent)",
              },
              {
                label: "Lessons Completed", value: completedCount,
                sub: completedCount === 0 ? "This week" : "This week",
                icon: "✅", color: "var(--green)",
              },
              {
                label: "Day Streak", value: streakCount,
                sub: streakCount === 0 ? "Start now!" : "Amazing!",
                icon: "🔥", color: "var(--yellow)",
              },
              {
                label: "Overall Progress", value: `${overallProgress}%`,
                sub: overallProgress === 100 ? "Complete! 🎉" : "Keep it up!",
                icon: "📈", color: "var(--blue)",
              },
            ].map((s) => (
              <div key={s.label} style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "14px 12px",
              }}>
                <span style={{ fontSize: 18, display: "block", marginBottom: 6 }}>{s.icon}</span>
                <p style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 5 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 2, lineHeight: 1.3 }}>{s.label}</p>
                <p style={{ fontSize: 10, color: "var(--subtle)" }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* My Courses */}
          {enrolledCourses.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 className="font-heading" style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
                  My Courses
                </h2>
                <Link href="/courses" style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-hover)" }}>
                  View all →
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {enrolledCourses.map((course) => {
                  const done = course.courseLessons.filter((l) => completedSlugs.has(l.slug)).length;
                  const total = course.courseLessons.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  const nextLesson = course.courseLessons.find((l) => !completedSlugs.has(l.slug));

                  return (
                    <div key={course.id} style={{
                      background: "var(--card)", border: "1px solid var(--border)",
                      borderRadius: 12, padding: "16px 20px",
                      display: "flex", alignItems: "center", gap: 16,
                    }}>
                      {/* Icon */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20,
                      }}>
                        📘
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: levelColor[course.level] ?? "var(--muted)",
                            background: levelBg[course.level] ?? "var(--card)",
                            padding: "2px 8px", borderRadius: 99,
                          }}>
                            {course.level}
                          </span>
                        </div>
                        <p className="font-heading" style={{
                          fontSize: 14, fontWeight: 700, color: "var(--text)",
                          marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {course.title}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{
                              width: `${pct}%`, height: "100%",
                              background: pct === 100 ? "var(--green)" : "linear-gradient(90deg, var(--accent), #a78bfa)",
                              borderRadius: 99,
                            }} />
                          </div>
                          <span style={{ fontSize: 11, color: "var(--subtle)", whiteSpace: "nowrap" }}>
                            {done}/{total} lessons
                          </span>
                        </div>
                      </div>

                      <Link href={nextLesson ? `/lesson/${nextLesson.slug}` : `/courses/${course.slug}`} style={{
                        padding: "8px 18px", flexShrink: 0,
                        background: pct === 100 ? "transparent" : "var(--accent)",
                        color: pct === 100 ? "var(--muted)" : "#fff",
                        borderRadius: 9, fontSize: 12, fontWeight: 700,
                        border: pct === 100 ? "1px solid var(--border)" : "none",
                        boxShadow: pct === 100 ? "none" : "0 2px 10px var(--accent-glow)",
                      }}>
                        {pct === 100 ? "Done ✓" : pct > 0 ? "Continue" : "Start"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Discover More */}
          {recommended.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 className="font-heading" style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
                  {enrolledCourses.length === 0 ? "Start Learning" : "Discover More"}
                </h2>
                <Link href="/courses" style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-hover)" }}>
                  Browse all courses →
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {recommended.map((course) => (
                  <Link key={course.id} href={`/courses/${course.slug}`} className="glow-card" style={{
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 12, padding: 16, display: "block",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, marginBottom: 12,
                      background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                    }}>
                      📗
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                      color: levelColor[course.level] ?? "var(--muted)",
                      background: levelBg[course.level] ?? "var(--card)",
                      padding: "2px 8px", borderRadius: 99, marginBottom: 8, display: "inline-block",
                    }}>
                      {course.level}
                    </span>
                    <p className="font-heading" style={{
                      fontSize: 13, fontWeight: 700, color: "var(--text)",
                      lineHeight: 1.4, marginTop: 6, marginBottom: 6,
                    }}>
                      {course.title}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--subtle)" }}>
                      {course._count.courseLessons} lessons
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {enrolledCourses.length === 0 && recommended.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px", border: "1px dashed var(--border)", borderRadius: 12 }}>
              <p style={{ fontSize: 28, marginBottom: 10 }}>🚀</p>
              <p className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                No courses available yet
              </p>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>Check back soon or ask an admin to publish courses.</p>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Learning Streak */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>🔥</span>
              <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>
                Learning Streak
              </p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "var(--yellow)", marginBottom: 2 }}>
              {streakCount} <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                day{streakCount !== 1 ? "s" : ""} in a row
              </span>
            </p>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 16 }}>
              {streakCount === 0 ? "Complete a lesson to start your streak!" : "Keep it up!"}
            </p>

            {/* Day dots */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {streakDays.map((d, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: d.active ? "var(--accent)" : "var(--surface)",
                    border: `2px solid ${d.active ? "var(--accent)" : "var(--border)"}`,
                    boxShadow: d.active ? "0 2px 10px var(--accent-glow)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {d.active && (
                      <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: d.active ? "var(--accent-hover)" : "var(--subtle)", textTransform: "uppercase" }}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Progress */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 20px" }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em", marginBottom: 4 }}>
              Overall Progress
            </p>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 20 }}>
              {overallProgress === 0
                ? "Enroll in a course to track progress."
                : overallProgress === 100
                ? "Amazing! You completed everything! 🎉"
                : "Keep going, you can do it!"}
            </p>

            {/* Circular progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
                <svg width={96} height={96} viewBox="0 0 96 96">
                  {/* Track */}
                  <circle cx={48} cy={48} r={r} fill="none" stroke="var(--border)" strokeWidth={7} />
                  {/* Progress arc */}
                  <circle
                    cx={48} cy={48} r={r}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    transform="rotate(-90 48 48)"
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column",
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
                    {overallProgress}%
                  </span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {completedCount} / {totalLessons}
                </p>
                <p style={{ fontSize: 11, color: "var(--subtle)", lineHeight: 1.5 }}>
                  lessons<br />completed
                </p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Quick Links
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "Browse Courses", href: "/courses", icon: "📚" },
                { label: "My Profile", href: "/profile", icon: "👤" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 9,
                  fontSize: 13, fontWeight: 500, color: "var(--muted)",
                  transition: "all 0.15s",
                }}>
                  <span>{l.icon}</span>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
