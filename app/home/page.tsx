import Link from "next/link";
import type { ReactNode } from "react";
import { courses } from "@/lib/courses";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Icon({
  children,
  className = "h-6 w-6",
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

const categories = [
  {
    title: "Web Development",
    tag: "Frontend",
    tone: "from-sky-500/15 to-blue-500/10 text-sky-600",
    icon: (
      <Icon>
        <path d="M4 5h16l-1.5 12h-13z" />
        <path d="m9 9-2 3 2 3" />
        <path d="m15 9 2 3-2 3" />
      </Icon>
    ),
  },
  {
    title: "Data Science",
    tag: "Analytics",
    tone: "from-violet-500/15 to-fuchsia-500/10 text-violet-600",
    icon: (
      <Icon>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19v-4" />
      </Icon>
    ),
  },
  {
    title: "Cybersecurity",
    tag: "Popular",
    tone: "from-amber-500/15 to-orange-500/10 text-amber-600",
    icon: (
      <Icon>
        <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" />
        <rect x="9" y="10" width="6" height="5" rx="1" />
        <path d="M10 10V8.8a2 2 0 1 1 4 0V10" />
      </Icon>
    ),
  },
  {
    title: "Artificial Intelligence",
    tag: "Future-ready",
    tone: "from-emerald-500/15 to-teal-500/10 text-emerald-600",
    icon: (
      <Icon>
        <path d="M12 3v4" />
        <path d="M7 7 4 4" />
        <path d="M17 7 20 4" />
        <rect x="6" y="9" width="12" height="9" rx="3" />
        <path d="M9 13h.01M15 13h.01" />
        <path d="M9 16c1 .7 2 .9 3 .9s2-.2 3-.9" />
      </Icon>
    ),
  },
];

const courseArt = [
  "from-sky-500 via-blue-400 to-cyan-100",
  "from-emerald-500 via-teal-400 to-lime-100",
  "from-orange-500 via-rose-400 to-amber-100",
];

const benefits = [
  "Expert-led structured learning paths",
  "Progress tracking built into every lesson",
  "A calm, focused experience that feels modern",
];

export default function HomePage() {
  const featuredCourses = courses.slice(0, 3);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10 lg:space-y-16">
        <section className="relative overflow-hidden rounded-[38px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.76),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.8),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] px-6 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:px-8 lg:px-12 lg:py-16">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="absolute left-1/3 top-12 h-24 w-24 rounded-full bg-white/40 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(340px,0.98fr)] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                Learn with Paidevia
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-[4.25rem] lg:leading-[1.02]">
                Learn, Grow, Succeed
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 lg:text-[1.15rem]">
                Unlock your potential with expert-led online courses, guided
                progress, and a modern learning experience designed to keep you
                moving forward.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Browse Courses
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  View Dashboard
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[540px]">
              <div className="relative rounded-[38px] border border-white/90 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(239,246,255,0.92)_55%,_rgba(224,231,255,0.9)_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:p-7">
                <div className="rounded-[32px] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.55),transparent_22%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.5),transparent_18%),linear-gradient(180deg,_#dbeafe_0%,_#eef2ff_55%,_#f8fafc_100%)] p-6">
                  <div className="flex items-start justify-between">
                    <div className="rounded-2xl bg-white/80 p-3 text-blue-600 shadow-sm">
                      <Icon>
                        <path d="M12 14 3 9l9-5 9 5-9 5Z" />
                        <path d="M7 12v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4" />
                      </Icon>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-3 text-amber-500 shadow-sm">
                      <Icon>
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                        <path d="M12 2a6 6 0 0 0-3 11.2c.6.4 1 1 1.2 1.8h3.6c.2-.8.6-1.4 1.2-1.8A6 6 0 0 0 12 2Z" />
                      </Icon>
                    </div>
                  </div>

                  <div className="mt-10 flex items-end justify-between gap-6">
                    <div className="space-y-4">
                      <div className="h-3 w-20 rounded-full bg-white/70" />
                      <div className="h-3 w-28 rounded-full bg-white/60" />
                      <div className="h-24 w-24 rounded-[28px] bg-white/70 shadow-inner" />
                    </div>

                    <div className="relative flex-1">
                      <div className="mx-auto flex h-56 w-56 items-end justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),rgba(191,219,254,0.75)_55%,rgba(224,231,255,0.7)_100%)] shadow-inner">
                        <div className="relative mb-2 w-40">
                          <div className="absolute left-12 top-1 h-10 w-10 rounded-full bg-[#f6c7a7]" />
                          <div className="absolute left-9 top-0 h-11 w-12 rounded-t-[20px] rounded-b-[16px] bg-[#6b4f4a]" />
                          <div className="absolute left-4 top-16 h-28 w-32 rounded-t-[34px] rounded-b-[26px] bg-[#7aa8ff]" />
                          <div className="absolute left-0 top-20 h-16 w-14 rounded-[22px] bg-[#90b4ff]" />
                          <div className="absolute right-0 top-32 h-6 w-16 rounded-full bg-[#f6c7a7]" />
                          <div className="absolute right-7 top-10 h-10 w-10 rounded-full border-[6px] border-[#8aa4ff] bg-transparent" />
                          <div className="absolute right-0 top-12 h-5 w-5 rounded-full bg-[#8aa4ff]" />
                          <div className="absolute left-16 top-30 h-16 w-24 rounded-[16px] bg-slate-300/90 shadow-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute -left-5 top-24 rounded-2xl border border-white/80 bg-white/88 p-3 text-blue-600 shadow-lg">
                  <Icon>
                    <path d="M12 14 3 9l9-5 9 5-9 5Z" />
                    <path d="M7 12v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4" />
                  </Icon>
                </div>
                <div className="pointer-events-none absolute -right-3 top-16 rounded-2xl border border-white/80 bg-white/88 p-3 text-sky-500 shadow-lg">
                  <Icon>
                    <circle cx="12" cy="12" r="8" />
                    <path d="M4 12h16M12 4a14 14 0 0 1 0 16M12 4a14 14 0 0 0 0 16" />
                  </Icon>
                </div>
                <div className="pointer-events-none absolute right-10 top-1/2 rounded-2xl border border-white/80 bg-white/88 p-3 text-violet-500 shadow-lg">
                  <Icon>
                    <path d="m6 15 6-12 6 12" />
                    <path d="M8 11h8" />
                    <path d="M7.5 15h9" />
                  </Icon>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Categories
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Browse Our Top Categories
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Explore a variety of subjects and find the learning path that
              matches your goals.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <article
                key={category.title}
                className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br",
                      category.tone
                    )}
                  >
                    {category.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                      {category.title}
                    </h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {category.tag}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Popular Courses
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Start learning with our most popular courses
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              High-value learning paths designed to help you build practical
              skills with clarity and confidence.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.map((course, index) => (
              <article
                key={course.slug}
                className="overflow-hidden rounded-[30px] border border-white/80 bg-white/92 shadow-[0_18px_52px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_58px_rgba(15,23,42,0.1)]"
              >
                <div
                  className={cn(
                    "relative h-32 bg-gradient-to-br",
                    courseArt[index % courseArt.length]
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.48),transparent_22%),radial-gradient(circle_at_82%_78%,rgba(255,255,255,0.22),transparent_22%)]" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold text-slate-700">
                    {course.level}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="min-h-[3.5rem] text-2xl font-semibold tracking-tight text-slate-950">
                    {course.title}
                  </h3>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-500">
                    {course.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                    <span>{course.lessons} lessons</span>
                    <span>Self-paced</span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-600 to-sky-400" />
                  </div>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Start Course
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <article className="rounded-[32px] border border-white/80 bg-white/92 p-8 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Why Paidevia
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Why Learn with Paidevia?
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Join a learning platform built to feel focused, modern, and truly
              supportive from your first lesson to your next milestone.
            </p>

            <div className="mt-6 space-y-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 text-slate-700 ring-1 ring-slate-200/70"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Icon className="h-4 w-4">
                      <path d="m5 13 4 4L19 7" />
                    </Icon>
                  </span>
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-blue-700"
              >
                Browse Courses
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition duration-200 hover:bg-slate-50"
              >
                Get Started
              </Link>
            </div>
          </article>

          <article className="rounded-[32px] border border-white/80 bg-white/92 p-8 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Testimonials
            </p>
            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-rose-200 to-violet-200 text-lg font-semibold text-slate-700">
                LA
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-slate-950">
                  Lisa Anderson
                </p>
                <p className="text-sm text-slate-500">Marketing Specialist</p>
              </div>
            </div>

            <div className="mt-6 flex gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index}>★</span>
              ))}
            </div>

            <blockquote className="mt-6 text-lg leading-8 text-slate-600">
              “Paidevia gave me a clearer way to learn. The courses feel
              structured, the platform feels calm, and I always know what to do
              next.”
            </blockquote>
          </article>
        </section>
      </div>
    </main>
  );
}
