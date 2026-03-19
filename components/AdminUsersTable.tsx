"use client";

import Link from "next/link";
import { useState } from "react";
import { USER_ROLES, type UserRole } from "@/lib/roles";

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

export default function AdminUsersTable({
  users: initialUsers,
  currentUserId,
}: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
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
      alert("Failed to update role");
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="relative overflow-hidden rounded-[32px] border border-red-100 bg-[radial-gradient(circle_at_left,_rgba(252,165,165,0.24),_transparent_26%),linear-gradient(135deg,_#fff7f7_0%,_#ffffff_60%,_#eff6ff_100%)] p-8">
          <div className="absolute -left-4 top-7 h-24 w-24 rounded-full border-[10px] border-red-200/40" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">
                Admin Area
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                User management
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Review every registered account, monitor join dates, and assign
                `student`, `instructor`, or `admin` roles from one polished
                control panel.
              </p>
            </div>

            <Link
              href="/admin"
              className="inline-flex rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Admin Dashboard
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-500">Total users</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {users.length}
            </p>
          </article>
          <article className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-500">Admins</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-red-600">
              {users.filter((user) => user.role === "admin").length}
            </p>
          </article>
          <article className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-500">Instructors</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-amber-600">
              {users.filter((user) => user.role === "instructor").length}
            </p>
          </article>
        </section>

        <section className="mt-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/92 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
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
                    Actions
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
                  const canChangeRole = !(isCurrentUser && user.role === "admin");

                  const roleBadgeClassName =
                    user.role === "admin"
                      ? "bg-red-100 text-red-700"
                      : user.role === "instructor"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700";

                  return (
                    <tr key={user.id} className="transition hover:bg-slate-50/80">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt="User avatar"
                              className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white ring-1 ring-slate-200">
                              {fallbackLetter}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-slate-950">
                              {user.name ?? "Unnamed User"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{user.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {user.email ?? "No email"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${roleBadgeClassName}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {USER_ROLES.map((roleOption) => {
                            const isActiveRole = user.role === roleOption;
                            const isDisabled =
                              isLoading ||
                              isActiveRole ||
                              (!canChangeRole && roleOption !== "admin");

                            const buttonClassName =
                              roleOption === "admin"
                                ? "border-red-300 text-red-700 hover:bg-red-50"
                                : roleOption === "instructor"
                                ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                                : "border-slate-300 text-slate-700 hover:bg-slate-50";

                            return (
                              <button
                                key={roleOption}
                                onClick={() => handleRoleChange(user.id, roleOption)}
                                disabled={isDisabled}
                                className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
                              >
                                {isLoading
                                  ? "Updating..."
                                  : isActiveRole
                                  ? `Current ${roleOption[0].toUpperCase()}${roleOption.slice(1)}`
                                  : `Make ${roleOption[0].toUpperCase()}${roleOption.slice(1)}`}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
