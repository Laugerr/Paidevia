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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
  const toneClassName =
    tone === "red"
      ? "bg-red-100 text-red-600"
      : tone === "blue"
      ? "bg-blue-100 text-blue-600"
      : tone === "amber"
      ? "bg-amber-100 text-amber-600"
      : "bg-slate-100 text-slate-600";

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)] sm:p-6">
      <span
        className={`inline-flex rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${toneClassName}`}
      >
        Live
      </span>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
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
        body: JSON.stringify({
          userId,
          role,
        }),
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
  const totalInstructors = users.filter(
    (user) => user.role === "instructor"
  ).length;
  const totalStudents = users.filter((user) => user.role === "student").length;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(252,165,165,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.72),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-red-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-blue-200/25 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_340px] xl:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600">
                Admin Area
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                User access control
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Manage role distribution, review account access, and keep
                administrative permissions organized from one structured control
                panel.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/92 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  Back to Admin Dashboard
                </Link>
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/90 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Role Distribution
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Admins</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-red-600">
                    {totalAdmins}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">
                    Instructors
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">
                    {totalInstructors}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Students</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-blue-600">
                    {totalStudents}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={users.length}
            detail="Registered accounts across the platform"
            tone="slate"
          />
          <StatCard
            label="Admin Access"
            value={totalAdmins}
            detail="Users with full platform control"
            tone="red"
          />
          <StatCard
            label="Instructor Access"
            value={totalInstructors}
            detail="Users ready for future content workflows"
            tone="amber"
          />
          <StatCard
            label="Protected Rule"
            value={1}
            detail="Current admin cannot remove their own admin role"
            tone="blue"
          />
        </section>

        <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-200/80 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                User Directory
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Manage roles and access
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {users.length} total accounts
                </span>
              </div>
              {errorMessage ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errorMessage}
                </div>
              ) : null}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      User
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Email
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Role
                    </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Joined
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Role Update
                  </th>
                </tr>
              </thead>

                <tbody className="divide-y divide-slate-200 bg-white/90">
                  {users.map((user) => {
                    const fallbackLetter = (
                      user.name?.[0] ??
                      user.email?.[0] ??
                      "U"
                    ).toUpperCase();

                    const isCurrentUser = user.id === currentUserId;
                    const isLoading = loadingUserId === user.id;
                    const canChangeRole = !(isCurrentUser && isAdminRole(user.role));

                    const roleBadgeClassName =
                      isAdminRole(user.role)
                        ? "bg-red-100 text-red-700"
                        : user.role === "instructor"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700";

                    return (
                    <tr
                      key={user.id}
                      className="transition duration-200 hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt="User avatar"
                              className="h-11 w-11 rounded-2xl object-cover ring-1 ring-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white ring-1 ring-slate-200">
                              {fallbackLetter}
                            </div>
                          )}

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-950">
                                  {user.name ?? "Unnamed User"}
                                </p>
                                {isCurrentUser ? (
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    You
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {user.email ?? "No email"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${roleBadgeClassName}`}
                        >
                          {USER_ROLE_LABELS[user.role]}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <select
                            value={user.role}
                            disabled={isLoading || !canChangeRole}
                            onChange={(event) =>
                              handleRoleChange(
                                user.id,
                                event.target.value as UserRole
                              )
                            }
                            className="min-w-[150px] rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition duration-200 hover:border-slate-400 focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {USER_ROLES.map((roleOption) => (
                              <option key={roleOption} value={roleOption}>
                                {USER_ROLE_LABELS[roleOption]}
                              </option>
                            ))}
                          </select>
                          {isCurrentUser && isAdminRole(user.role) ? (
                            <p className="text-xs text-slate-400">
                              Your admin role is protected.
                            </p>
                          ) : isLoading ? (
                            <p className="text-xs text-slate-400">Updating role...</p>
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
