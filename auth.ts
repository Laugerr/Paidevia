import NextAuth, { CredentialsSignin } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

const providers = [
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? [GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET })]
    : []),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })]
    : []),
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;

      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) throw new InvalidCredentialsError();

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new InvalidCredentialsError();

      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
});
