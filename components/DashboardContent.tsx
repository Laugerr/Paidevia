import Link from "next/link";
import type { ReactNode } from "react";

type DashboardLesson = { title: string; slug: string };
type DashboardCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  lessonList: DashboardLesson[];
};
type DashboardContentProps = {
  userName?: string | null;
  enrolledCourses: DashboardCourse[];
  recommendedCourses: DashboardCourse[];
  completedLessons: string[];
  currentLesson: string | null;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const art = [
  "from-blue-900 via-sky-800 to-indigo-900",
  "from-emerald-900 via-teal-800 to-green-900",
  "from-orange-900 via-red-800 to-rose-900",
];

export default function DashboardContent({
  userName,
  enrolledCourses,
  recommendedCourses,
  completedLessons,
  currentLesson,
}: DashboardContentProps) {
  const hasEnrolledCourses = enrolledCourses.length > 0;
  const hasRecommendedCourses = recommendedCourses.length > 0;
  const enrolledCourseSlugs = enrolledCourses.map((c) => c.slug);
  const totalLessons = enrolledCourses.reduce((t, c) => t + c.lessonList.length, 0);
  const completedCount = completedLessons.filter((slug) =>
    enrolledCourses.some((c) => c.lessonList.some((l) => l.slug === slug))
  ).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const welcomeName = userName?.split(" ")[0] ?? "Scholar";
  const streakDays = Math.max(3, Math.min(7, completedCount || 1));

  const baseCourses = (enrolledCourses.length ? enrolledCourses : recommendedCourses).filter(
    (c) => c.lessonList.length > 0
  );
  const continueCourses = baseCourses.slice(0, 2).map((course) => {
    const done = course.lessonList.filter((l) => completedLessons.includes(l.slug)).length;
    const nextLesson = course.lessonList.find((l) => !completedLessons.includes(l.slug)) ?? course.lessonList[course.lessonList.length - 1];
    const progress = course.lessonList.length > 0 ? Math.round((done / course.lessonList.length) * 100) : 0;
    return { course, done, nextLesson, progress };
  });

  const gridCourses = baseCourses.slice(0, 3);
  const allEnrolledCoursesCompleted =
    hasEnrolledCourses &&
    enrolledCourses.every((c) => c.lessonList.every((l) => completedLessons.includes(l.slug)));

  const achievements = [
    {
      title: completedCount > 0 ? "Lesson Completed" : "Ready to Begin",
      desc: completedCount > 0 ? `Finished ${completedCount} lesson${completedCount === 1 ? "" : "s"} so far` : "Start your first lesson",
      tone: "bg-[rgba(146,204,65,0.12)] text-[#92cc41]",
      icon: (<Icon><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" /></Icon>),
    },
    {
      title: "Course Enrolled",
      desc: enrolledCourses[0]?.title ?? "Choose a course to start",
      tone: "bg-[rgba(167,139,250,0.12)] text-[#a78bfa]",
      icon: (<Icon><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M17 5h2a2 2 0 0 1 2 2c0 2.5-2 4-4 4" /><path d="M7 5H5a2 2 0 0 0-2 2c0 2.5 2 4 4 4" /></Icon>),
    },
    {
      title: `${streakDays}-Day Streak`,
      desc: "Maintained your learning rhythm",
      tone: "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]",
      icon: (<Icon><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z" /></Icon>),
    },
  ];

  const stats = [
    {
      label: "Enrolled Courses",
      value: enrolledCourses.length,
      detail: `${Math.max(enrolledCourses.length - 1, 0)} in progress`,
      tone: "bg-[rgba(167,139,250,0.12)] text-[#a78bfa]",
      icon: (<Icon><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" /><path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" /></Icon>),
    },
    {
      label: "Overall Progress",
      value: `${progressPercentage}%`,
      detail: "Across active courses",
      tone: "bg-[rgba(32,156,238,0.12)] text-[#209cee]",
      icon: (<Icon><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></Icon>),
    },
    {
      label: "Lessons Completed",
      value: completedCount,
      detail: `Of ${totalLessons} total`,
      tone: "bg-[rgba(146,204,65,0.12)] text-[#92cc41]",
      icon: (<Icon><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" /></Icon>),
    },
    {
      label: "Study Time",
      value: `${Math.max(completedCount, 1) * 32}m`,
      detail: "Focused learning time",
      tone: "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]",
      icon: (<Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>),
    },
  ];

  return (
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Welcome Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-[#209cee]/8 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#92cc41]/6 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#209cee]/40 to-transparent" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_300px] xl:items-center">
            <div className="max-w-2xl">
              <p className="font-pixel text-[9px] text-[#209cee]">Student Dashboard</p>
              <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl lg:text-4xl">
                Welcome back, <span className="text-[#209cee]">{welcomeName}</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#8b949e] sm:text-base">
                {hasEnrolledCourses
                  ? allEnrolledCoursesCompleted
                    ? "You've completed all active lessons. Explore more published courses when you're ready."
                    : "Continue your learning journey and keep building momentum."
                  : "Your learning workspace is ready. Browse courses to start tracking progress."}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={currentLesson ? `/lesson/${currentLesson}` : "/courses"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#209cee] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(32,156,238,0.3)] transition duration-200 hover:bg-[#1786c9] hover:-translate-y-0.5"
                >
                  <Icon className="h-4 w-4">
                    <path d="M8 6.5v11l9-5.5z" fill="currentColor" stroke="none" />
                  </Icon>
                  Continue Learning
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b] hover:-translate-y-0.5"
                >
                  Browse Courses
                </Link>
              </div>
            </div>

            {/* Streak widget */}
            <div className="rounded-xl border border-[#30363d] bg-[#21262d] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#e6edf3]">Learning Streak</p>
                  <p className="mt-1 text-xs text-[#8b949e]">Keep your rhythm going.</p>
                </div>
                <span className="rounded-lg bg-[rgba(247,213,29,0.12)] px-2.5 py-1 font-pixel text-[8px] text-[#f7d51d]">
                  Active
                </span>
              </div>
              <div className="mt-5 flex items-end gap-2">
                <p className="text-4xl font-bold text-[#e6edf3]">{streakDays}</p>
                <p className="pb-1 text-sm text-[#8b949e]">days</p>
              </div>
              <div className="mt-5 grid grid-cols-7 gap-1.5">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={`${day}-${index}`} className="text-center">
                    <div
                      className={cn(
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition duration-200",
                        index < streakDays
                          ? "bg-[#209cee] text-white shadow-[0_2px_8px_rgba(32,156,238,0.35)]"
                          : "bg-[#2d333b] text-[#6e7681] ring-1 ring-[#30363d]"
                      )}
                    >
                      {day}
                    </div>
                    <p className="mt-1.5 text-[9px] font-medium text-[#6e7681]">{day}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-pixel text-[9px] text-[#209cee]">Learning Overview</p>
              <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3] sm:text-2xl">
                Your current snapshot
              </h2>
            </div>
            <p className="text-xs text-[#6e7681]">Core learning metrics</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-xl border border-[#30363d] bg-[#21262d] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#3d444d]"
              >
                <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", stat.tone)}>
                  {stat.icon}
                </span>
                <p className="mt-4 text-xs font-medium text-[#8b949e]">{stat.label}</p>
                <p className="mt-1.5 text-3xl font-bold text-[#e6edf3]">{stat.value}</p>
                <p className="mt-1 text-xs text-[#6e7681]">{stat.detail}</p>
                {stat.label === "Overall Progress" && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#2d333b]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#209cee] to-[#92cc41]"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Main content + Sidebar */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_300px]">
          <div className="space-y-5">

            {/* Continue Learning */}
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-pixel text-[9px] text-[#209cee]">Continue Learning</p>
                  <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3] sm:text-2xl">
                    Pick up where you left off
                  </h2>
                </div>
                <Link href="/courses" className="hidden text-sm font-semibold text-[#209cee] transition hover:text-[#1786c9] sm:inline-flex">
                  View All
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {continueCourses.length > 0 ? (
                  continueCourses.map(({ course, done, nextLesson, progress }, index) => (
                    <article
                      key={course.slug}
                      className="flex flex-col gap-4 rounded-xl border border-[#30363d] bg-[#21262d] p-4 transition duration-200 hover:border-[#3d444d] sm:flex-row sm:items-center"
                    >
                      <div className={cn("relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:w-24", art[index % art.length])}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%)]" />
                        <div className="absolute left-2 top-2 rounded-md border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                          {course.level}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-base font-semibold text-[#e6edf3] sm:text-lg">{course.title}</h3>
                        <p className="mt-1 text-xs text-[#8b949e]">
                          Lesson {Math.min(done + 1, course.lessonList.length)} of {course.lessonList.length} · {nextLesson.title}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2d333b]">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#209cee] to-[#92cc41]" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[#8b949e]">{progress}%</span>
                        </div>
                      </div>

                      <Link
                        href={progress < 100 ? `/lesson/${nextLesson.slug}` : `/courses/${course.slug}`}
                        className="inline-flex w-full shrink-0 items-center justify-center rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-2.5 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#209cee] hover:text-white hover:border-[#209cee] sm:w-auto"
                      >
                        Continue
                      </Link>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[#30363d] bg-[#21262d] p-6 text-center">
                    <p className="font-heading text-base font-semibold text-[#e6edf3]">No course activity yet</p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-[#8b949e]">
                      Enroll in a published course to build your continue-learning queue.
                    </p>
                    <Link
                      href="/courses"
                      className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#209cee] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-[#1786c9]"
                    >
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/courses"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-3 text-sm font-semibold text-[#8b949e] transition duration-200 hover:bg-[#2d333b] hover:text-[#e6edf3] sm:hidden"
              >
                View All My Courses
              </Link>
            </section>

            {/* Recommended Grid */}
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-pixel text-[9px] text-[#209cee]">Course Grid</p>
                  <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3] sm:text-2xl">
                    Recommended for you
                  </h2>
                </div>
                <Link href="/courses" className="text-sm font-semibold text-[#209cee] transition hover:text-[#1786c9]">
                  Browse All
                </Link>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {gridCourses.length > 0 ? (
                  gridCourses.map((course, index) => {
                    const done = course.lessonList.filter((l) => completedLessons.includes(l.slug)).length;
                    const progress = course.lessonList.length > 0 ? Math.round((done / course.lessonList.length) * 100) : 0;
                    const enrolled = enrolledCourseSlugs.includes(course.slug);

                    return (
                      <article
                        key={course.slug}
                        className="overflow-hidden rounded-xl border border-[#30363d] bg-[#21262d] transition duration-200 hover:border-[#3d444d] hover:-translate-y-0.5"
                      >
                        <div className={cn("relative h-24 bg-gradient-to-br", art[index % art.length])}>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%)]" />
                          <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                            {course.level}
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-heading min-h-[2.5rem] text-sm font-semibold text-[#e6edf3]">{course.title}</h3>
                          <p className="mt-2 min-h-[4rem] text-xs leading-5 text-[#8b949e]">{course.description}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-[#8b949e]">
                            <span>Progress</span>
                            <span className="font-semibold text-[#e6edf3]">{progress}%</span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#2d333b]">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#209cee] to-[#92cc41]" style={{ width: `${progress}%` }} />
                          </div>
                          <Link
                            href={`/courses/${course.slug}`}
                            className={cn(
                              "mt-4 inline-flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-xs font-semibold transition duration-200",
                              enrolled
                                ? "bg-[#209cee] text-white hover:bg-[#1786c9]"
                                : "border border-[#30363d] bg-[#2d333b] text-[#e6edf3] hover:bg-[#3d444d]"
                            )}
                          >
                            {enrolled ? "Continue Learning" : "Start Course"}
                          </Link>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="col-span-full rounded-xl border border-dashed border-[#30363d] bg-[#21262d] p-6 text-center">
                    <p className="font-heading text-sm font-semibold text-[#e6edf3]">
                      {hasRecommendedCourses ? "More courses coming soon" : "No published courses yet"}
                    </p>
                    <p className="mt-2 text-xs text-[#8b949e]">
                      Published courses will appear here for your path.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">

            {/* Achievements */}
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <p className="font-pixel text-[9px] text-[#209cee]">Achievements</p>
              <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3]">
                Recent milestones
              </h2>
              <div className="mt-5 space-y-3">
                {achievements.map((achievement) => (
                  <article
                    key={achievement.title}
                    className="flex gap-3 rounded-xl border border-[#30363d] bg-[#21262d] p-3.5 transition duration-200 hover:border-[#3d444d]"
                  >
                    <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", achievement.tone)}>
                      {achievement.icon}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#e6edf3]">{achievement.title}</h3>
                      <p className="mt-0.5 text-xs leading-5 text-[#8b949e]">{achievement.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
              <Link
                href="/profile"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-3 text-sm font-semibold text-[#8b949e] transition duration-200 hover:bg-[#2d333b] hover:text-[#e6edf3]"
              >
                View All Achievements
              </Link>
            </section>

            {/* Quick Actions */}
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <p className="font-pixel text-[9px] text-[#209cee]">Quick Actions</p>
              <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3]">
                Jump back in
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  {
                    label: currentLesson ? "Continue Lesson" : "Browse All Courses",
                    href: currentLesson ? `/lesson/${currentLesson}` : "/courses",
                    note: currentLesson ? "Resume from where you paused" : allEnrolledCoursesCompleted ? "You completed your active path" : "Find your next place to start",
                    primary: true,
                  },
                  {
                    label: "View Certificates",
                    href: "/profile",
                    note: "Track your milestones",
                    primary: false,
                  },
                  {
                    label: "Open Profile",
                    href: "/profile",
                    note: "Manage your learning identity",
                    primary: false,
                  },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={cn(
                      "block rounded-xl px-4 py-3.5 transition duration-200",
                      action.primary
                        ? "bg-[#209cee] text-white shadow-[0_4px_12px_rgba(32,156,238,0.25)] hover:bg-[#1786c9] hover:-translate-y-0.5"
                        : "border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#2d333b] hover:-translate-y-0.5"
                    )}
                  >
                    <span className="block text-sm font-semibold">{action.label}</span>
                    <span className={cn("mt-0.5 block text-xs", action.primary ? "text-white/70" : "text-[#6e7681]")}>
                      {action.note}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
