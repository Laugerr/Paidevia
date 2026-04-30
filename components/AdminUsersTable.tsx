"use client";

import Link from "next/link";
import { useState } from "react";
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  isAdminRole,
  type UserRole,
} from "@/lib/roles";

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

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "red" | "blue" | "amber" | "slate";
}) {
  const toneClass =
    tone === "red" ? "bg-[rgba(231,110,85,0.12)] text-[#e76e55]"
    : tone === "blue" ? "bg-[rgba(32,156,238,0.12)] text-[#209cee]"
    : tone === "amber" ? "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]"
    : "bg-[rgba(139,148,158,0.12)] text-[#8b949e]";

  const barClass =
    tone === "red" ? "from-[#e76e55] to-[#c0392b]"
    : tone === "blue" ? "from-[#209cee] to-[#92cc41]"
    : tone === "amber" ? "from-[#f7d51d] to-[#e59400]"
    : "from-[#8b949e] to-[#6e7681]";

  return (
    <article className="rounded-xl border border-[#30363d] bg-[#21262d] p-4 transition duration-200 hover:border-[#3d444d] hover:-translate-y-0.5 sm:p-5">
      <span className={`inline-flex rounded-lg px-3 py-1 font-pixel text-[8px] ${toneClass}`}>Live</span>
      <p className="mt-4 text-xs font-medium text-[#8b949e]">{label}</p>
      <p className="mt-1.5 text-3xl font-bold text-[#e6edf3] sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs text-[#6e7681]">{detail}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#2d333b]">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${barClass}`} />
      </div>
    </article>
  );
}

export default function AdminUsersTable({
  users: initialUsers,
  currentUserId,
}: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      setErrorMessage(null);
      setLoadingUserId(userId);

      const response = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role } : user))
      );
    } catch (error) {
      console.error("Failed to update role:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update role"
      );
    } finally {
      setLoadingUserId(null);
    }
  };

  const totalAdmins = users.filter((user) => user.role === "admin").length;
  const totalInstructors = users.filter((user) => user.role === "instructor").length;
  const totalStudents = users.filter((user) => user.role === "student").length;

  return (
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-[#e76e55]/6 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#209cee]/6 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e76e55]/40 to-transparent" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px] xl:items-center">
            <div className="max-w-2xl">
              <p className="font-pixel text-[9px] text-[#e76e55]">Admin Area</p>
              <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl lg:text-4xl">
                User access control
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#8b949e] sm:text-base">
                Manage role distribution, review account access, and keep
                administrative permissions organized from one structured control panel.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b] hover:-translate-y-0.5"
                >
                  Back to Admin Dashboard
                </Link>
              </div>
            </div>

            <aside className="rounded-xl border border-[#30363d] bg-[#21262d] p-5">
              <p className="font-pixel text-[8px] text-[#6e7681]">Role Distribution</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Admins", value: totalAdmins, color: "text-[#e76e55]" },
                  { label: "Instructors", value: totalInstructors, color: "text-[#f7d51d]" },
                  { label: "Students", value: totalStudents, color: "text-[#209cee]" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3.5">
                    <p className="text-xs font-medium text-[#8b949e]">{item.label}</p>
                    <p className={`mt-1.5 text-2xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Users" value={users.length} detail="Registered accounts across the platform" tone="slate" />
          <StatCard label="Admin Access" value={totalAdmins} detail="Users with full platform control" tone="red" />
          <StatCard label="Instructor Access" value={totalInstructors} detail="Users ready for content workflows" tone="amber" />
          <StatCard label="Protected Rule" value={1} detail="Current admin role is self-protected" tone="blue" />
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="border-b border-[#30363d] px-5 py-5">
            <p className="font-pixel text-[9px] text-[#e76e55]">User Directory</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-heading text-xl font-bold text-[#e6edf3]">
                Manage roles and access
              </h2>
              <span className="inline-flex rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 font-pixel text-[8px] text-[#8b949e]">
                {users.length} total accounts
              </span>
            </div>
            {errorMessage ? (
              <div className="mt-4 rounded-xl border border-[#e76e55]/20 bg-[rgba(231,110,85,0.08)] px-4 py-3 text-sm font-medium text-[#e76e55]">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#30363d]">
              <thead className="bg-[#21262d]">
                <tr>
                  {["User", "Email", "Role", "Joined", "Role Update"].map((col) => (
                    <th key={col} className="px-5 py-4 text-left font-pixel text-[8px] text-[#6e7681]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#30363d] bg-[#161b22]">
                {users.map((user) => {
                  const fallbackLetter = (
                    user.name?.[0] ?? user.email?.[0] ?? "U"
                  ).toUpperCase();

                  const isCurrentUser = user.id === currentUserId;
                  const isLoading = loadingUserId === user.id;
                  const canChangeRole = !(isCurrentUser && isAdminRole(user.role));

                  const roleBadgeClass =
                    isAdminRole(user.role)
                      ? "bg-[rgba(231,110,85,0.12)] text-[#e76e55]"
                      : user.role === "instructor"
                      ? "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]"
                      : "bg-[rgba(32,156,238,0.12)] text-[#209cee]";

                  return (
                    <tr
                      key={user.id}
                      className="transition duration-200 hover:bg-[#21262d]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt="User avatar"
                              className="h-10 w-10 rounded-xl object-cover ring-1 ring-[#30363d]"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#209cee] to-[#a78bfa] text-sm font-bold text-white ring-1 ring-[#30363d]">
                              {fallbackLetter}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-[#e6edf3]">
                                {user.name ?? "Unnamed User"}
                              </p>
                              {isCurrentUser ? (
                                <span className="inline-flex rounded-lg bg-[rgba(32,156,238,0.12)] px-2 py-0.5 font-pixel text-[7px] text-[#209cee]">
                                  You
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-[#6e7681]">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#8b949e]">
                        {user.email ?? "No email"}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-lg px-3 py-1 font-pixel text-[8px] ${roleBadgeClass}`}>
                          {USER_ROLE_LABELS[user.role]}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#8b949e]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <select
                            value={user.role}
                            disabled={isLoading || !canChangeRole}
                            onChange={(event) =>
                              handleRoleChange(user.id, event.target.value as UserRole)
                            }
                            className="min-w-[150px] rounded-xl border border-[#30363d] bg-[#21262d] px-3 py-2 text-sm font-medium text-[#e6edf3] outline-none transition duration-200 hover:border-[#3d444d] focus:border-[#209cee] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {USER_ROLES.map((roleOption) => (
                              <option key={roleOption} value={roleOption}>
                                {USER_ROLE_LABELS[roleOption]}
                              </option>
                            ))}
                          </select>
                          {isCurrentUser && isAdminRole(user.role) ? (
                            <p className="text-xs text-[#6e7681]">Your admin role is protected.</p>
                          ) : isLoading ? (
                            <p className="text-xs text-[#6e7681]">Updating role...</p>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
