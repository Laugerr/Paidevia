import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessInstructorArea, isAdminRole } from "@/lib/roles";

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
    include: { enrollments: { select: { id: true } } },
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

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hover)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Instructor Workspace
        </p>
        <h1 className="font-heading" style={{
          fontSize: 28, fontWeight: 800, color: "var(--text)",
          letterSpacing: "-0.02em", marginBottom: 6,
        }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Manage your courses and track student progress from one place.
          {isAdminRole(user.role) && " · Admin access enabled."}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 36 }}>
        {[
          { label: "Total Courses", value: ownedCourses.length, color: "var(--accent)" },
          { label: "Published", value: publishedCourses.length, color: "var(--green)" },
          { label: "Drafts", value: draftCourses.length, color: "var(--yellow)" },
          { label: "Enrollments", value: totalEnrollments, color: "var(--blue)" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "18px 20px",
          }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>
              {s.value}
            </p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

        {/* Course list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 className="font-heading" style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
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
                  borderRadius: 12, padding: "18px 22px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
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
                        <span style={{ fontSize: 12, color: "var(--subtle)" }}>{course.lessons} lessons</span>
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
              textAlign: "center", padding: "56px 24px",
              border: "1px dashed var(--border)", borderRadius: 12,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px",
                background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="var(--accent)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                No courses yet
              </p>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
                Create your first course to start teaching.
              </p>
              <Link href="/instructor/courses/new" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 600, color: "#fff",
                background: "var(--accent)", padding: "10px 20px", borderRadius: 9,
              }}>
                Create First Course
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Status breakdown */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
              Status Breakdown
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Published", value: publishedCourses.length, color: "var(--green)" },
                { label: "Drafts", value: draftCourses.length, color: "var(--yellow)" },
                { label: "Archived", value: archivedCourses.length, color: "var(--subtle)" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 9,
                  background: "var(--surface)", border: "1px solid var(--border-subtle)",
                }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{item.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
              Quick Actions
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Create New Course", href: "/instructor/courses/new", accent: true },
                { label: "Browse Catalog", href: "/courses", accent: false },
                { label: "View Dashboard", href: "/dashboard", accent: false },
              ].map((action) => (
                <Link key={action.label} href={action.href} style={{
                  display: "block", padding: "10px 14px", borderRadius: 9,
                  fontSize: 13, fontWeight: 600,
                  color: action.accent ? "#fff" : "var(--muted)",
                  background: action.accent ? "var(--accent)" : "var(--surface)",
                  border: action.accent ? "none" : "1px solid var(--border-subtle)",
                  boxShadow: action.accent ? "0 2px 10px var(--accent-glow)" : "none",
                }}>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Workflow tip */}
          <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hover)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Recommended Flow
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Create a draft and define the course identity",
                "Add and organize lessons in the editor",
                "Run through the checklist before publishing",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "var(--accent-hover)",
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
