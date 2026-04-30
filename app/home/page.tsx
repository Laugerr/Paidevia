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
    tone: "bg-[rgba(32,156,238,0.12)] text-[#209cee]",
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
    tone: "bg-[rgba(167,139,250,0.12)] text-[#a78bfa]",
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
    tone: "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]",
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
    tone: "bg-[rgba(146,204,65,0.12)] text-[#92cc41]",
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
  "from-blue-900 via-sky-800 to-indigo-900",
  "from-emerald-900 via-teal-800 to-green-900",
  "from-orange-900 via-red-800 to-rose-900",
];

const benefits = [
  "Expert-led structured learning paths",
  "Progress tracking built into every lesson",
  "A focused, modern learning experience",
];

export default async function HomePage() {
  const featuredCourses = await prisma.course.findMany({
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
    take: 3,
  });

  return (
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8 lg:space-y-12">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] px-5 py-10 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:px-8 lg:px-12 lg:py-16">
          <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-[#209cee]/8 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[#92cc41]/6 blur-3xl" />

          {/* Waves */}
          <svg
            className="hero-wave pointer-events-none absolute inset-x-[-6%] bottom-[-4%] h-24 w-[112%] text-[#209cee]/8"
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
            className="hero-wave-delayed pointer-events-none absolute inset-x-[-8%] bottom-[6%] h-20 w-[116%] text-[#92cc41]/6"
            viewBox="0 0 1200 220"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,150 C170,104 300,196 470,154 C626,118 748,40 926,84 C1050,116 1128,178 1200,160 L1200,220 L0,220 Z"
              fill="currentColor"
            />
          </svg>

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center">
            <div className="max-w-2xl">
              <p className="font-pixel text-[9px] text-[#209cee]">
                Learn with Paidevia
              </p>
              <h1 className="font-heading mt-4 text-3xl font-bold tracking-tight text-[#e6edf3] sm:text-4xl lg:text-5xl lg:leading-tight">
                Learn, Grow,{" "}
                <span className="text-[#209cee]">Succeed</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#8b949e] lg:text-lg">
                Unlock your potential with expert-led online courses, guided
                progress, and a modern learning experience designed to keep you
                moving forward.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl bg-[#209cee] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(32,156,238,0.35)] transition duration-200 hover:bg-[#1786c9] hover:-translate-y-0.5"
                >
                  Browse Courses
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-6 py-3.5 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b] hover:-translate-y-0.5"
                >
                  View Dashboard
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#21262d] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#209cee]/50 to-transparent" />
                <div className="relative h-[380px] overflow-hidden rounded-xl bg-[#2d333b]">
                  <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[#209cee]/10 blur-2xl" />
                  <div className="absolute -bottom-4 -right-4 h-28 w-28 rounded-full bg-[#92cc41]/8 blur-2xl" />

                  <div className="hero-icon-lift absolute bottom-[100px] left-[45%] text-[#209cee] drop-shadow-[0_8px_20px_rgba(32,156,238,0.4)]">
                    <Icon className="h-7 w-7">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M4 12h16M12 4a14 14 0 0 1 0 16M12 4a14 14 0 0 0 0 16" />
                    </Icon>
                  </div>
                  <div
                    className="hero-icon-lift-right absolute bottom-[98px] left-[47%] text-[#a78bfa] drop-shadow-[0_8px_20px_rgba(167,139,250,0.4)]"
                    style={{ animationDelay: "1.1s" }}
                  >
                    <Icon className="h-6 w-6">
                      <path d="m6 15 6-12 6 12" />
                      <path d="M8 11h8" />
                      <path d="M7.5 15h9" />
                    </Icon>
                  </div>
                  <div
                    className="hero-icon-lift-left absolute bottom-[96px] left-[46%] text-[#f7d51d] drop-shadow-[0_8px_20px_rgba(247,213,29,0.4)]"
                    style={{ animationDelay: "2.1s" }}
                  >
                    <Icon className="h-5 w-5">
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
                      className="h-auto w-full max-w-[680px] object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-5">
          <div>
            <p className="font-pixel text-[9px] text-[#209cee]">Categories</p>
            <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl">
              Browse Our Top Categories
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[#8b949e]">
              Explore a variety of subjects and find the learning path that matches your goals.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <article
                key={category.title}
                className="rounded-xl border border-[#30363d] bg-[#21262d] p-4 transition duration-200 hover:border-[#3d444d] hover:bg-[#2d333b] hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      category.tone
                    )}
                  >
                    {category.icon}
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-[#e6edf3]">
                      {category.title}
                    </h3>
                    <p className="mt-1 font-pixel text-[8px] text-[#6e7681]">
                      {category.tag}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Featured Courses */}
        <section className="space-y-5">
          <div>
            <p className="font-pixel text-[9px] text-[#209cee]">Popular Courses</p>
            <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl">
              Start learning today
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[#8b949e]">
              High-value learning paths designed to help you build practical skills.
            </p>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featuredCourses.map((course, index) => (
                <article
                  key={course.slug}
                  className="overflow-hidden rounded-xl border border-[#30363d] bg-[#21262d] transition duration-200 hover:border-[#3d444d] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
                >
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
                  </div>

                  <div className="p-5">
                    <h3 className="font-heading min-h-[3rem] text-lg font-semibold text-[#e6edf3]">
                      {course.title}
                    </h3>
                    <p className="mt-2 min-h-[4rem] text-sm leading-6 text-[#8b949e]">
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

                    <Link
                      href={`/courses/${course.slug}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#209cee] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(32,156,238,0.25)] transition duration-200 hover:bg-[#1786c9] hover:-translate-y-0.5"
                    >
                      Start Course
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#30363d] bg-[#161b22] p-8 text-center">
              <p className="font-heading text-lg font-semibold text-[#e6edf3]">
                Published courses will appear here soon
              </p>
              <p className="mt-2 text-sm text-[#8b949e]">
                We&apos;re preparing the next set of learning paths.
              </p>
            </div>
          )}
        </section>

        {/* Why Paidevia + Testimonial */}
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-[#30363d] bg-[#21262d] p-6 sm:p-8">
            <p className="font-pixel text-[9px] text-[#209cee]">Why Paidevia</p>
            <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl">
              Why Learn with Us?
            </h2>
            <p className="mt-4 text-base leading-7 text-[#8b949e]">
              Join a learning platform built to feel focused, modern, and truly
              supportive from your first lesson to your next milestone.
            </p>

            <div className="mt-6 space-y-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(146,204,65,0.12)] text-[#92cc41]">
                    <Icon className="h-4 w-4">
                      <path d="m5 13 4 4L19 7" />
                    </Icon>
                  </span>
                  <span className="text-sm font-medium text-[#e6edf3]">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-xl bg-[#209cee] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(32,156,238,0.25)] transition duration-200 hover:bg-[#1786c9]"
              >
                Browse Courses
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#2d333b] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#3d444d]"
              >
                Get Started
              </Link>
            </div>
          </article>

          <article className="rounded-xl border border-[#30363d] bg-[#21262d] p-6 sm:p-8">
            <p className="font-pixel text-[9px] text-[#209cee]">Testimonials</p>
            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#209cee] to-[#a78bfa] text-base font-bold text-white">
                LA
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-[#e6edf3]">
                  Lisa Anderson
                </p>
                <p className="text-sm text-[#8b949e]">Marketing Specialist</p>
              </div>
            </div>

            <div className="mt-5 flex gap-1 text-[#f7d51d]">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index}>★</span>
              ))}
            </div>

            <blockquote className="mt-5 text-base leading-7 text-[#8b949e]">
              "Paidevia gave me a clearer way to learn. The courses feel
              structured, the platform feels focused, and I always know what to do
              next."
            </blockquote>

            <div className="mt-6 rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-4">
              <p className="font-pixel text-[8px] text-[#92cc41]">Platform Rating</p>
              <p className="mt-2 text-2xl font-bold text-[#e6edf3]">4.9 / 5.0</p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
