"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
const roleDot: Record<UserRole, string> = {
  admin: "#f87171",
  instructor: "#fbbf24",
  student: "#8b7cf7",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function RoleDonut({ admins, instructors, students, total }: { admins: number; instructors: number; students: number; total: number }) {
  const r = 44;
  const cx = 56;
  const cy = 56;
  const circ = 2 * Math.PI * r;

  const safeTotal = total || 1;
  const adminPct = (admins / safeTotal);
  const instrPct = (instructors / safeTotal);
  const studPct = (students / safeTotal);

  const adminDash = adminPct * circ;
  const instrDash = instrPct * circ;
  const studDash = studPct * circ;

  const adminOffset = 0;
  const instrOffset = -adminDash;
  const studOffset = -(adminDash + instrDash);

  return (
    <svg viewBox="0 0 112 112" width={112} height={112}>
      {/* Background */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={12} />
      {/* Students */}
      {studPct > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#8b7cf7" strokeWidth={12}
          strokeDasharray={`${studDash} ${circ}`} strokeDashoffset={studOffset}
          style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
      )}
      {/* Instructors */}
      {instrPct > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fbbf24" strokeWidth={12}
          strokeDasharray={`${instrDash} ${circ}`} strokeDashoffset={instrOffset}
          style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
      )}
      {/* Admins */}
      {adminPct > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f87171" strokeWidth={12}
          strokeDasharray={`${adminDash} ${circ}`} strokeDashoffset={adminOffset}
          style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
      )}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={18} fontWeight={800} fill="var(--text)">{total}</text>
    </svg>
  );
}

