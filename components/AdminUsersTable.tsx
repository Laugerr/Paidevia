"use client";

import { useState } from "react";
import { USER_ROLES, USER_ROLE_LABELS, isAdminRole, type UserRole } from "@/lib/roles";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  image: string | null;
};

type Props = {
  users: AdminUser[];
  currentUserId: string;
};

const roleColor: Record<UserRole, string> = {
  admin: "var(--red)",
  instructor: "var(--yellow)",
  student: "var(--accent-hover)",
};
const roleBg: Record<UserRole, string> = {
  admin: "rgba(248,113,113,0.1)",
  instructor: "rgba(251,191,36,0.1)",
  student: "rgba(139,125,255,0.1)",
};

export default function AdminUsersTable({ users: initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setError(null);
    setLoadingId(userId);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update role");
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setLoadingId(null);
    }
  };

  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalInstructors = users.filter((u) => u.role === "instructor").length;
  const totalStudents = users.filter((u) => u.role === "student").length;

  return (
    <div className="r-page" style={{ padding: "32px 32px 64px", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Admin · Users
        </p>
        <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          User Management
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Manage roles and access across all registered accounts.
        </p>
      </div>

      {/* Stat cards */}
      <div className="r-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Users", value: users.length, color: "var(--text)" },
          { label: "Admins", value: totalAdmins, color: "var(--red)" },
          { label: "Instructors", value: totalInstructors, color: "var(--yellow)" },
          { label: "Students", value: totalStudents, color: "var(--accent-hover)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px", marginBottom: 16,
          background: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: 10, fontSize: 13, color: "var(--red)",
        }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="r-table-wrap" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 120px 120px 160px",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          {["User", "Email", "Role", "Joined", "Change Role"].map((col) => (
            <span key={col} style={{ fontSize: 11, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {users.map((user, i) => {
          const fallback = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();
          const isMe = user.id === currentUserId;
          const isLoading = loadingId === user.id;
          const canChange = !(isMe && isAdminRole(user.role));

          return (
            <div
              key={user.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 120px 120px 160px",
                padding: "14px 20px",
                alignItems: "center",
                borderBottom: i < users.length - 1 ? "1px solid var(--border-subtle)" : "none",
                transition: "background 0.12s",
              }}
            >
              {/* User */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {user.image ? (
                  <img src={user.image} alt="" referrerPolicy="no-referrer"
                    style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "#fff",
                  }}>
                    {fallback}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name ?? "Unnamed"}
                    {isMe && (
                      <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "var(--accent-hover)", background: "var(--accent-bg)", padding: "1px 7px", borderRadius: 99 }}>
                        You
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.id.slice(0, 16)}…
                  </p>
                </div>
              </div>

              {/* Email */}
              <p style={{ fontSize: 13, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                {user.email ?? "—"}
              </p>

              {/* Role badge */}
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700,
                color: roleColor[user.role],
                background: roleBg[user.role],
                padding: "3px 10px", borderRadius: 99,
                border: `1px solid ${roleColor[user.role]}22`,
              }}>
                {USER_ROLE_LABELS[user.role]}
              </span>

              {/* Joined */}
              <p style={{ fontSize: 12, color: "var(--subtle)" }}>
                {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>

              {/* Role select */}
              <div>
                <select
                  value={user.role}
                  disabled={isLoading || !canChange}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                    cursor: !canChange || isLoading ? "not-allowed" : "pointer",
                    opacity: !canChange ? 0.5 : 1,
                  }}
                >
                  {USER_ROLES.map((r) => (
                    <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>
                  ))}
                </select>
                {isMe && isAdminRole(user.role) && (
                  <p style={{ fontSize: 10, color: "var(--subtle)", marginTop: 4 }}>Your role is protected</p>
                )}
                {isLoading && (
                  <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>Saving…</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
