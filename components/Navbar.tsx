import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/home" className="text-2xl font-bold tracking-tight text-slate-900">
          Paidevia
        </Link>

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
        </div>
      </nav>
    </header>
  );
}