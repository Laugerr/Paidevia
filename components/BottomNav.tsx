"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
  icon: React.ReactNode;
};

function DashIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CoursesIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
      <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
    </svg>
  );
}

function InstructorIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const base: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", exact: true, icon: <DashIcon /> },
  { label: "Courses", href: "/courses", icon: <CoursesIcon /> },
];

export default function BottomNav({ userRole }: { userRole: string | null }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    ...base,
    ...(userRole === "instructor" || userRole === "admin"
      ? [{ label: "My Courses", href: "/instructor", exact: true, icon: <InstructorIcon /> }]
      : []),
    ...(userRole === "admin"
      ? [{ label: "Admin", href: "/admin", exact: true, icon: <AdminIcon /> }]
      : []),
    { label: "Profile", href: "/profile", exact: true, icon: <ProfileIcon /> },
  ];

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link key={item.label} href={item.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 4, padding: "6px 0", flex: 1,
            color: active ? "var(--accent)" : "var(--subtle)",
            transition: "color 0.15s", position: "relative",
          }}>
            <span style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 28, borderRadius: 8,
              background: active ? "var(--accent-bg)" : "transparent",
              transition: "background 0.15s",
              lineHeight: 1,
            }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: "0.01em" }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
