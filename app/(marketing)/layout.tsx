import Link from "next/link";
import { auth } from "@/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <nav style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}>
          {/* Logo */}
          <Link href="/home" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 16px var(--accent-glow)",
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" />
              </svg>
            </div>
            <span className="font-heading" style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Paidevia
            </span>
          </Link>

          {/* Nav links */}
          <div className="nav-links-desktop" style={{ alignItems: "center", gap: 2 }}>
            <Link href="/home" style={navLink}>Home</Link>
            <Link href="/courses" style={navLink}>Courses</Link>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {session?.user ? (
              <Link href="/dashboard" style={ctaButton}>
                Dashboard
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ) : (
              <>
                <Link href="/login" style={ghostButton}>Sign In</Link>
                <Link href="/login" style={ctaButton}>
                  Get Started
                  <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}

const navLink: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "var(--muted)",
  padding: "6px 14px",
  borderRadius: 8,
  transition: "color 0.15s",
};

const ghostButton: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--muted)",
  padding: "7px 16px",
  borderRadius: 9,
  border: "1px solid var(--border)",
  transition: "all 0.15s",
};

const ctaButton: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#fff",
  background: "var(--accent)",
  padding: "7px 16px",
  borderRadius: 9,
  display: "flex",
  alignItems: "center",
  gap: 5,
  boxShadow: "0 2px 12px var(--accent-glow)",
  transition: "all 0.15s",
};
