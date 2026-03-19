import Link from "next/link";
import { courses } from "@/lib/courses";

const courseArtwork = [
  "from-sky-950 via-blue-900 to-cyan-500",
  "from-slate-950 via-slate-700 to-emerald-400",
  "from-amber-900 via-orange-500 to-yellow-300",
];

export default function CoursesPage() {
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="relative overflow-hidden rounded-[32px] border border-cyan-100 bg-[radial-gradient(circle_at_left,_rgba(125,211,252,0.3),_transparent_28%),linear-gradient(135deg,_#f3fbff_0%,_#ffffff_58%,_#eef6ff_100%)] p-8">
          <div className="absolute -left-4 top-7 h-24 w-24 rounded-full border-[10px] border-cyan-200/40" />
          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                Learning Paths
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Explore your next course
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Discover structured learning paths designed to feel like a
                premium LMS workspace. Each course keeps the same visual rhythm
                as the new dashboard and leads smoothly into the lesson player.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0ea5e9_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/home"
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Back Home
                </Link>
              </div>
            </div>

            <aside className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Overview
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">Courses</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {courses.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">Lessons</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {totalLessons}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, index) => (
            <Link key={course.id} href={`/courses/${course.slug}`} className="group">
              <article className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                <div className={`relative h-44 bg-gradient-to-br ${courseArtwork[index % courseArtwork.length]}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_28%)]" />
                  <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-white">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                      {course.level}
                    </span>
                    <span className="rounded-full bg-emerald-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-950">
                      {course.lessons} lessons
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                        {course.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {course.description}
                      </p>
                    </div>
                    <span className="mt-1 h-3 w-3 rounded-full bg-cyan-500" />
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                    <span>Self-paced</span>
                    <span>Beginner friendly</span>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm font-semibold text-sky-600">
                      Open learning path
                    </p>
                    <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition group-hover:bg-slate-200">
                      View Course
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
