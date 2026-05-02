"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type Props = {
  userName: string | null;
  userImage: string | null;
  userEmail: string | null;
};

export default function MobileAvatar({ userName, userImage, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", fontSize: 13, fontWeight: 700, color: "#fff",
          border: "2px solid var(--border)", cursor: "pointer",
          padding: 0,
        }}
      >
        {userImage
          ? <img src={userImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : (userName ?? userEmail ?? "?")[0].toUpperCase()
        }
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200,
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 12, minWidth: 180, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
        }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
              {userName ?? "Account"}
            </p>
            <p style={{ fontSize: 11, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail ?? ""}
            </p>
          </div>
          <div style={{ padding: "4px 0" }}>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "10px 14px", fontSize: 13, color: "var(--muted)", fontWeight: 500,
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
                padding: "10px 14px", fontSize: 13, color: "var(--red)",
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
  );
}
