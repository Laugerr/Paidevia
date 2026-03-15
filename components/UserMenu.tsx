"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function UserMenu({ session }: any) {
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
        className="flex items-center rounded-full hover:bg-slate-100 p-1"
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
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm hover:bg-slate-50"
          >
            Profile
          </Link>

          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm hover:bg-slate-50"
          >
            Dashboard
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/home" })}
            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}