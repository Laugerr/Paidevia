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
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const roleColor: Record<string, string> = {
    admin: "var(--red)", instructor: "var(--yellow)", student: "var(--accent-hover)",
  };
  const roleBg: Record<string, string> = {
    admin: "rgba(248,113,113,0.1)", instructor: "rgba(251,191,36,0.1)", student: "rgba(139,125,255,0.1)",
  };

  return (
    <div className="r-page" style={{ padding: "28px 28px 80px", maxWidth: 1100 }}>

      {/* ── Top header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-heading" style={{
          fontSize: 26, fontWeight: 800, color: "var(--text)",
          letterSpacing: "-0.02em", marginBottom: 4,
        }}>
          Profile
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Manage your account information and preferences.
        </p>
      </div>

      {/* ── Hero identity card ── */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 20, overflow: "hidden", marginBottom: 20,
        display: "flex", alignItems: "stretch",
        position: "relative",
      }}>
        {/* Left content */}
        <div style={{ flex: 1, padding: "32px 32px", display: "flex", alignItems: "center", gap: 24, minWidth: 0 }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {user.image ? (
              <img src={user.image} alt="avatar" referrerPolicy="no-referrer"
                style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border)" }} />
            ) : (
              <div style={{
                width: 88, height: 88, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 800, color: "#fff",
                border: "3px solid var(--border)",
              }}>
                {fallback}
              </div>
            )}
            {/* Edit overlay */}
            <div style={{
              position: "absolute", bottom: 2, right: 2,
              width: 24, height: 24, borderRadius: "50%",
              background: "var(--accent)", border: "2px solid var(--card)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div style={{ minWidth: 0 }}>
            <h2 className="font-heading" style={{
              fontSize: 22, fontWeight: 800, color: "var(--text)",
              letterSpacing: "-0.02em", marginBottom: 4,
            }}>
              {user.name ?? "Anonymous User"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{user.email}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: roleColor[role] ?? "var(--muted)",
                background: roleBg[role] ?? "transparent",
                padding: "3px 12px", borderRadius: 99,
                border: `1px solid ${roleColor[role] ?? "var(--border)"}33`,
                textTransform: "capitalize",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                ✓ {role}
              </span>
              <span style={{ fontSize: 12, color: "var(--subtle)" }}>
                Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Right decorative panel */}
        <div className="r-hide-mobile" style={{
          width: 200, flexShrink: 0,
          background: "linear-gradient(135deg, rgba(109,92,247,0.25) 0%, rgba(167,139,250,0.15) 50%, rgba(52,211,153,0.1) 100%)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(109,92,247,0.2)",
          }} />
          <div style={{
            position: "absolute", bottom: -30, left: -20,
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(52,211,153,0.15)",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 48, opacity: 0.3,
          }}>
            🛡️
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          {
            icon: "📘", value: enrollmentCount,
            label: "Courses Enrolled",
            sub: enrollmentCount === 0 ? "Start your learning journey" : "Keep learning and growing",
            color: "var(--accent-hover)",
          },
          {
            icon: "✅", value: completedCount,
            label: "Lessons Completed",
            sub: completedCount === 0 ? "Complete your first lesson!" : "Great progress! Keep it up!",
            color: "var(--green)",
          },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "20px 24px",
            display: "flex", alignItems: "center", gap: 18,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: "var(--surface)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 4, marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: "var(--subtle)" }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Profile + Change Password ── */}
      <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Edit Profile */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Edit Profile</p>
              <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 2 }}>
                Update your display name and how it appears on the platform.
              </p>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--accent-hover)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            {/* Avatar preview */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ position: "relative" }}>
                {user.image ? (
                  <img src={user.image} alt="avatar" referrerPolicy="no-referrer"
                    style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} />
                ) : (
                  <div style={{
                    width: 54, height: 54, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: "#fff",
                    border: "2px solid var(--border)",
                  }}>
                    {fallback}
                  </div>
                )}
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "var(--accent)", border: "2px solid var(--card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg viewBox="0 0 24 24" width={9} height={9} fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{user.name ?? "User"}</p>
                <p style={{ fontSize: 11, color: "var(--subtle)", textTransform: "capitalize" }}>{role}</p>
              </div>
            </div>

            <EditNameForm currentName={user.name ?? ""} />
          </div>
        </div>

        {/* Change Password */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Change Password</p>
              <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 2 }}>
                For your security, choose a strong password.
              </p>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: "var(--green-bg)", border: "1px solid rgba(52,211,153,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--green)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            {!hasPassword && (
              <div style={{
                padding: "14px 16px",
                background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                borderRadius: 10, marginBottom: 16,
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--accent-hover)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                  Password change is only available for accounts registered with email and password.
                </p>
              </div>
            )}

            <ChangePasswordForm hasPassword={hasPassword} />

            {!hasPassword && (
              <div style={{
                marginTop: 16, padding: "12px 14px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10,
              }}>
                <p style={{ fontSize: 11, color: "var(--subtle)", lineHeight: 1.6 }}>
                  Your account uses OAuth (Google · GitHub). Password management is handled by your provider.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
