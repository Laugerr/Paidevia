"use client";

import { useActionState } from "react";
import { updateProfileAction, changePasswordAction } from "@/lib/actions/profile";

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
  marginBottom: 7,
};

function Alert({ message, type }: { message: string; type: "error" | "success" }) {
  const isError = type === "error";
  return (
    <div style={{
      padding: "10px 14px",
      background: isError ? "rgba(248,113,113,0.08)" : "rgba(52,211,153,0.08)",
      border: `1px solid ${isError ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.2)"}`,
      borderRadius: 9,
      fontSize: 13,
      color: isError ? "var(--red)" : "var(--green)",
    }}>
      {message}
    </div>
  );
}

export function EditNameForm({ currentName }: { currentName: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={labelStyle}>Full Name</label>
        <input
          name="name"
          type="text"
          defaultValue={currentName}
          required
          maxLength={80}
          placeholder="Your full name"
          style={inputStyle}
        />
      </div>

      {state?.error && <Alert message={state.error} type="error" />}
      {state?.success && <Alert message={state.success} type="success" />}

      <div>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "10px 22px",
            background: pending ? "var(--subtle)" : "var(--accent)",
            color: "#fff",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 700,
            cursor: pending ? "not-allowed" : "pointer",
            boxShadow: pending ? "none" : "0 2px 12px var(--accent-glow)",
            transition: "all 0.15s",
          }}
        >
          {pending ? "Saving…" : "Save Name"}
        </button>
      </div>
    </form>
  );
}

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(changePasswordAction, null);

  if (!hasPassword) {
    return (
      <p style={{ fontSize: 13, color: "var(--subtle)", lineHeight: 1.6 }}>
        Password change is only available for accounts registered with email and password.
        Your account uses OAuth (Google / GitHub).
      </p>
    );
  }

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={labelStyle}>Current Password</label>
        <input name="currentPassword" type="password" required placeholder="••••••••" style={inputStyle} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={labelStyle}>New Password</label>
          <input name="newPassword" type="password" required minLength={8} placeholder="Min. 8 characters" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Confirm New Password</label>
          <input name="confirmPassword" type="password" required placeholder="Repeat new password" style={inputStyle} />
        </div>
      </div>

      {state?.error && <Alert message={state.error} type="error" />}
      {state?.success && <Alert message={state.success} type="success" />}

      <div>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "10px 22px",
            background: pending ? "var(--subtle)" : "var(--accent)",
            color: "#fff",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 700,
            cursor: pending ? "not-allowed" : "pointer",
            boxShadow: pending ? "none" : "0 2px 12px var(--accent-glow)",
            transition: "all 0.15s",
          }}
        >
          {pending ? "Updating…" : "Update Password"}
        </button>
      </div>
    </form>
  );
}
