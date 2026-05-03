"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type Props = {
  userName: string | null;
  userImage: string | null;
  userEmail: string | null;
};

export default function TopBar({ userName, userImage, userEmail }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  return (
    <header className="desktop-topbar" style={{
      height: 52, alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", borderBottom: "1px solid var(--border-subtle)",
      background: "var(--surface)", flexShrink: 0, gap: 12,
    }}>

      {/* Left: search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = searchQuery.trim();
          router.push(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
        }}
        style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "7px 14px", borderRadius: 9,
          background: "var(--card)", border: "1px solid var(--border)",
          width: 240,
        }}
      >
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for courses…"
          style={{
            flex: 1, background: "transparent", border: "none",
            outline: "none", fontSize: 13, color: "var(--text)",
            minWidth: 0,
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            style={{ color: "var(--subtle)", flexShrink: 0, padding: 0, lineHeight: 1 }}
          >
            <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Right: bell + profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {/* Bell */}
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: "var(--card)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--muted)",
        }}>
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "5px 10px 5px 5px", borderRadius: 10,
              border: "1px solid var(--border)", background: "var(--card)",
              cursor: "pointer", color: "var(--text)",
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", fontSize: 12, fontWeight: 700, color: "#fff",
            }}>
              {userImage
                ? <img src={userImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (userName ?? userEmail ?? "?")[0].toUpperCase()
              }
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName ?? (userEmail ? userEmail.split("@")[0] : "Account")}
            </span>
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "var(--subtle)", transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 200,
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 10, minWidth: 160, overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}>
              <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border-subtle)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                  {userName ?? "Account"}
                </p>
                <p style={{ fontSize: 11, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                  {userEmail ?? ""}
                </p>
              </div>
              <div style={{ padding: "4px 0" }}>
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "9px 14px", fontSize: 13, color: "var(--muted)", fontWeight: 500,
                  }}
                >
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 9,
                    padding: "9px 14px", fontSize: 13, color: "var(--red)",
                    fontWeight: 500, background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
