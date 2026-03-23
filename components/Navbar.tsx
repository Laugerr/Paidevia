import Image from "next/image";
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
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[28px] border border-white/80 bg-white/78 px-4 py-3.5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-4 lg:gap-5">
          <Link href="/home" className="flex items-center gap-3">
            <Image
              src="/assets/paidevia_logo.png"
              alt="Paidevia logo"
              width={128}
              height={32}
              className="h-8 w-auto object-contain sm:h-12"
              priority
            />

            <div className="min-w-0">
              <p className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Paidevia
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-600 sm:text-xs">
                LMS Platform
              </p>
            </div>
          </Link>

          <NavLinks userRole={userRole} />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-2.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md lg:flex">
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
              className="w-44 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 xl:w-60"
            />
          </div>

          <UserMenu session={session} userRole={userRole} />
        </div>
      </nav>
    </header>
  );
}
