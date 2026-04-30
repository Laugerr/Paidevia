import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Icon({
  children,
  className = "h-5 w-5",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const courseArt = [
  "from-blue-900 via-sky-800 to-indigo-900",
  "from-emerald-900 via-teal-800 to-green-900",
  "from-orange-900 via-red-800 to-rose-900",
];

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: {
      status: "published",
      courseLessons: { some: {} },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      level: true,
      _count: { select: { courseLessons: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalLessons = courses.reduce(
    (sum, course) => sum + course._count.courseLessons,
    0
  );
  const allLevels = Array.from(new Set(courses.map((course) => course.level)));

  return (
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-[#209cee]/8 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#92cc41]/6 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#209cee]/40 to-transparent" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_320px] xl:items-center">
            <div className="max-w-2xl">
              <p className="font-pixel text-[9px] text-[#209cee]">Course Library</p>
              <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl lg:text-4xl">
                Discover your next learning path
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#8b949e] sm:text-base">
                Browse a curated set of structured courses designed to feel
                focused, modern, and easy to continue from your dashboard.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-[#209cee] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(32,156,238,0.3)] transition duration-200 hover:bg-[#1786c9] hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/home"
                  className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b] hover:-translate-y-0.5"
                >
                  Back Home
                </Link>
              </div>
            </div>

            <aside className="rounded-xl border border-[#30363d] bg-[#21262d] p-5">
              <p className="font-pixel text-[8px] text-[#6e7681]">Overview</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3.5">
                  <div>
                    <p className="text-xs font-medium text-[#8b949e]">Courses</p>
                    <p className="mt-1 text-2xl font-bold text-[#e6edf3]">
                      {courses.length}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(32,156,238,0.12)] text-[#209cee]">
                    <Icon>
                      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
                      <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
                    </Icon>
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3.5">
                  <div>
                    <p className="text-xs font-medium text-[#8b949e]">Lessons</p>
                    <p className="mt-1 text-2xl font-bold text-[#e6edf3]">
                      {totalLessons}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(146,204,65,0.12)] text-[#92cc41]">
                    <Icon>
                      <path d="M12 14 3 9l9-5 9 5-9 5Z" />
                      <path d="M7 12v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4" />
                    </Icon>
                  </span>
                </div>

                <div className="rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3.5">
                  <p className="text-xs font-medium text-[#8b949e]">Levels</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allLevels.map((level) => (
                      <span
                        key={level}
                        className="rounded-lg border border-[#30363d] bg-[#161b22] px-2.5 py-1 font-pixel text-[8px] text-[#8b949e]"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Course Grid */}
        {courses.length > 0 ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course, index) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                <article className="h-full overflow-hidden rounded-xl border border-[#30363d] bg-[#21262d] transition duration-200 hover:border-[#3d444d] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
                  <div
                    className={cn(
                      "relative h-28 bg-gradient-to-br",
                      courseArt[index % courseArt.length]
                    )}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%)]" />
                    <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                      {course.level}
                    </div>
                    <div className="absolute bottom-3 left-3 rounded-lg bg-white/10 p-2 text-white backdrop-blur">
                      <Icon className="h-4 w-4">
                        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
                        <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
                      </Icon>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="font-heading min-h-[3rem] text-lg font-semibold text-[#e6edf3]">
                      {course.title}
                    </h2>
                    <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-[#8b949e]">
                      {course.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-[#2d333b] px-2.5 py-1 font-pixel text-[8px] text-[#6e7681]">
                        {course._count.courseLessons} lessons
                      </span>
                      <span className="rounded-lg bg-[#2d333b] px-2.5 py-1 font-pixel text-[8px] text-[#6e7681]">
                        Self-paced
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-[#6e7681]">Guided path</p>
                      <span className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#2d333b] px-3 py-1.5 text-xs font-semibold text-[#e6edf3] transition duration-200 group-hover:border-[#209cee] group-hover:text-[#209cee]">
                        View Course
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-[#30363d] bg-[#161b22] p-10 text-center">
            <p className="font-pixel text-[9px] text-[#209cee]">Course Library</p>
            <h2 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#e6edf3]">
              No published courses yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#8b949e]">
              We&apos;re preparing the public catalog. Once instructors publish courses,
              they&apos;ll appear here.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/home"
                className="inline-flex items-center justify-center rounded-xl bg-[#209cee] px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#1786c9]"
              >
                Return Home
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b]"
              >
                Open Dashboard
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
