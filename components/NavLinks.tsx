"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canAccessInstructorArea } from "@/lib/roles";

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
  const visibleLinks = canAccessInstructorArea(userRole)
    ? [...links, { href: "/instructor", label: "Instructor" }]
    : links;

  return (
    <div className="hidden lg:flex items-center gap-1 rounded-xl border border-[#30363d] bg-[#21262d] p-1 text-sm font-medium text-[#8b949e]">
      {visibleLinks.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/home" && pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition duration-200 ${
              isActive
                ? "bg-[#209cee] text-white shadow-[0_2px_8px_rgba(32,156,238,0.3)]"
                : "hover:bg-[#2d333b] hover:text-[#e6edf3]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
