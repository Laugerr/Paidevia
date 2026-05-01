"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "@/lib/actions/auth";

type Tab = "login" | "register";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 14,
  color: "var(--text)",
  outline: "none",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 6,
};

export default function AuthForms() {
  const [tab, setTab] = useState<Tab>("login");

  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, null);
  const [registerState, registerFormAction, registerPending] = useActionState(registerAction, null);

  return (
    <div>
      {/* Tabs */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        background: "var(--surface)",
        borderRadius: 10, padding: 4,
        marginBottom: 28,
        border: "1px solid var(--border-subtle)",
      }}>
        {(["login", "register"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "8px 0",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              background: tab === t
                ? "linear-gradient(135deg, var(--accent) 0%, #8b7dff 100%)"
                : "transparent",
              color: tab === t ? "#fff" : "var(--muted)",
              boxShadow: tab === t ? "0 2px 8px var(--accent-glow)" : "none",
            }}
          >
            {t === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {/* Login Form */}
      {tab === "login" && (
        <form action={loginFormAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="login-email" style={labelStyle}>Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--accent-hover)" }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {loginState?.error && (
            <div style={{
              padding: "10px 14px",
              background: "var(--red-bg)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: 9,
              fontSize: 13,
              color: "var(--red)",
            }}>
              {loginState.error}
            </div>
          )}

          <button
            type="submit"
            disabled={loginPending}
            style={{
              padding: "13px",
              background: loginPending ? "var(--subtle)" : "var(--accent)",
              color: "#fff",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: loginPending ? "not-allowed" : "pointer",
              boxShadow: loginPending ? "none" : "0 2px 16px var(--accent-glow)",
              transition: "all 0.15s",
            }}
          >
            {loginPending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      )}

      {/* Register Form */}
      {tab === "register" && (
        <form action={registerFormAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="reg-name" style={labelStyle}>Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              placeholder="Your name"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="reg-email" style={labelStyle}>Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="reg-password" style={labelStyle}>Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              placeholder="Min. 8 characters"
              style={inputStyle}
            />
          </div>

          {registerState?.error && (
            <div style={{
              padding: "10px 14px",
              background: "var(--red-bg)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: 9,
              fontSize: 13,
              color: "var(--red)",
            }}>
              {registerState.error}
            </div>
          )}

          <button
            type="submit"
            disabled={registerPending}
            style={{
              padding: "13px",
              background: registerPending ? "var(--subtle)" : "var(--accent)",
              color: "#fff",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: registerPending ? "not-allowed" : "pointer",
              boxShadow: registerPending ? "none" : "0 2px 16px var(--accent-glow)",
              transition: "all 0.15s",
            }}
          >
            {registerPending ? "Creating account…" : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
