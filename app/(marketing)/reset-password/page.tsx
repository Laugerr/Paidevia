"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { resetPasswordAction } from "@/lib/actions/password-reset";

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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, action, pending] = useActionState(resetPasswordAction, null);

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--red)", marginBottom: 20, lineHeight: 1.6 }}>
          Invalid or missing reset token. Please request a new reset link.
        </p>
        <Link href="/forgot-password" style={{
          display: "inline-block", padding: "11px 24px",
          background: "var(--accent)", color: "#fff",
          borderRadius: 10, fontSize: 14, fontWeight: 700,
          boxShadow: "0 2px 16px var(--accent-glow)",
        }}>
          Request new link
        </Link>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div>
        <div style={{
          padding: "16px 18px",
          background: "rgba(52,211,153,0.08)",
          border: "1px solid rgba(52,211,153,0.2)",
          borderRadius: 12, fontSize: 14,
          color: "var(--green)", lineHeight: 1.6,
          marginBottom: 20, textAlign: "center",
        }}>
          {state.success}
        </div>
        <Link href="/login" style={{
          display: "block", textAlign: "center",
          padding: "12px",
          background: "var(--accent)", color: "#fff",
          borderRadius: 10, fontSize: 14, fontWeight: 700,
          boxShadow: "0 2px 16px var(--accent-glow)",
        }}>
          Sign In →
        </Link>
      </div>
    );
  }

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input type="hidden" name="token" value={token} />

      <div>
        <label style={{
          display: "block", fontSize: 12, fontWeight: 600,
          color: "var(--muted)", marginBottom: 6,
        }}>
          New Password
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="Min. 8 characters"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={{
          display: "block", fontSize: 12, fontWeight: 600,
          color: "var(--muted)", marginBottom: 6,
        }}>
          Confirm Password
        </label>
        <input
          name="confirm"
          type="password"
          required
          placeholder="Repeat your new password"
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
        {pending ? "Updating…" : "Set New Password"}
      </button>

      <Link href="/login" style={{
        textAlign: "center", fontSize: 13,
        color: "var(--muted)", display: "block", marginTop: 4,
      }}>
        ← Back to Sign In
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
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
      <div className="orb" style={{
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(109,92,247,0.10) 0%, transparent 70%)",
        top: "10%", right: "10%",
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
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
              boxShadow: "0 4px 24px var(--accent-glow)",
            }}>
              <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="font-heading" style={{
              fontSize: 22, fontWeight: 800, color: "var(--text)",
              letterSpacing: "-0.02em", marginBottom: 6,
            }}>
              Set new password
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
              Choose a strong password for your account.
            </p>
          </div>

          <Suspense fallback={
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--subtle)" }}>Loading…</p>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
