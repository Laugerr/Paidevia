import Link from "next/link";
import type { ReactNode } from "react";
import { courses } from "@/lib/courses";

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
  "from-sky-500 via-blue-400 to-cyan-100",
  "from-emerald-500 via-teal-400 to-lime-100",
  "from-orange-500 via-rose-400 to-amber-100",
];

const courseDecor = [
  "bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.48),transparent_22%),radial-gradient(circle_at_82%_78%,rgba(255,255,255,0.22),transparent_22%)]",
  "bg-[radial-gradient(circle_at_24%_24%,rgba(255,255,255,0.4),transparent_24%),radial-gradient(circle_at_74%_22%,rgba(255,255,255,0.3),transparent_20%)]",
  "bg-[radial-gradient(circle_at_16%_26%,rgba(255,255,255,0.42),transparent_22%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.24),transparent_24%)]",
];

export default function CoursesPage() {
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons, 0);
  const allLevels = Array.from(new Set(courses.map((course) => course.level)));

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.76),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.8),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-200/25 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_340px] xl:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                Course Library
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Discover your next learning path
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Browse a curated set of structured courses designed to feel
                focused, modern, and easy to continue from your dashboard into
                the lesson experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/home"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/92 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  Back Home
                </Link>
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/90 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Overview
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Courses</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                      {courses.length}
                    </p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <Icon>
                      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
                      <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
                    </Icon>
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Lessons</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                      {totalLessons}
                    </p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <Icon>
                      <path d="M12 14 3 9l9-5 9 5-9 5Z" />
                      <path d="M7 12v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4" />
                    </Icon>
                  </span>
                </div>

                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Levels</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allLevels.map((level) => (
                      <span
                        key={level}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm ring-1 ring-slate-200/80"
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

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, index) => (
            <Link key={course.id} href={`/courses/${course.slug}`} className="group">
              <article className="overflow-hidden rounded-[30px] border border-white/80 bg-white/92 shadow-[0_18px_52px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_58px_rgba(15,23,42,0.1)]">
                <div
                  className={cn(
                    "relative h-32 bg-gradient-to-br",
                    courseArt[index % courseArt.length]
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0",
                      courseDecor[index % courseDecor.length]
                    )}
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold text-slate-700">
                    {course.level}
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-2xl bg-white/20 p-3 text-white backdrop-blur">
                    <Icon>
                      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
                      <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
                    </Icon>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="min-h-[3.5rem] text-2xl font-semibold tracking-tight text-slate-950">
                    {course.title}
                  </h2>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-500">
                    {course.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {course.lessons} lessons
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      Self-paced
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      Guided path
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">
                      Structured self-paced learning
                    </p>
                    <span className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 group-hover:bg-slate-50">
                      View Course
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
