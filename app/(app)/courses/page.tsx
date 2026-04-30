import Link from "next/link";
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

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: "published", courseLessons: { some: {} } },
    select: {
      slug: true,
      title: true,
      description: true,
      level: true,
      _count: { select: { courseLessons: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 100px" }}>

      {/* Header */}
      <div style={{ marginBottom: 56, maxWidth: 600 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 14px", borderRadius: 99,
          border: "1px solid var(--accent-border)",
          background: "var(--accent-bg)",
          marginBottom: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-hover)", letterSpacing: "0.04em" }}>
            {courses.length} course{courses.length !== 1 ? "s" : ""} available
          </span>
        </div>
        <h1 className="font-heading" style={{
          fontSize: "clamp(28px, 5vw, 52px)",
          fontWeight: 900,
          color: "var(--text)",
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          Course Library
        </h1>
        <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.7 }}>
          Self-paced paths in cybersecurity, development, and AI. Pick a track and build real skills from day one.
        </p>
      </div>

      {/* Grid */}
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
              {/* Level gradient strip */}
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
                  fontSize: 11, fontWeight: 700,
                  color: levelColor[course.level] ?? "white",
                  padding: "3px 10px", borderRadius: 99,
                  background: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  position: "relative", zIndex: 1,
                }}>
                  {course.level}
                </span>
                <span style={{
                  fontSize: 11, color: "rgba(255,255,255,0.5)",
                  marginLeft: "auto", position: "relative", zIndex: 1,
                }}>
                  {course._count.courseLessons} lessons
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: "20px 20px 22px" }}>
                <h2 className="font-heading" style={{
                  fontSize: 16, fontWeight: 700, color: "var(--text)",
                  letterSpacing: "-0.02em", lineHeight: 1.35, marginBottom: 10,
                }}>
                  {course.title}
                </h2>
                <p style={{
                  fontSize: 13, color: "var(--muted)", lineHeight: 1.65,
                  marginBottom: 18,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
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
                    fontSize: 12, fontWeight: 700, color: "var(--accent-hover)",
                    display: "flex", alignItems: "center", gap: 3,
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
          textAlign: "center", padding: "100px 24px",
          border: "1px dashed var(--border)", borderRadius: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px",
            background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--accent)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
              <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
            </svg>
          </div>
          <p className="font-heading" style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            Courses coming soon
          </p>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            We&apos;re preparing the catalog. Check back shortly.
          </p>
        </div>
      )}
    </div>
  );
}
