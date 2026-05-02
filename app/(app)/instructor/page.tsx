import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessInstructorArea, isAdminRole } from "@/lib/roles";

function Sparkline({ color = "var(--accent)" }: { color?: string }) {
  return (
    <svg viewBox="0 0 80 28" width={80} height={28} fill="none">
      <polyline
        points="0,22 12,16 24,20 36,8 48,14 60,6 72,10 80,4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
    </svg>
  );
}

export default async function InstructorPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, role: true },
  });
  if (!user) redirect("/login");
  if (!canAccessInstructorArea(user.role)) redirect("/dashboard");

  const ownedCourses = await prisma.course.findMany({
    where: { instructorId: user.id },
    include: {
      enrollments: { select: { id: true } },
      _count: { select: { courseLessons: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const draftCourses = ownedCourses.filter((c) => c.status === "draft");
  const publishedCourses = ownedCourses.filter((c) => c.status === "published");
  const archivedCourses = ownedCourses.filter((c) => c.status === "archived");
  const totalEnrollments = ownedCourses.reduce((sum, c) => sum + c.enrollments.length, 0);
  const firstName = user.name?.split(" ")[0] ?? "Instructor";

  const statusColor: Record<string, string> = {
    published: "var(--green)",
    draft: "var(--yellow)",
    archived: "var(--subtle)",
  };

  const stats = [
    { label: "Total Courses", value: ownedCourses.length, color: "var(--accent)", sparkColor: "#6d5cf7" },
    { label: "Published", value: publishedCourses.length, color: "var(--green)", sparkColor: "#34d399" },
    { label: "Drafts", value: draftCourses.length, color: "var(--yellow)", sparkColor: "#fbbf24" },
    { label: "Enrollments", value: totalEnrollments, color: "var(--blue)", sparkColor: "#60a5fa" },
  ];

  return (
    <div style={{ padding: "28px 28px 80px", maxWidth: 1100 }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 24,
        marginBottom: 28,
      }}>
        <div>
          <p style={{
            fontSize: 10, fontWeight: 700, color: "var(--accent-hover)",
            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6,
          }}>
            Instructor Workspace
          </p>
          <h1 className="font-heading" style={{
            fontSize: 26, fontWeight: 800, color: "var(--text)",
            letterSpacing: "-0.02em", marginBottom: 4,
          }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            Manage your courses and track student progress from one place.
            {isAdminRole(user.role) && " · Admin access enabled."}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: 13, fontWeight: 600, color: "var(--muted)",
            padding: "8px 16px", borderRadius: 10,
            background: "var(--card)", border: "1px solid var(--border)",
            transition: "all 0.15s",
          }}>
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View as Student
          </Link>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "var(--card)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--muted)",
          }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "20px 20px 14px",
            display: "flex", flexDirection: "column",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--subtle)", marginBottom: 8 }}>
              {s.label}
            </p>
            <p style={{
              fontSize: 32, fontWeight: 800, color: s.color,
              letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 10,
            }}>
              {s.value}
            </p>
            <div style={{ marginTop: "auto" }}>
              <Sparkline color={s.sparkColor} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Main + Right panel ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

        {/* Course list */}
        <div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 14,
          }}>
            <h2 className="font-heading" style={{
              fontSize: 17, fontWeight: 700, color: "var(--text)",
              letterSpacing: "-0.01em",
            }}>
              My Courses
            </h2>
            <Link href="/instructor/courses/new" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 600, color: "#fff",
              background: "var(--accent)", padding: "7px 16px", borderRadius: 9,
              boxShadow: "0 2px 12px var(--accent-glow)",
            }}>
              <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Course
            </Link>
          </div>

          {ownedCourses.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ownedCourses.map((course) => (
                <div key={course.id} style={{
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "18px 22px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <h3 className="font-heading" style={{
                          fontSize: 15, fontWeight: 700, color: "var(--text)",
                          letterSpacing: "-0.01em",
                        }}>
                          {course.title}
                        </h3>
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.06em", color: statusColor[course.status] ?? "var(--muted)",
                          padding: "2px 8px", borderRadius: 99,
                          border: "1px solid currentColor", flexShrink: 0,
                        }}>
                          {course.status}
                        </span>
                      </div>
                      {course.description && (
                        <p style={{
                          fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 10,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {course.description}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 12, color: "var(--subtle)" }}>{course._count.courseLessons} lessons</span>
                        <span style={{ fontSize: 12, color: "var(--subtle)" }}>·</span>
                        <span style={{ fontSize: 12, color: "var(--subtle)" }}>{course.enrollments.length} enrolled</span>
                        <span style={{ fontSize: 12, color: "var(--subtle)" }}>·</span>
                        <span style={{ fontSize: 12, color: "var(--subtle)" }}>{course.level}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <Link href={`/courses/${course.slug}`} style={{
                        fontSize: 12, fontWeight: 500, color: "var(--muted)",
                        padding: "7px 14px", borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}>
                        View
                      </Link>
                      <Link href={`/instructor/courses/${course.id}`} style={{
                        fontSize: 12, fontWeight: 600, color: "#fff",
                        background: "var(--accent)", padding: "7px 14px", borderRadius: 8,
                      }}>
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center", padding: "64px 32px",
              background: "var(--card)", border: "1px dashed var(--border)",
              borderRadius: 16,
            }}>
              <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>💻</div>
              <p className="font-heading" style={{
                fontSize: 20, fontWeight: 800, color: "var(--text)",
                letterSpacing: "-0.02em", marginBottom: 10,
              }}>
                No courses yet
              </p>
              <p style={{
                color: "var(--muted)", fontSize: 14, lineHeight: 1.7,
                maxWidth: 340, margin: "0 auto 24px",
              }}>
                Share your knowledge with the world. Create your first course and start building your instructor profile.
              </p>
              <Link href="/instructor/courses/new" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 14, fontWeight: 700, color: "#fff",
                background: "var(--accent)", padding: "11px 24px", borderRadius: 10,
                boxShadow: "0 2px 16px var(--accent-glow)",
              }}>
                Create Your First Course
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Status Dashboard */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "var(--subtle)",
              textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14,
            }}>
              Status Dashboard
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Published", value: publishedCourses.length, dot: "var(--green)" },
                { label: "Drafts", value: draftCourses.length, dot: "var(--yellow)" },
                { label: "Archived", value: archivedCourses.length, dot: "var(--subtle)" },
                { label: "Students Enrolled", value: totalEnrollments, dot: "var(--blue)" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 12px", borderRadius: 9,
                  background: "var(--surface)", border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: item.dot, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "var(--subtle)",
              textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14,
            }}>
              Quick Actions
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                {
                  label: "Create New Course",
                  sub: "Start from scratch",
                  href: "/instructor/courses/new",
                  accent: true,
                  icon: <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>,
                },
                {
                  label: "Browse Catalog",
                  sub: "See all available courses",
                  href: "/courses",
                  accent: false,
                  icon: <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" /><path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" /></svg>,
                },
                {
                  label: "View Dashboard",
                  sub: "Your learning overview",
                  href: "/dashboard",
                  accent: false,
                  icon: <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>,
                },
              ].map((action) => (
                <Link key={action.label} href={action.href} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 9,
                  color: action.accent ? "#fff" : "var(--muted)",
                  background: action.accent ? "var(--accent)" : "var(--surface)",
                  border: action.accent ? "none" : "1px solid var(--border-subtle)",
                  boxShadow: action.accent ? "0 2px 12px var(--accent-glow)" : "none",
                  textDecoration: "none",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: action.accent ? "rgba(255,255,255,0.15)" : "var(--card)",
                    border: action.accent ? "none" : "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: action.accent ? "#fff" : "var(--subtle)",
                  }}>
                    {action.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: action.accent ? "#fff" : "var(--text)", lineHeight: 1.2 }}>
                      {action.label}
                    </p>
                    <p style={{ fontSize: 11, color: action.accent ? "rgba(255,255,255,0.65)" : "var(--subtle)", marginTop: 1 }}>
                      {action.sub}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended Flow */}
          <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: 14, padding: 20 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "var(--accent-hover)",
              textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14,
            }}>
              Recommended Flow
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { title: "Define your course", sub: "Set the title, level, and description" },
                { title: "Build your lessons", sub: "Add and organize lesson content" },
                { title: "Publish when ready", sub: "Run the checklist and go live" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                    background: "var(--accent)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "#fff",
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, lineHeight: 1.5 }}>
                      {step.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
