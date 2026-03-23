"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/home", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/dashboard", label: "Dashboard" },
];

type NavLinksProps = {
  userRole?: string | null;
};

export default function NavLinks({ userRole }: NavLinksProps) {
  const pathname = usePathname();
  const visibleLinks =
    userRole === "instructor"
      ? [...links, { href: "/instructor", label: "Instructor" }]
      : links;

  return (
    <div className="hidden xl:flex items-center gap-1 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-1 text-sm font-medium text-slate-500 shadow-sm">
      {visibleLinks.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/home" && pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-4 py-2 transition duration-200 ${
              isActive
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-100"
                : "hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
