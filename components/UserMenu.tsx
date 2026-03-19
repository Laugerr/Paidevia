"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";

type UserMenuProps = {
  session: any;
  userRole?: string | null;
};

export default function UserMenu({
  session,
  userRole,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = userRole === "admin";

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0ea5e9_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-105"
      >
        Sign In
      </Link>
    );
  }

  const name = session.user.name ?? "User";
  const image = session.user.image;
  const fallback = name[0]?.toUpperCase() ?? "U";
  const roleLabel =
    userRole === "admin"
      ? "Admin"
      : userRole === "instructor"
      ? "Instructor"
      : "Student";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
      >
        {image ? (
          <img
            src={image}
            alt="avatar"
            className="h-10 w-10 rounded-2xl object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-sm font-bold text-white">
            {fallback}
          </div>
        )}

        <div className="hidden text-left sm:block">
          <p className="max-w-[12rem] truncate text-sm font-semibold text-slate-900">
            {name}
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {roleLabel}
          </p>
        </div>

        <svg
          viewBox="0 0 24 24"
          className="hidden h-4 w-4 text-slate-400 sm:block"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-[24px] border border-white/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur">
          <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.9),_transparent_40%),linear-gradient(135deg,_#ffffff_0%,_#f8fbff_100%)] px-5 py-4">
            <p className="truncate text-sm text-slate-500">Signed in as</p>
            <p className="mt-1 truncate text-base font-semibold text-slate-950">
              {name}
            </p>
            <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {roleLabel}
            </p>
          </div>

          {[
            { href: "/profile", label: "Profile" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/courses", label: "Courses" },
          ].map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-5 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className="block px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/home" })}
            className="w-full border-t border-slate-200 px-5 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
