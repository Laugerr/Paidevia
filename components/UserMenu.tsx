"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";

type UserMenuProps = {
  session: any;
  isAdmin?: boolean;
};

export default function UserMenu({
  session,
  isAdmin = false,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Sign In
      </Link>
    );
  }

  const name = session.user.name ?? "User";
  const image = session.user.image;
  const fallback = name[0]?.toUpperCase() ?? "U";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center rounded-full p-1 hover:bg-slate-100"
      >
        {image ? (
          <img
            src={image}
            alt="avatar"
            className="h-9 w-9 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
            {fallback}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>

          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-red-600 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/home" })}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}