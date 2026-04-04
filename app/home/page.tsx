import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";

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

export default async function HomePage() {
  const featuredCourses = await prisma.course.findMany({
    where: {
      status: "published",
      courseLessons: {
        some: {},
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      level: true,
      _count: {
        select: {
          courseLessons: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
  });

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10 lg:space-y-16">
        <section className="relative overflow-hidden rounded-[38px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.76),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.8),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] px-6 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:px-8 lg:px-12 lg:py-16">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="absolute left-1/3 top-12 h-24 w-24 rounded-full bg-white/40 blur-3xl" />
          <svg
            className="hero-wave pointer-events-none absolute inset-x-[-6%] bottom-[-6%] h-32 w-[112%] text-sky-200/70"
            viewBox="0 0 1200 240"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,160 C160,120 260,220 420,176 C560,138 676,64 840,96 C980,124 1080,204 1200,170 L1200,240 L0,240 Z"
              fill="currentColor"
            />
          </svg>
          <svg
            className="hero-wave-delayed pointer-events-none absolute inset-x-[-8%] bottom-[4%] h-24 w-[116%] text-violet-200/60"
            viewBox="0 0 1200 220"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,150 C170,104 300,196 470,154 C626,118 748,40 926,84 C1050,116 1128,178 1200,160 L1200,220 L0,220 Z"
              fill="currentColor"
            />
          </svg>
          <div className="hero-wave pointer-events-none absolute right-[-4%] top-[16%] h-48 w-48 rounded-full bg-sky-100/30 blur-3xl" />

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
                <div className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.62),transparent_18%),radial-gradient(circle_at_82%_16%,rgba(255,255,255,0.48),transparent_14%),radial-gradient(circle_at_50%_100%,rgba(191,219,254,0.5),transparent_40%),linear-gradient(180deg,_#e0f2fe_0%,_#eef2ff_46%,_#f8fafc_100%)] px-6 pb-4 pt-8">
                  <div className="absolute left-6 top-5 h-28 w-28 rounded-full bg-sky-200/30 blur-3xl" />
                  <div className="absolute bottom-2 right-8 h-24 w-24 rounded-full bg-violet-200/30 blur-3xl" />
                  <div className="absolute inset-x-10 bottom-3 h-12 rounded-full bg-[radial-gradient(circle,_rgba(148,163,184,0.22),_transparent_70%)] blur-2xl" />

                  <div className="relative mx-auto h-[460px] max-w-[620px]">
                    <div className="hero-icon-lift absolute bottom-[126px] left-[45%] text-sky-500 drop-shadow-[0_8px_20px_rgba(14,165,233,0.22)]">
                      <Icon className="h-8 w-8">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M4 12h16M12 4a14 14 0 0 1 0 16M12 4a14 14 0 0 0 0 16" />
                      </Icon>
                    </div>
                    <div
                      className="hero-icon-lift-right absolute bottom-[124px] left-[47%] text-violet-500 drop-shadow-[0_8px_20px_rgba(139,92,246,0.22)]"
                      style={{ animationDelay: "1.1s" }}
                    >
                      <Icon className="h-7 w-7">
                        <path d="m6 15 6-12 6 12" />
                        <path d="M8 11h8" />
                        <path d="M7.5 15h9" />
                      </Icon>
                    </div>
                    <div
                      className="hero-icon-lift-left absolute bottom-[122px] left-[46%] text-amber-500 drop-shadow-[0_8px_20px_rgba(245,158,11,0.22)]"
                      style={{ animationDelay: "2.1s" }}
                    >
                      <Icon className="h-6 w-6">
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                        <path d="M12 2a6 6 0 0 0-3 11.2c.6.4 1 1 1.2 1.8h3.6c.2-.8.6-1.4 1.2-1.8A6 6 0 0 0 12 2Z" />
                      </Icon>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex justify-center">
                      <Image
                        src="/assets/learner_at_desk.png"
                        alt="Learner at a desk"
                        width={780}
                        height={585}
                        className="h-auto w-full max-w-[780px] object-contain drop-shadow-[0_24px_44px_rgba(15,23,42,0.14)]"
                        priority
                      />
                    </div>
                  </div>
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

          {featuredCourses.length > 0 ? (
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

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                        {course._count.courseLessons} lessons
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                        Self-paced
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                        Beginner friendly
                      </span>
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
          ) : (
            <div className="rounded-[30px] border border-white/80 bg-white/92 p-8 text-center shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
              <p className="text-lg font-semibold text-slate-950">
                Published courses will appear here soon
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                We&apos;re preparing the next set of learning paths for the
                public catalog.
              </p>
            </div>
          )}
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
