"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { courses } from "@/lib/courses";

type DashboardContentProps = {
  userName?: string | null;
  userImage?: string | null;
};

type Tone = "blue" | "green" | "amber" | "rose";

const courseArtwork = [
  "from-sky-950 via-blue-900 to-cyan-500",
  "from-slate-950 via-slate-700 to-emerald-400",
  "from-amber-900 via-orange-500 to-yellow-300",
  "from-indigo-950 via-sky-700 to-cyan-300",
];

const chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const progressSeries = {
  completed: [38, 54, 58, 64, 71, 83],
  inProgress: [18, 33, 49, 41, 46, 57],
  notStarted: [44, 33, 24, 19, 14, 10],
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function buildPolyline(values: number[]) {
  return values
    .map((value, index) => {
      const x = 24 + index * 56;
      const y = 154 - value * 1.2;
      return `${x},${y}`;
    })
    .join(" ");
}

function formatTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
      <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z" />
    </svg>
  );
}

function CheckSquareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5" />
      <path d="M10 19v-8" />
      <path d="M16 19v-4" />
      <path d="M22 19V9" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ActionIcon({ tone }: { tone: Tone }) {
  return (
    <span
      className={cn(
        "rounded-2xl p-3",
        tone === "blue" && "bg-blue-100 text-blue-600",
        tone === "green" && "bg-emerald-100 text-emerald-600",
        tone === "amber" && "bg-amber-100 text-amber-600",
        tone === "rose" && "bg-rose-100 text-rose-600"
      )}
    >
      {tone === "blue" ? <BookIcon /> : tone === "green" ? <CheckSquareIcon /> : tone === "amber" ? <ChartIcon /> : <UsersIcon />}
    </span>
  );
}

