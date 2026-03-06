import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/home" className="text-2xl font-bold text-gray-900">
          Paidevia
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/home" className="hover:text-black">
            Home
          </Link>
          <Link href="/courses" className="hover:text-black">
            Courses
          </Link>
          <Link href="/dashboard" className="hover:text-black">
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}