import { signIn } from "@/auth";
import Link from "next/link";
import AuthForms from "@/components/AuthForms";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18}>
      <path d="M21.805 12.23c0-.76-.068-1.49-.195-2.19H12v4.146h5.49a4.696 4.696 0 0 1-2.038 3.08v2.557h3.297c1.93-1.777 3.056-4.398 3.056-7.593Z" fill="#4285F4" />
      <path d="M12 22c2.76 0 5.075-.915 6.767-2.477l-3.297-2.557c-.915.613-2.085.976-3.47.976-2.67 0-4.932-1.803-5.74-4.227H2.85v2.638A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.26 13.715A5.996 5.996 0 0 1 5.94 12c0-.595.108-1.172.32-1.715V7.647H2.85A10 10 0 0 0 2 12c0 1.61.385 3.133 1.068 4.353l3.19-2.638Z" fill="#FBBC05" />
      <path d="M12 6.057c1.5 0 2.846.516 3.905 1.528l2.93-2.93C17.07 2.992 14.755 2 12 2a10 10 0 0 0-9.15 5.647l3.41 2.638C7.068 7.86 9.33 6.057 12 6.057Z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.08 1.84 2.82 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.48-1.33-5.48-5.94 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.32c1.02 0 2.05.14 3.01.42 2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.9 1.24 3.22 0 4.62-2.82 5.63-5.5 5.93.43.37.82 1.1.82 2.22v3.28c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

const hasGoogle = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const hasGitHub = !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div className="orb" style={{
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(109,92,247,0.12) 0%, transparent 70%)",
        top: "5%", left: "10%", animationDelay: "0s",
      }} />
      <div className="orb" style={{
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)",
        bottom: "10%", right: "5%", animationDelay: "4s",
      }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{
          background: "rgba(15,15,23,0.85)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "40px 36px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(109,92,247,0.05)",
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
              boxShadow: "0 4px 24px var(--accent-glow)",
            }}>
              <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" />
              </svg>
            </div>
            <h1 className="font-heading" style={{
              fontSize: 22, fontWeight: 800, color: "var(--text)",
              letterSpacing: "-0.02em", marginBottom: 6,
            }}>
              Paidevia
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Sign in or create a free account
            </p>
          </div>

          {/* Email / Password Forms (Login + Register tabs) */}
          <AuthForms />

          {/* Divider */}
          {(hasGoogle || hasGitHub) && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                <span style={{ fontSize: 12, color: "var(--subtle)", whiteSpace: "nowrap" }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {hasGoogle && (
                  <form action={async () => {
                    "use server";
                    await signIn("google", { redirectTo: "/dashboard" });
                  }}>
                    <button type="submit" style={{
                      width: "100%",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                      padding: "12px 16px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 14, fontWeight: 600, color: "var(--text)",
                      cursor: "pointer",
                    }}>
                      <GoogleIcon />
                      Google
                    </button>
                  </form>
                )}
                {hasGitHub && (
                  <form action={async () => {
                    "use server";
                    await signIn("github", { redirectTo: "/dashboard" });
                  }}>
                    <button type="submit" style={{
                      width: "100%",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                      padding: "12px 16px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 14, fontWeight: 600, color: "var(--text)",
                      cursor: "pointer",
                    }}>
                      <GitHubIcon />
                      GitHub
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          <p style={{
            textAlign: "center", fontSize: 12, color: "var(--subtle)",
            marginTop: 24, lineHeight: 1.6,
          }}>
            By continuing, you agree to our terms.{" "}
            <Link href="/home" style={{ color: "var(--muted)" }}>
              Back to home
            </Link>
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p style={{ fontSize: 12, color: "var(--subtle)" }}>
            Free to join · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
