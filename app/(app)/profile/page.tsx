import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isUserRole } from "@/lib/roles";
import { EditNameForm, ChangePasswordForm } from "@/components/ProfileForms";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true, password: true },
  });
  if (!user) redirect("/login");

  const [enrollmentCount, completedCount] = await Promise.all([
    prisma.enrollment.count({ where: { userId: user.id } }),
    prisma.lessonProgress.count({ where: { userId: user.id, completed: true } }),
  ]);

  const role = isUserRole(user.role) ? user.role : "student";
  const fallback = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();
  const hasPassword = !!user.password;

  const roleColor: Record<string, string> = {
    admin: "var(--red)", instructor: "var(--yellow)", student: "var(--accent-hover)",
  };
  const roleBg: Record<string, string> = {
    admin: "rgba(248,113,113,0.1)", instructor: "rgba(251,191,36,0.1)", student: "rgba(139,125,255,0.1)",
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="r-page" style={{ padding: "32px 32px 80px", maxWidth: 720 }}>

      {/* Page title */}
      <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 28 }}>
        Profile
      </h1>

      {/* Identity card */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "28px 28px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 22,
      }}>
        {user.image ? (
          <img src={user.image} alt="avatar" referrerPolicy="no-referrer"
            style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: 16, flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: "#fff",
          }}>
            {fallback}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="font-heading" style={{
            fontSize: 20, fontWeight: 800, color: "var(--text)",
            letterSpacing: "-0.02em", marginBottom: 4,
          }}>
            {user.name ?? "Anonymous User"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 10 }}>{user.email}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: roleColor[role] ?? "var(--muted)",
              padding: "3px 12px", borderRadius: 99,
              border: `1px solid ${roleColor[role] ?? "var(--border)"}33`,
              background: roleBg[role] ?? "transparent",
              textTransform: "capitalize",
            }}>
              {role}
            </span>
            <span style={{ fontSize: 12, color: "var(--subtle)" }}>Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Courses Enrolled", value: enrollmentCount, color: "var(--accent-hover)" },
          { label: "Lessons Completed", value: completedCount, color: "var(--green)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ fontSize: 30, fontWeight: 800, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit name */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Edit Profile</p>
          <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 2 }}>Update your display name</p>
        </div>
        <div style={{ padding: "24px" }}>
          <EditNameForm currentName={user.name ?? ""} />
        </div>
      </div>

      {/* Change password */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Change Password</p>
          <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 2 }}>
            {hasPassword ? "Update your account password" : "Not available for OAuth accounts"}
          </p>
        </div>
        <div style={{ padding: "24px" }}>
          <ChangePasswordForm hasPassword={hasPassword} />
        </div>
      </div>
    </div>
  );
}
