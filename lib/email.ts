import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await resend.emails.send({
    from: "Paidevia <onboarding@resend.dev>",
    to: email,
    subject: "Reset your Paidevia password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0f;color:#e2e2e8;border-radius:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
          <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6d5cf7,#a78bfa);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z"/></svg>
          </div>
          <span style="font-size:16px;font-weight:800;color:#e2e2e8;letter-spacing:-0.02em;">Paidevia</span>
        </div>

        <h1 style="font-size:22px;font-weight:800;color:#e2e2e8;margin-bottom:12px;letter-spacing:-0.02em;">Reset your password</h1>
        <p style="font-size:14px;color:#9999aa;line-height:1.7;margin-bottom:28px;">
          We received a request to reset the password for your Paidevia account. Click the button below to choose a new password. This link expires in <strong style="color:#e2e2e8;">1 hour</strong>.
        </p>

        <a href="${resetUrl}" style="display:inline-block;padding:13px 28px;background:#6d5cf7;color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;box-shadow:0 2px 16px rgba(109,92,247,0.35);">
          Reset Password
        </a>

        <p style="font-size:12px;color:#666680;margin-top:28px;line-height:1.6;">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
        <p style="font-size:12px;color:#666680;margin-top:8px;">
          Or copy this link: <a href="${resetUrl}" style="color:#9988ff;word-break:break-all;">${resetUrl}</a>
        </p>
      </div>
    `,
  });
}
