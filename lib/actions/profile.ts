"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export type ProfileActionState = { error?: string; success?: string } | null;

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated." };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name cannot be empty." };
  if (name.length > 80) return { error: "Name is too long." };

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name },
  });

  return { success: "Profile updated." };
}

export async function uploadAvatarAction(
  dataUrl: string
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated." };

  if (!dataUrl.startsWith("data:image/")) return { error: "Invalid image format." };

  // Rough size check: base64 string length * 0.75 ≈ bytes
  if (dataUrl.length * 0.75 > 2 * 1024 * 1024) return { error: "Image must be under 2 MB." };

  await prisma.user.update({
    where: { email: session.user.email },
    data: { image: dataUrl },
  });

  return { success: "Avatar updated." };
}

export async function changePasswordAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated." };

  const current = formData.get("currentPassword") as string;
  const next = formData.get("newPassword") as string;
  const confirm = formData.get("confirmPassword") as string;

  if (!current || !next || !confirm) return { error: "All fields are required." };
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "Passwords do not match." };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { password: true },
  });

  if (!user?.password) return { error: "Password change is only available for email accounts." };

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return { error: "Current password is incorrect." };

  const hashed = await bcrypt.hash(next, 12);
  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashed },
  });

  return { success: "Password updated successfully." };
}
