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
        prev.map((user) =>
          user.id === userId ? { ...user, role } : user
        )
      );
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role");
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Admin Area
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          User Management
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          View all registered users and manage their roles.
        </p>

        <div className="mt-6">
          <Link
            href="/admin"
            className="inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
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
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt="User avatar"
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                            {fallbackLetter}
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-slate-900">
                            {user.name ?? "Unnamed User"}
                          </p>
                          <p className="text-xs text-slate-500">{user.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {user.email ?? "No email"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClassName}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
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
                              className={`rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
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
    </main>
  );
}
