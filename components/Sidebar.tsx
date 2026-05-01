"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};

type SidebarProps = {
  userRole: string | null;
  userName: string | null;
  userImage: string | null;
  userEmail: string | null;
};

function Icon({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
      {d2 && <path d={d2} />}
    </svg>
  );
}

export default function Sidebar({ userRole, userName, userImage, userEmail }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const platformNav: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      exact: true,
      icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" d2="M9 22V12h6v10" />,
    },
    {
      href: "/courses",
      label: "Browse Courses",
      icon: <Icon d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" d2="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" d2="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
    },
  ];

  const instructorNav: NavItem[] = [
    {
      href: "/instructor",
      label: "My Courses",
      exact: true,
      icon: <Icon d="M12 20h9" d2="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />,
    },
    {
      href: "/instructor/courses/new",
      label: "New Course",
      icon: <Icon d="M12 5v14M5 12h14" />,
    },
  ];

  const adminNav: NavItem[] = [
    {
      href: "/admin",
      label: "Overview",
      exact: true,
      icon: <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" d2="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
    },
    {
      href: "/admin/courses",
      label: "Courses",
      icon: <Icon d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" d2="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />,
    },
  ];

  const isInstructor = userRole === "instructor" || userRole === "admin";
  const isAdmin = userRole === "admin";
  const fallback = (userName?.[0] ?? userEmail?.[0] ?? "U").toUpperCase();

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 12px var(--accent-glow)",
          }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" />
            </svg>
          </div>
          <span className="font-heading" style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Paidevia
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
        <SectionLabel>Platform</SectionLabel>
        {platformNav.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href, item.exact)} />
        ))}

        {isInstructor && (
          <>
            <Divider />
            <SectionLabel>Instructor</SectionLabel>
            {instructorNav.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href, item.exact)} />
            ))}
          </>
        )}

        {isAdmin && (
          <>
            <Divider />
            <SectionLabel>Admin</SectionLabel>
            {adminNav.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href, item.exact)} />
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: "1px solid var(--border)", padding: 10 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 8px",
          borderRadius: 10,
          marginBottom: 2,
        }}>
          {userImage ? (
            <img src={userImage} alt="avatar" referrerPolicy="no-referrer"
              style={{ width: 30, height: 30, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#fff",
            }}>
              {fallback}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName ?? "User"}
            </p>
            <p style={{ fontSize: 11, color: "var(--subtle)", textTransform: "capitalize" }}>
              {userRole ?? "student"}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/home" })}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px",
            borderRadius: 8,
            fontSize: 12, fontWeight: 500,
            color: "var(--subtle)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, color: "var(--subtle)",
      letterSpacing: "0.09em", textTransform: "uppercase",
      padding: "6px 10px 4px",
    }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border-subtle)", margin: "6px 4px" }} />;
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "7px 10px",
      borderRadius: 9,
      fontSize: 13,
      fontWeight: active ? 600 : 500,
      color: active ? "#fff" : "var(--muted)",
      background: active
        ? "linear-gradient(90deg, rgba(109,92,247,0.3) 0%, rgba(109,92,247,0.1) 100%)"
        : "transparent",
      borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
      boxShadow: active ? "0 0 12px rgba(109,92,247,0.15)" : "none",
      transition: "all 0.15s",
    }}>
      <span style={{ color: active ? "var(--accent-hover)" : "var(--subtle)", flexShrink: 0 }}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}
