"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
  userRole: string | null;
  userName: string | null;
  userImage: string | null;
  userEmail: string | null;
};

export default function AppShell({ children, userRole, userName, userImage, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Mobile backdrop */}
      {open && (
        <div className="mobile-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar drawer */}
      <div className={`sidebar-wrap${open ? " sidebar-open" : ""}`}>
        <Sidebar
          userRole={userRole}
          userName={userName}
          userImage={userImage}
          userEmail={userEmail}
        />
      </div>

      {/* Content column */}
      <div style={{ flex: 1, minWidth: 0, overflowX: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Mobile top bar */}
        <header className="mobile-topbar">
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px var(--accent-glow)", flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" />
              </svg>
            </div>
            <span className="font-heading" style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Paidevia
            </span>
          </Link>

          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            style={{
              width: 36, height: 36, borderRadius: 9,
              background: "var(--card)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text)", flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
