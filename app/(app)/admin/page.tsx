import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  if (!isAdminRole(user.role)) redirect("/dashboard");

  const [totalUsers, totalCourses, totalEnrollments, totalCompletedLessons] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.lessonProgress.count({ where: { completed: true } }),
  ]);

  const stats = [
    { label: "Users", value: totalUsers, color: "var(--red)", detail: "Active accounts" },
    { label: "Courses", value: totalCourses, color: "var(--accent)", detail: "In catalog" },
    { label: "Enrollments", value: totalEnrollments, color: "var(--yellow)", detail: "Total signups" },
    { label: "Completed Lessons", value: totalCompletedLessons, color: "var(--green)", detail: "Finished by learners" },
  ];

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Admin Panel
        </p>
        <h1 className="font-heading" style={{
          fontSize: 28, fontWeight: 800, color: "var(--text)",
          letterSpacing: "-0.02em", marginBottom: 6,
        }}>
          Platform Overview
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Monitor platform health, manage users and courses, and review learning activity.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "20px 22px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: s.color, opacity: 0.5,
            }} />
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>
              {s.value}
            </p>
            <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, marginTop: 2 }}>{s.label}</p>
            <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 2 }}>{s.detail}</p>
          </div>
        ))}
      </div>

      {/* Management cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        <Link href="/admin/users" className="glow-card" style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "28px 28px",
          display: "block", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 120, height: 120,
            background: "radial-gradient(circle, rgba(248,113,113,0.1), transparent)",
            borderRadius: "50%",
          }} />
          <div style={{
            width: 44, height: 44, borderRadius: 12, marginBottom: 18,
            background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="var(--red)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h2 className="font-heading" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 8 }}>
            Manage Users
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
            Review accounts, update roles, and control elevated access across the platform.
          </p>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
            Open user management
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </Link>

        <Link href="/admin/courses" className="glow-card" style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "28px 28px",
          display: "block", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 120, height: 120,
            background: "radial-gradient(circle, rgba(109,92,247,0.1), transparent)",
            borderRadius: "50%",
          }} />
          <div style={{
            width: 44, height: 44, borderRadius: 12, marginBottom: 18,
            background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="var(--accent)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
              <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
            </svg>
          </div>
          <h2 className="font-heading" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 8 }}>
            Manage Courses
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
            Review visibility, moderate learning paths, and manage the full course inventory.
          </p>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-hover)", display: "flex", alignItems: "center", gap: 4 }}>
            Open course management
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </Link>
      </div>

      {/* Info panel */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Platform Controls
          </p>
        </div>
        {[
          { label: "Role control", value: "Server-side checks protect all admin and instructor routes" },
          { label: "Course moderation", value: "Manage published, draft, and archived course states" },
          { label: "Learning activity", value: `${totalCompletedLessons} lessons completed across all users` },
        ].map((item, i, arr) => (
          <div key={item.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 20px",
            borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
          }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{item.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", maxWidth: 340, textAlign: "right" }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
