"use client";

import Link from "next/link";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import MobileAvatar from "./MobileAvatar";

type Props = {
  children: React.ReactNode;
  userRole: string | null;
  userName: string | null;
  userImage: string | null;
  userEmail: string | null;
};

export default function AppShell({ children, userRole, userName, userImage, userEmail }: Props) {

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar — desktop only */}
      <div className="sidebar-wrap">
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
              width: 30, height: 30, borderRadius: 9,
              background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px var(--accent-glow)", flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" />
              </svg>
            </div>
            <span className="font-heading" style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Paidevia
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Bell */}
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: "var(--card)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--muted)",
            }}>
              <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            {/* Avatar with dropdown */}
            <MobileAvatar userName={userName} userImage={userImage} userEmail={userEmail} />
          </div>
        </header>

        <TopBar userName={userName} userImage={userImage} userEmail={userEmail} />

        <div style={{ flex: 1 }}>
          {children}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
