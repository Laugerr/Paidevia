import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isUserRole } from "@/lib/roles";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login");

  const [enrollmentCount, completedCount] = await Promise.all([
    prisma.enrollment.count({ where: { userId: user.id } }),
    prisma.lessonProgress.count({ where: { userId: user.id, completed: true } }),
  ]);

  const role = isUserRole(user.role) ? user.role : "student";
  const fallback = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();

  const roleColors: Record<string, string> = {
    admin: "var(--red)",
    instructor: "var(--yellow)",
    student: "var(--accent)",
  };
  const roleColor = roleColors[role] ?? "var(--muted)";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 720 }}>
      <h1 className="font-heading" style={{
        fontSize: 28,
        fontWeight: 800,
        color: "var(--text)",
        letterSpacing: "-0.02em",
        marginBottom: 32,
      }}>
        Profile
      </h1>

      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 32,
        display: "flex",
        alignItems: "center",
        gap: 24,
        marginBottom: 16,
      }}>
        {user.image ? (
          <img src={user.image} alt="avatar" referrerPolicy="no-referrer"
            style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: "var(--accent-hover)", flexShrink: 0,
          }}>
            {fallback}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6 }}>
            {user.name ?? "Anonymous User"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 10 }}>{user.email}</p>
          <span style={{
            display: "inline-block", fontSize: 12, fontWeight: 700, color: roleColor,
            padding: "3px 12px", borderRadius: 99, border: `1px solid ${roleColor}33`,
            background: `${roleColor}11`, textTransform: "capitalize",
          }}>
            {role}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Enrolled Courses", value: String(enrollmentCount), color: "var(--accent)" },
          { label: "Lessons Done", value: String(completedCount), color: "var(--green)" },
          { label: "Member Since", value: memberSince, color: "var(--text)", small: true },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: s.small ? 14 : 28, fontWeight: 800, color: s.color, letterSpacing: "-0.02em", marginBottom: 4 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Account Details
          </p>
        </div>
        {[
          { label: "Full Name", value: user.name ?? "—" },
          { label: "Email", value: user.email ?? "—" },
          { label: "Role", value: role.charAt(0).toUpperCase() + role.slice(1) },
        ].map((field, i, arr) => (
          <div key={field.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 20px",
            borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
          }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{field.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