export default function DashboardContent({
  userName,
  userImage,
}: DashboardContentProps) {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardState() {
      try {
        const [enrollmentResponse, progressResponse] = await Promise.all([
          fetch("/api/enrollments", { cache: "no-store" }),
          fetch("/api/progress", { cache: "no-store" }),
        ]);

        if (!enrollmentResponse.ok || !progressResponse.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const enrollmentData = await enrollmentResponse.json();
        const progressData = await progressResponse.json();

        const enrolledCourseSlugs: string[] = enrollmentData.enrolledCourses ?? [];
        const completedLessonSlugs: string[] = progressData.completedLessons ?? [];

        setEnrolledCourses(enrolledCourseSlugs);
        setCompletedLessons(completedLessonSlugs);

        const enrolledCourseObjects = courses.filter((course) =>
          enrolledCourseSlugs.includes(course.slug)
        );

        const firstIncompleteLesson =
          enrolledCourseObjects
            .flatMap((course) => course.lessonList)
            .find((lesson) => !completedLessonSlugs.includes(lesson.slug)) ?? null;

        setCurrentLesson(firstIncompleteLesson?.slug ?? null);
      } catch (error) {
        console.error("Failed to load dashboard state:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardState();
  }, []);

  const enrolledCourseObjects = useMemo(() => {
    return courses.filter((course) => enrolledCourses.includes(course.slug));
  }, [enrolledCourses]);

  const totalLessonsInEnrolledCourses = useMemo(() => {
    return enrolledCourseObjects.reduce((total, course) => total + course.lessonList.length, 0);
  }, [enrolledCourseObjects]);

  const completedLessonsInEnrolledCourses = useMemo(() => {
    const enrolledLessonSlugs = enrolledCourseObjects.flatMap((course) =>
      course.lessonList.map((lesson) => lesson.slug)
    );

    return completedLessons.filter((lessonSlug) => enrolledLessonSlugs.includes(lessonSlug)).length;
  }, [completedLessons, enrolledCourseObjects]);

  const completedCourses = useMemo(() => {
    return enrolledCourseObjects.filter((course) =>
      course.lessonList.every((lesson) => completedLessons.includes(lesson.slug))
    );
  }, [enrolledCourseObjects, completedLessons]);

  const progressPercentage =
    totalLessonsInEnrolledCourses > 0
      ? Math.round((completedLessonsInEnrolledCourses / totalLessonsInEnrolledCourses) * 100)
      : 0;

  const welcomeName = userName?.split(" ")[0] ?? "Scholar";
  const initials =
    userName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "PL";

  const stats = [
    { label: "Courses", value: enrolledCourseObjects.length, detail: `${completedCourses.length} completed`, tone: "blue" as const },
    { label: "Lessons", value: completedLessonsInEnrolledCourses, detail: `${totalLessonsInEnrolledCourses} total`, tone: "green" as const },
    { label: "Progress", value: `${progressPercentage}%`, detail: "Learning momentum", tone: "amber" as const },
    { label: "Study Circle", value: enrolledCourseObjects.length * 24, detail: "Peers in active paths", tone: "rose" as const },
  ];

  const activities = [
    {
      title: currentLesson ? `${formatTitle(currentLesson)} is ready` : "Explore a new lesson",
      context: currentLesson ? "Continue where you left off" : "Your next step is waiting",
      time: "Just now",
      tone: "green" as const,
    },
    {
      title: `${completedLessonsInEnrolledCourses} lessons completed`,
      context: "Updated from live course progress",
      time: "Today",
      tone: "blue" as const,
    },
    {
      title: `${completedCourses.length} full courses finished`,
      context: "Strong consistency across your roadmap",
      time: "This week",
      tone: "amber" as const,
    },
  ];

  const announcements = [
    "Weekly review is ready",
    "Progress insights have been refreshed",
    "Recommended paths updated for you",
  ];

  if (isLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),_transparent_28%),linear-gradient(180deg,_#112344_0%,_#071221_100%)] p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl font-semibold text-cyan-300 ring-1 ring-white/15">
              P
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">Paidevia</p>
              <p className="text-sm text-sky-200">LMS Workspace</p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {[
              { label: "Dashboard", icon: GridIcon, active: true },
              { label: "My Courses", icon: BookIcon, active: false },
              { label: "Assignments", icon: CheckSquareIcon, active: false },
              { label: "Messages", icon: MessageIcon, active: false },
              { label: "Calendar", icon: CalendarIcon, active: false },
              { label: "Analytics", icon: ChartIcon, active: false },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                    item.active
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                      : "text-slate-200 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-[28px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.24),_transparent_35%),linear-gradient(180deg,_rgba(10,22,42,0.96),_rgba(5,14,28,0.92))] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Premium</p>
            <h2 className="mt-3 text-2xl font-semibold">Upgrade your study flow</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Unlock guided review sessions, richer analytics, and AI support widgets.
            </p>
            <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-105">
              Upgrade Now
            </button>
          </div>
        </aside>

        <section className="rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="text-slate-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search courses, lessons, resources..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200">
                <SearchIcon />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-center gap-2 text-slate-500">
                <button className="relative rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                  <BellIcon />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                    5
                  </span>
                </button>
                <button className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                  <MessageIcon />
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName ?? "User"}
                    className="h-11 w-11 rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-sm font-semibold text-white">
                    {initials}
                  </div>
                )}

                <div className="hidden sm:block">
                  <p className="text-sm text-slate-500">Hello</p>
                  <p className="font-semibold text-slate-900">{userName ?? "Paidevia Learner"}</p>
                </div>
                <span className="text-slate-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_320px]">
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
                <section className="relative overflow-hidden rounded-[30px] border border-cyan-100 bg-[radial-gradient(circle_at_left,_rgba(125,211,252,0.35),_transparent_30%),linear-gradient(135deg,_#ecfeff_0%,_#ffffff_60%,_#eff6ff_100%)] p-6">
                  <div className="absolute -left-3 top-6 h-20 w-20 rounded-full border-8 border-emerald-300/30" />
                  <div className="relative">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Welcome Back</p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                      {welcomeName}, let&apos;s keep your momentum moving.
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                      A polished dashboard shell inspired by your mockup, powered by your real LMS progress.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={currentLesson ? `/lesson/${currentLesson}` : "/courses"}
                        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        {currentLesson ? "Continue Learning" : "Explore Courses"}
                      </Link>
                      <Link
                        href="/courses"
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View All Courses
                      </Link>
                    </div>
                  </div>
                </section>

                {stats.map((stat) => (
                  <article key={stat.label} className="rounded-[28px] border border-white/60 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <ActionIcon tone={stat.tone} />
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Live
                      </span>
                    </div>
                    <p className="mt-5 text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
                  </article>
                ))}
              </div>

              <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">My Courses</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Current learning paths</h2>
                  </div>
                  <Link href="/courses" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                    View All
                  </Link>
                </div>

                {enrolledCourseObjects.length === 0 ? (
                  <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="text-lg font-semibold text-slate-900">No enrolled courses yet</p>
                    <p className="mt-2 text-sm text-slate-500">Enroll in a course to unlock the full dashboard experience.</p>
                    <Link
                      href="/courses"
                      className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Explore Courses
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {enrolledCourseObjects.map((course, index) => {
                      const courseCompletedCount = course.lessonList.filter((lesson) =>
                        completedLessons.includes(lesson.slug)
                      ).length;
                      const courseProgress = Math.round(
                        (courseCompletedCount / course.lessonList.length) * 100
                      );

                      return (
                        <article
                          key={course.slug}
                          className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                          <div className={cn("relative h-32 bg-gradient-to-br", courseArtwork[index % courseArtwork.length])}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_30%)]" />
                            <div className="absolute inset-x-5 bottom-4 flex items-center justify-between text-white">
                              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                                {course.level}
                              </span>
                              <span className="rounded-full bg-emerald-400 px-2 py-1 text-[11px] font-semibold text-emerald-950">
                                {course.lessons} lessons
                              </span>
                            </div>
                          </div>

                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-xl font-semibold text-slate-950">{course.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-500">{course.description}</p>
                              </div>
                              <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
                            </div>

                            <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                              <span>{courseCompletedCount} completed</span>
                              <span>{courseProgress}% progress</span>
                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                style={{ width: `${courseProgress}%` }}
                              />
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-500">{course.lessonList.length * 6} learners in this path</p>
                              <Link
                                href={`/courses/${course.slug}`}
                                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                              >
                                Open
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Student Progress</p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Learning momentum</h2>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                      This Semester
                      <ChevronDownIcon />
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-6 rounded-full bg-emerald-500" />
                      Completed
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-6 rounded-full bg-blue-500" />
                      In Progress
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-6 rounded-full bg-rose-500" />
                      Not Started
                    </span>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <div className="min-w-[380px]">
                      <svg viewBox="0 0 320 190" className="h-[240px] w-full">
                        {[0, 1, 2, 3, 4].map((line) => (
                          <line
                            key={line}
                            x1="20"
                            y1={30 + line * 30}
                            x2="300"
                            y2={30 + line * 30}
                            stroke="#e2e8f0"
                            strokeDasharray="4 6"
                          />
                        ))}
                        {chartMonths.map((_, index) => (
                          <line
                            key={index}
                            x1={24 + index * 56}
                            y1="20"
                            x2={24 + index * 56}
                            y2="160"
                            stroke="#f1f5f9"
                          />
                        ))}
                        <polyline points={buildPolyline(progressSeries.completed)} fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points={buildPolyline(progressSeries.inProgress)} fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points={buildPolyline(progressSeries.notStarted)} fill="none" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        {chartMonths.map((month, index) => (
                          <text key={month} x={24 + index * 56} y="182" textAnchor="middle" fontSize="11" fill="#64748b">
                            {month}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>
                </section>

                <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Recent Activity</p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">What changed</h2>
                    </div>
                    <button className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500">More</button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {activities.map((activity) => (
                      <article key={activity.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                        <ActionIcon tone={activity.tone} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-900">{activity.title}</h3>
                              <p className="mt-1 text-sm text-slate-500">{activity.context}</p>
                            </div>
                            <span className="text-sm text-slate-400">{activity.time}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <aside className="space-y-6">
              <section className="overflow-hidden rounded-[30px] border border-cyan-100 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.9),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(253,224,71,0.35),_transparent_24%),linear-gradient(135deg,_#ffffff_0%,_#f8fbff_100%)] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Quick Actions</h2>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Daily
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { label: currentLesson ? "Resume Lesson" : "Browse Courses", href: currentLesson ? `/lesson/${currentLesson}` : "/courses", primary: true, icon: BookIcon },
                    { label: "My Courses", href: "/courses", primary: false, icon: GridIcon },
                    { label: "Assignments", href: "/dashboard", primary: false, icon: CheckSquareIcon },
                    { label: "Learning Resources", href: "/courses", primary: false, icon: MessageIcon },
                  ].map((action) => {
                    const Icon = action.icon;

                    return (
                      <Link
                        key={action.label}
                        href={action.href}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-semibold transition",
                          action.primary
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                            : "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className={cn("rounded-2xl p-2", action.primary ? "bg-white/15" : "bg-slate-100")}>
                            <Icon />
                          </span>
                          {action.label}
                        </span>
                        <span className="text-lg">+</span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Announcements</h2>
                  <button className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">View All</button>
                </div>

                <div className="mt-5 space-y-3">
                  {announcements.map((announcement, index) => (
                    <article key={announcement} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-1 h-10 w-1 rounded-full",
                            index === 0 && "bg-amber-400",
                            index === 1 && "bg-rose-400",
                            index === 2 && "bg-blue-400"
                          )}
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900">{announcement}</h3>
                          <p className="mt-1 text-sm text-slate-500">Fresh updates tailored to your learning workflow.</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Upcoming</h2>
                  <button className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500">...</button>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      title: "Deep Work Session",
                      subtitle: currentLesson ? `Continue ${formatTitle(currentLesson)}` : "Review your next course",
                      cta: currentLesson ? "Join" : "Open",
                    },
                    { title: "Course Review", subtitle: `${progressPercentage}% overall progress` },
                    { title: "Study Planning", subtitle: `${enrolledCourseObjects.length} active courses to manage` },
                  ].map((event) => (
                    <article key={event.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                            <CalendarIcon />
                          </span>
                          <div>
                            <h3 className="font-semibold text-slate-900">{event.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">{event.subtitle}</p>
                          </div>
                        </div>

                        {event.cta ? (
                          <Link
                            href={currentLesson ? `/lesson/${currentLesson}` : "/courses"}
                            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            {event.cta}
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