export default function AdminUsersTable({ users: initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

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

  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, search, roleFilter]);

  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  const stats = [
    { label: "Total Users", value: users.length, color: "var(--text)", pct: "+20%" },
    { label: "Admins", value: totalAdmins, color: "var(--red)", pct: "+0%" },
    { label: "Instructors", value: totalInstructors, color: "var(--yellow)", pct: "+5%" },
    { label: "Students", value: totalStudents, color: "var(--accent-hover)", pct: "+20%" },
  ];

  return (
    <div style={{ padding: "28px 28px 80px", display: "grid", gridTemplateColumns: "1fr 240px", gap: 20, alignItems: "start" }}>

      {/* ── Main ── */}
      <div style={{ minWidth: 0 }}>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 13, color: "var(--subtle)" }}>
            <Link href="/admin" style={{ color: "var(--muted)" }}>Admin Panel</Link>
            <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>Users</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>
                User Management
              </h1>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>Manage roles and access across all registered accounts.</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 500,
                color: "var(--muted)", background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer",
              }}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filters
              </button>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 500,
                color: "var(--muted)", background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer",
              }}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "16px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--subtle)" }}>{s.label}</p>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "var(--green)",
                  background: "rgba(52,211,153,0.1)", padding: "2px 6px", borderRadius: 99,
                }}>
                  ↑ {s.pct}
                </span>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 4 }}>vs last month</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 12, position: "relative" }}>
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 36px",
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 10, fontSize: 13, color: "var(--text)", outline: "none",
            }}
          />
        </div>

        {/* Role filter pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {(["all", ...USER_ROLES] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                background: roleFilter === r ? "var(--accent)" : "var(--card)",
                color: roleFilter === r ? "#fff" : "var(--muted)",
                border: roleFilter === r ? "none" : "1px solid var(--border)",
                boxShadow: roleFilter === r ? "0 2px 8px var(--accent-glow)" : "none",
              }}
            >
              {r === "all" ? "All Users" : USER_ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "11px 14px", marginBottom: 12,
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 10, fontSize: 13, color: "var(--red)",
          }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 2fr 110px 110px 90px 140px",
            padding: "11px 20px", borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}>
            {["User", "Email", "Role", "Joined", "Status", "Change Role"].map((col) => (
              <span key={col} style={{ fontSize: 10, fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {col}
              </span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--subtle)" }}>No users match your search.</p>
            </div>
          ) : filtered.map((user, i) => {
            const fallback = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();
            const isMe = user.id === currentUserId;
            const isLoading = loadingId === user.id;
            const canChange = !(isMe && isAdminRole(user.role));

            return (
              <div key={user.id} style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 110px 110px 90px 140px",
                padding: "13px 20px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}>
                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  {user.image ? (
                    <img src={user.image} alt="" referrerPolicy="no-referrer"
                      style={{ width: 32, height: 32, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "#fff",
                    }}>
                      {fallback}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name ?? "Unnamed"}
                      {isMe && (
                        <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: "var(--accent-hover)", background: "var(--accent-bg)", padding: "1px 6px", borderRadius: 99 }}>
                          You
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.id.slice(0, 14)}…
                    </p>
                  </div>
                </div>

                {/* Email */}
                <p style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 10 }}>
                  {user.email ?? "—"}
                </p>

                {/* Role badge */}
                <span style={{
                  display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "capitalize",
                  color: roleColor[user.role], background: roleBg[user.role],
                  padding: "3px 9px", borderRadius: 99,
                  border: `1px solid ${roleColor[user.role]}33`,
                }}>
                  {USER_ROLE_LABELS[user.role]}
                </span>

                {/* Joined */}
                <p style={{ fontSize: 12, color: "var(--subtle)" }}>
                  {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>

                {/* Status */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11, fontWeight: 600, color: "var(--green)",
                  background: "rgba(52,211,153,0.1)", padding: "3px 9px", borderRadius: 99,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)" }} />
                  Active
                </span>

                {/* Change role */}
                <div>
                  <select
                    value={user.role}
                    disabled={isLoading || !canChange}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    style={{
                      width: "100%", padding: "6px 10px",
                      background: "var(--surface)", border: "1px solid var(--border)",
                      borderRadius: 8, fontSize: 12, fontWeight: 500, color: "var(--text)",
                      cursor: !canChange || isLoading ? "not-allowed" : "pointer",
                      opacity: !canChange ? 0.5 : 1,
                    }}
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  {isLoading && <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>Saving…</p>}
                  {isMe && isAdminRole(user.role) && <p style={{ fontSize: 10, color: "var(--subtle)", marginTop: 3 }}>Protected</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer count */}
        <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 12 }}>
          Showing {filtered.length} of {users.length} users
        </p>
      </div>

      {/* ── Right panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Role Distribution */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>User Role Distribution</p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <RoleDonut
              admins={totalAdmins}
              instructors={totalInstructors}
              students={totalStudents}
              total={users.length}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Admin", value: totalAdmins, dot: roleDot.admin },
              { label: "Instructor", value: totalInstructors, dot: roleDot.instructor },
              { label: "Student", value: totalStudents, dot: roleDot.student },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot }} />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{item.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{item.value}</span>
                  <span style={{ fontSize: 11, color: "var(--subtle)" }}>
                    ({users.length > 0 ? Math.round((item.value / users.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Recent Registrations</p>
          </div>
          <div style={{ padding: "6px 0" }}>
            {recentUsers.map((u, i) => {
              const fallback = (u.name?.[0] ?? u.email?.[0] ?? "U").toUpperCase();
              return (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 16px",
                  borderBottom: i < recentUsers.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}>
                  {u.image ? (
                    <img src={u.image} alt="" referrerPolicy="no-referrer"
                      style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "#fff",
                    }}>
                      {fallback}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.name ?? "Unnamed"}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--subtle)" }}>{timeAgo(new Date(u.createdAt))}</p>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: "capitalize",
                    color: roleColor[u.role], background: roleBg[u.role],
                    padding: "2px 7px", borderRadius: 99, flexShrink: 0,
                  }}>
                    {u.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bulk Actions */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Bulk Actions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button style={{
              width: "100%", padding: "9px 14px",
              background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
              borderRadius: 9, fontSize: 12, fontWeight: 600,
              color: "var(--accent-hover)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Send email
            </button>
            <button style={{
              width: "100%", padding: "9px 14px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 9, fontSize: 12, fontWeight: 600,
              color: "var(--muted)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export all
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
