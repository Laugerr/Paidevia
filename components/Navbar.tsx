import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/home"
          className="text-2xl font-bold tracking-tight text-slate-900"
        >
          Paidevia
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/home" className="transition hover:text-blue-600">
            Home
          </Link>

          <Link href="/courses" className="transition hover:text-blue-600">
            Courses
          </Link>

          <Link href="/dashboard" className="transition hover:text-blue-600">
            Dashboard
          </Link>

          {session?.user && (
            <Link href="/profile" className="transition hover:text-blue-600">
              Profile
            </Link>
          )}

          {/* Auth */}
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/home" });
              }}
            >
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                Sign Out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}