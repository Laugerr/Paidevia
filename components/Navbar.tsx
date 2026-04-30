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
      where: { email: session.user.email },
      select: { role: true },
    });
    userRole = user?.role ?? null;
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 lg:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl border border-[#30363d] bg-[#161b22]/95 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-5">
        {/* Left: Logo + NavLinks */}
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/home" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/assets/paidevia_logo.png"
              alt="Paidevia logo"
              width={128}
              height={32}
              className="h-7 w-auto object-contain sm:h-9"
              priority
            />
            <div className="hidden min-w-0 sm:block">
              <p className="font-pixel text-[11px] tracking-tight text-[#e6edf3] sm:text-[13px]">
                Paidevia
              </p>
              <p className="font-pixel text-[7px] text-[#209cee] sm:text-[8px]">
                LMS
              </p>
            </div>
          </Link>

          <NavLinks userRole={userRole} />
        </div>

        {/* Right: Search + UserMenu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-[#30363d] bg-[#21262d] px-3 py-2 transition duration-200 hover:border-[#3d444d] lg:flex">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[#6e7681]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search courses..."
              className="w-36 bg-transparent text-sm text-[#8b949e] outline-none placeholder:text-[#6e7681] xl:w-52"
            />
          </div>

          <UserMenu session={session} userRole={userRole} />
        </div>
      </nav>
    </header>
  );
}
