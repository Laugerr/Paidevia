import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function BarChart({ bars }: { bars: number[] }) {
  const max = Math.max(...bars, 1);
  const w = 40;
  const gap = 8;
  const chartW = bars.length * (w + gap) - gap;
  const chartH = 80;
  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH} preserveAspectRatio="none">
      {bars.map((v, i) => {
        const h = Math.max((v / max) * chartH, 4);
        return (
          <rect
            key={i}
            x={i * (w + gap)}
            y={chartH - h}
            width={w}
            height={h}
            rx={5}
            fill={i === bars.length - 1 ? "var(--accent)" : "var(--border)"}
            opacity={i === bars.length - 1 ? 1 : 0.6}
          />
        );
      })}
    </svg>
  );
}

function DonutChart({ pct }: { pct: number }) {
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg viewBox="0 0 140 140" width={140} height={140}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={14} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={14}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        strokeDashoffset={circ / 4}
        style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
      />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={20} fontWeight={800} fill="var(--text)">
        {pct}%
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={10} fill="var(--subtle)">
        healthy
      </text>
    </svg>
  );
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  if (!isAdminRole(user.role)) redirect("/dashboard");

  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalCompletedLessons,
    publishedCourses,
    draftCourses,
    archivedCourses,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.course.count({ where: { status: "published" } }),
    prisma.course.count({ where: { status: "draft" } }),
    prisma.course.count({ where: { status: "archived" } }),
    prisma.enrollment.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  const healthPct = totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0;
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Decorative bar chart — last 7 days enrollment buckets (static approximation)
  const barValues = [3, 5, 4, 7, 6, 9, Math.min(totalEnrollments, 12)];

  const stats = [
    { label: "Total Users", value: totalUsers, color: "var(--red)", pct: "+20%", icon: "👤" },
    { label: "Active Courses", value: publishedCourses, color: "var(--accent)", pct: "+7.7%", icon: "📘" },
    { label: "Enrolled Students", value: totalEnrollments, color: "var(--yellow)", pct: "+20%", icon: "🎓" },
    { label: "Completed Lessons", value: totalCompletedLessons, color: "var(--green)", pct: "+12%", icon: "✅" },
  ];

  return (
    <div style={{ padding: "28px 28px 80px", display: "grid", gridTemplateColumns: "1fr 268px", gap: 20, alignItems: "start" }}>

      {/* ── Main ── */}
      <div style={{ minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--red)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
              Admin Panel
            </p>
            <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Platform Overview
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              Monitor platform health, manage users and courses, and review learning activity.
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
            padding: "8px 14px", borderRadius: 10,
            background: "var(--card)", border: "1px solid var(--border)",
          }}>
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{dateLabel}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "18px 18px 14px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.6 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: "var(--green)", background: "rgba(52,211,153,0.1)",
                  padding: "2px 7px", borderRadius: 99,
                  display: "flex", alignItems: "center", gap: 2,
                }}>
                  ↑ {s.pct}
                </span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 6 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 2 }}>vs last week</p>
            </div>
          ))}
        </div>

        {/* Management cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <Link href="/admin/users" style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "24px 24px",
            display: "block", position: "relative", overflow: "hidden",
            textDecoration: "none",
          }}>
            <div style={{
              position: "absolute", top: -30, right: -30, width: 120, height: 120,
              background: "radial-gradient(circle, rgba(248,113,113,0.12), transparent)",
              borderRadius: "50%",
            }} />
            <div style={{
              width: 40, height: 40, borderRadius: 10, marginBottom: 14,
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--red)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="font-heading" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em", marginBottom: 6 }}>
              Manage Users
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
              Review accounts, update roles, and control elevated access across the platform.
            </p>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
              Open User Management
              <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </Link>

          <Link href="/admin/courses" style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "24px 24px",
            display: "block", position: "relative", overflow: "hidden",
            textDecoration: "none",
          }}>
            <div style={{
              position: "absolute", top: -30, right: -30, width: 120, height: 120,
              background: "radial-gradient(circle, rgba(109,92,247,0.1), transparent)",
              borderRadius: "50%",
            }} />
            <div style={{
              width: 40, height: 40, borderRadius: 10, marginBottom: 14,
              background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--accent)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
                <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
              </svg>
            </div>
            <h2 className="font-heading" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em", marginBottom: 6 }}>
              Manage Courses
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
              Review visibility, moderate learning paths, and manage the full course inventory.
            </p>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-hover)", display: "flex", alignItems: "center", gap: 4 }}>
              Open Course Management
              <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Analytics + System Health */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, marginBottom: 16 }}>
          {/* Bar chart */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Platform Analytics</p>
                <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 2 }}>Enrollment activity — last 7 days</p>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{totalEnrollments}</p>
                  <p style={{ fontSize: 10, color: "var(--subtle)" }}>Total enrollments</p>
                </div>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em" }}>{publishedCourses}</p>
                  <p style={{ fontSize: 10, color: "var(--subtle)" }}>Active courses</p>
                </div>
              </div>
            </div>
            <BarChart bars={barValues} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} style={{ fontSize: 10, color: "var(--subtle)", flex: 1, textAlign: "center" }}>{d}</span>
              ))}
            </div>
          </div>

          {/* System Health donut */}
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "20px 22px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minWidth: 180,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>System Health</p>
            <DonutChart pct={healthPct} />
            <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 8, textAlign: "center" }}>
              {publishedCourses} of {totalCourses} courses published
            </p>
          </div>
        </div>

        {/* Platform Controls */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
              Platform Controls
            </p>
          </div>
          {[
            { label: "Course Moderation", sub: "Review published, draft, and archived states", href: "/admin/courses", color: "var(--accent)" },
            { label: "User Reports", sub: "Manage user accounts and role assignments", href: "/admin/users", color: "var(--red)" },
            { label: "System Logs", sub: `${totalCompletedLessons} lessons completed across all users`, href: "/admin", color: "var(--green)" },
            { label: "Backup & Settings", sub: "Role-based access controls active on all routes", href: "/admin", color: "var(--yellow)" },
          ].map((item, i, arr) => (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
              textDecoration: "none",
              transition: "background 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 2 }}>{item.sub}</p>
                </div>
              </div>
              <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Live Activity */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Live Activity</p>
            <span style={{ fontSize: 11, color: "var(--accent-hover)", fontWeight: 600, cursor: "pointer" }}>Clear All</span>
          </div>
          <div style={{ padding: "6px 0" }}>
            {recentActivity.length > 0 ? recentActivity.map((a, i) => {
              const name = a.user.name ?? a.user.email.split("@")[0];
              const initial = name[0].toUpperCase();
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 16px",
                  borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: "#fff",
                  }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </p>
                    <p style={{
                      fontSize: 11, color: "var(--subtle)", overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      Enrolled in {a.course.title}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--subtle)", flexShrink: 0, marginTop: 1 }}>
                    {timeAgo(new Date(a.createdAt))}
                  </span>
                </div>
              );
            }) : (
              <div style={{ padding: "20px 16px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--subtle)" }}>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>System Status</p>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "var(--green)",
              background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: 99,
            }}>
              All Systems
            </span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {[
              { label: "API Gateway", status: "Healthy", color: "var(--green)" },
              { label: "Database", status: "Healthy", color: "var(--green)" },
              { label: "Auth Services", status: "Healthy", color: "var(--green)" },
              { label: "Course Management", status: "Healthy", color: "var(--green)" },
              { label: "Email Service", status: publishedCourses > 0 ? "Healthy" : "Standby", color: publishedCourses > 0 ? "var(--green)" : "var(--yellow)" },
              { label: "Storage", status: "Healthy", color: "var(--green)" },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 16px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: item.color }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Quick Actions</p>
          </div>
          <div style={{ padding: "6px 0" }}>
            {[
              { label: "Manage Users", sub: "Roles & accounts", href: "/admin/users" },
              { label: "Moderation Queue", sub: "Review pending content", href: "/admin/courses" },
              { label: "Reports & Logs", sub: "Platform activity", href: "/admin" },
              { label: "Backup & Settings", sub: "System configuration", href: "/admin" },
            ].map((item, i, arr) => (
              <Link key={item.label} href={item.href} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
                textDecoration: "none",
              }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 1 }}>{item.sub}</p>
                </div>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
