"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/actions/password-reset";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 14,
  color: "var(--text)",
  outline: "none",
};

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, null);

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
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(109,92,247,0.10) 0%, transparent 70%)",
        top: "10%", left: "15%",
      }} />
      <div className="orb" style={{
        width: 350, height: 350,
        background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)",
        bottom: "10%", right: "10%", animationDelay: "3s",
      }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{
          background: "rgba(15,15,23,0.85)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "40px 36px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
        }}>
          {/* Icon + title */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
              boxShadow: "0 4px 24px var(--accent-glow)",
            }}>
              <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="font-heading" style={{
              fontSize: 22, fontWeight: 800, color: "var(--text)",
              letterSpacing: "-0.02em", marginBottom: 6,
            }}>
              Forgot password?
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {state?.success ? (
            <div>
              <div style={{
                padding: "16px 18px",
                background: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.2)",
                borderRadius: 12,
                fontSize: 14,
                color: "var(--green)",
                lineHeight: 1.6,
                marginBottom: 20,
                textAlign: "center",
              }}>
                {state.success}
              </div>
              <Link href="/login" style={{
                display: "block", textAlign: "center",
                padding: "12px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10, fontSize: 14, fontWeight: 600,
                color: "var(--muted)",
              }}>
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 600,
                  color: "var(--muted)", marginBottom: 6,
                }}>
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </div>

              {state?.error && (
                <div style={{
                  padding: "10px 14px",
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  borderRadius: 9, fontSize: 13, color: "var(--red)",
                }}>
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                style={{
                  padding: "13px",
                  background: pending ? "var(--subtle)" : "var(--accent)",
                  color: "#fff", borderRadius: 10,
                  fontSize: 14, fontWeight: 700,
                  cursor: pending ? "not-allowed" : "pointer",
                  boxShadow: pending ? "none" : "0 2px 16px var(--accent-glow)",
                  transition: "all 0.15s",
                }}
              >
                {pending ? "Sending…" : "Send Reset Link"}
              </button>

              <Link href="/login" style={{
                textAlign: "center", fontSize: 13,
                color: "var(--muted)", display: "block", marginTop: 4,
              }}>
                ← Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
