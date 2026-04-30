import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const levelGradient: Record<string, string> = {
  Beginner: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
  Intermediate: "linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)",
  Advanced: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)",
};

const levelColor: Record<string, string> = {
  Beginner: "#34d399",
  Intermediate: "#fbbf24",
  Advanced: "#f87171",
};

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const [courses, totalLessons] = await Promise.all([
    prisma.course.findMany({
      where: { status: "published", courseLessons: { some: {} } },
      select: {
        slug: true, title: true, description: true, level: true,
        _count: { select: { courseLessons: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.lesson.count(),
  ]);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
      }}>
        {/* Gradient orbs */}
        <div className="orb" style={{
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(109,92,247,0.18) 0%, transparent 70%)",
          top: "10%", left: "5%",
          animationDelay: "0s",
        }} />
        <div className="orb" style={{
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)",
          top: "20%", right: "5%",
          animationDelay: "3s",
        }} />
        <div className="orb" style={{
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(139,125,255,0.12) 0%, transparent 70%)",
          bottom: "10%", left: "30%",
          animationDelay: "5s",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 780 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 16px",
            borderRadius: 99,
            border: "1px solid var(--accent-border)",
            background: "var(--accent-bg)",
            marginBottom: 36,
            backdropFilter: "blur(10px)",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent-glow)",
            }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-hover)", letterSpacing: "0.02em" }}>
              Now live · Free to get started
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-heading" style={{
            fontSize: "clamp(40px, 7vw, 84px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: 28,
          }}>
            <span style={{ color: "var(--text)", display: "block" }}>The learning platform</span>
            <span className="gradient-text" style={{ display: "block" }}>
              built for builders.
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "var(--muted)",
            lineHeight: 1.75,
            maxWidth: 520,
            margin: "0 auto 48px",
          }}>
            Structured paths in cybersecurity, development, and AI.
            Real progress tracking from day one. No fluff.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/courses" style={{
              padding: "13px 32px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              boxShadow: "0 4px 24px var(--accent-glow)",
              transition: "all 0.2s",
              letterSpacing: "-0.01em",
            }}>
              Browse Courses
            </Link>
            <Link href="/login" style={{
              padding: "13px 32px",
              border: "1px solid var(--border)",
              color: "var(--text)",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              background: "var(--surface)",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s",
            }}>
              Sign In Free →
            </Link>
          </div>
        </div>

        {/* Stat bar */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginTop: 64,
          background: "rgba(15,15,23,0.7)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          backdropFilter: "blur(20px)",
          overflow: "hidden",
          width: "100%",
          maxWidth: 560,
        }}>
          {[
            { value: courses.length || "—", label: "Courses" },
            { value: totalLessons || "—", label: "Lessons" },
            { value: "Free", label: "Always" },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1,
              padding: "20px 16px",
              textAlign: "center",
              borderRight: i < 2 ? "1px solid var(--border)" : "none",
            }}>
              <p className="font-heading" style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, fontWeight: 500 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          opacity: 0.4,
        }}>
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* ── Courses ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 120px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-hover)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Course Library
            </p>
            <h2 className="font-heading" style={{
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}>
              Start learning today
            </h2>
          </div>
          <Link href="/courses" style={{
            fontSize: 13, fontWeight: 600, color: "var(--accent-hover)",
            display: "flex", alignItems: "center", gap: 4,
            padding: "8px 16px",
            border: "1px solid var(--accent-border)",
            borderRadius: 8,
            background: "var(--accent-bg)",
          }}>
            View all
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        {courses.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}>
            {courses.map((course) => (
              <Link key={course.slug} href={`/courses/${course.slug}`} className="glow-card" style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                overflow: "hidden",
                display: "block",
              }}>
                {/* Visual header */}
                <div style={{
                  height: 72,
                  background: levelGradient[course.level] ?? "linear-gradient(135deg, #1a1a28, #252540)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "0 20px 14px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)",
                  }} />
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: levelColor[course.level] ?? "white",
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    position: "relative",
                    zIndex: 1,
                  }}>
                    {course.level}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    marginLeft: "auto",
                    position: "relative",
                    zIndex: 1,
                  }}>
                    {course._count.courseLessons} lessons
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: "20px" }}>
                  <h3 className="font-heading" style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.3,
                    marginBottom: 10,
                  }}>
                    {course.title}
                  </h3>
                  <p style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    lineHeight: 1.65,
                    marginBottom: 18,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {course.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--subtle)", fontWeight: 500 }}>
                      Self-paced
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--accent-hover)",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}>
                      Start learning
                      <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: "center", padding: "80px 24px",
            border: "1px dashed var(--border)", borderRadius: 14,
          }}>
            <p className="font-heading" style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              Courses coming soon
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              We&apos;re preparing the catalog. Check back shortly.
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: 64,
          padding: "48px 40px",
          background: "linear-gradient(135deg, rgba(109,92,247,0.12) 0%, rgba(52,211,153,0.06) 100%)",
          border: "1px solid var(--accent-border)",
          borderRadius: 16,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200,
            background: "radial-gradient(circle, rgba(109,92,247,0.2), transparent)",
            borderRadius: "50%",
          }} />
          <h2 className="font-heading" style={{
            fontSize: 28, fontWeight: 800, color: "var(--text)",
            letterSpacing: "-0.03em", marginBottom: 10, position: "relative",
          }}>
            Ready to start?
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 28, position: "relative" }}>
            Create your account and begin your first course today. No credit card needed.
          </p>
          <Link href="/login" style={{
            padding: "13px 36px",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            boxShadow: "0 4px 24px var(--accent-glow)",
            display: "inline-block",
            position: "relative",
          }}>
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
