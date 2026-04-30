"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string } | null;

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email and password are required." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Invalid email or password." };
    throw err; // re-throw NEXT_REDIRECT so the redirect works
  }

  return null;
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "All fields are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, password: hashed } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Account created but sign-in failed. Try logging in." };
    throw err;
  }

  return null;
}
