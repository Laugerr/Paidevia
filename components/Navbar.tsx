import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import UserMenu from "./UserMenu";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const session = await auth();

  let userRole: string | null = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        role: true,
      },
    });

    userRole = user?.role ?? null;
  }

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/72 px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#0f1f3d_0%,_#17396a_55%,_#1d4ed8_100%)] shadow-lg shadow-blue-500/20">
              <span className="text-xl font-semibold text-cyan-300">P</span>
            </div>

            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-950">
                Paidevia
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                LMS Platform
              </p>
            </div>
          </Link>

          <NavLinks />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search learning paths..."
              className="w-52 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <UserMenu session={session} userRole={userRole} />
        </div>
      </nav>
    </header>
  );
}
