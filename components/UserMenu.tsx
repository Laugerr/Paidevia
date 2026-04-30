"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  USER_ROLE_LABELS,
  canAccessInstructorArea,
  isAdminRole,
  isUserRole,
} from "@/lib/roles";

type UserMenuProps = {
  session: any;
  userRole?: string | null;
};

export default function UserMenu({ session, userRole }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = isAdminRole(userRole);
  const canAccessInstructor = canAccessInstructorArea(userRole);

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-xl bg-[#209cee] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(32,156,238,0.3)] transition duration-200 hover:bg-[#1786c9] hover:-translate-y-0.5"
      >
        Sign In
      </Link>
    );
  }

  const name = session.user.name ?? "User";
  const image = session.user.image;
  const fallback = name[0]?.toUpperCase() ?? "U";
  const roleLabel = isUserRole(userRole ?? "")
    ? USER_ROLE_LABELS[userRole]
    : USER_ROLE_LABELS.student;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-[#30363d] bg-[#21262d] px-2 py-1.5 transition duration-200 hover:border-[#3d444d] hover:bg-[#2d333b]"
      >
        {image ? (
          <img
            src={image}
            alt="avatar"
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-[#30363d]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#209cee] to-[#92cc41] text-xs font-bold text-white">
            {fallback}
          </div>
        )}

        <div className="hidden text-left md:block">
          <p className="max-w-[10rem] truncate text-sm font-semibold text-[#e6edf3]">
            {name}
          </p>
          <p className="font-pixel text-[8px] text-[#209cee]">{roleLabel}</p>
        </div>

        <svg
          viewBox="0 0 24 24"
          className="hidden h-4 w-4 text-[#6e7681] md:block"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          <div className="border-b border-[#30363d] bg-[#21262d] px-4 py-3.5">
            <p className="text-xs text-[#6e7681]">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold text-[#e6edf3]">
              {name}
            </p>
            <p className="mt-2 inline-flex rounded-md bg-[rgba(32,156,238,0.12)] px-2.5 py-1 font-pixel text-[8px] text-[#209cee]">
              {roleLabel}
            </p>
          </div>

          {[
            { href: "/profile", label: "Profile" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/courses", label: "Courses" },
            ...(canAccessInstructor
              ? [{ href: "/instructor", label: "Instructor" }]
              : []),
          ].map((item) => {
            const isActive =
              pathname === item.href ||
              (!["/dashboard", "/instructor"].includes(item.href) &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 text-sm font-medium transition duration-200 ${
                  isActive
                    ? "bg-[rgba(32,156,238,0.1)] text-[#209cee]"
                    : "text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
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
              className="block px-4 py-2.5 text-sm font-medium text-[#e76e55] transition duration-200 hover:bg-[rgba(231,110,85,0.1)]"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/home" })}
            className="w-full border-t border-[#30363d] px-4 py-2.5 text-left text-sm font-medium text-[#8b949e] transition duration-200 hover:bg-[#21262d] hover:text-[#e6edf3]"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
