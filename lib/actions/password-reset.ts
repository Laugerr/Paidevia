"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export type ResetActionState = { error?: string; success?: string } | null;

// Step 1: user submits their email
export async function requestPasswordResetAction(
  _prev: ResetActionState,
  formData: FormData
): Promise<ResetActionState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Please enter your email address." };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  // Always return success to avoid leaking which emails exist
  if (!user) {
    return { success: "If an account exists for that email, a reset link has been sent." };
  }

  // OAuth-only users have no password
  if (!user.password) {
    return { success: "If an account exists for that email, a reset link has been sent." };
  }

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  // Create a new token (1 hour expiry)
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({ data: { email, token, expires } });

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendPasswordResetEmail(email, resetUrl);

  return { success: "If an account exists for that email, a reset link has been sent." };
}

// Step 2: user submits new password
export async function resetPasswordAction(
  _prev: ResetActionState,
  formData: FormData
): Promise<ResetActionState> {
  const token = (formData.get("token") as string)?.trim();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!token) return { error: "Invalid or missing reset token." };
  if (!password || password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    // Clean up expired token if it exists
    if (record) await prisma.passwordResetToken.delete({ where: { token } });
    return { error: "This reset link has expired or is invalid. Please request a new one." };
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.email },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.delete({ where: { token } }),
  ]);

  return { success: "Your password has been updated. You can now sign in." };
}
