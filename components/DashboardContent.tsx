import Link from "next/link";
import type { ReactNode } from "react";

type DashboardLesson = {
  title: string;
  slug: string;
};

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

const art = [
  "from-rose-400 via-orange-300 to-amber-100",
  "from-blue-600 via-sky-400 to-cyan-100",
  "from-emerald-500 via-teal-300 to-lime-100",
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
  const enrolledCourseSlugs = enrolledCourses.map((course) => course.slug);
  const totalLessons = enrolledCourses.reduce(
    (total, course) => total + course.lessonList.length,
    0
  );
  const completedCount = completedLessons.filter((lessonSlug) =>
    enrolledCourses.some((course) =>
      course.lessonList.some((lesson) => lesson.slug === lessonSlug)
    )
  ).length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const welcomeName = userName?.split(" ")[0] ?? "Scholar";
  const streakDays = Math.max(3, Math.min(7, completedCount || 1));

  const baseCourses = (enrolledCourses.length ? enrolledCourses : recommendedCourses).filter(
    (course) => course.lessonList.length > 0
  );

  const continueCourses = baseCourses.slice(0, 2).map((course) => {
    const done = course.lessonList.filter((lesson) =>
      completedLessons.includes(lesson.slug)
    ).length;
    const nextLesson =
      course.lessonList.find(
        (lesson) => !completedLessons.includes(lesson.slug)
      ) ?? course.lessonList[course.lessonList.length - 1];
    const progress =
      course.lessonList.length > 0
        ? Math.round((done / course.lessonList.length) * 100)
        : 0;

    return { course, done, nextLesson, progress };
  });

  const gridCourses = baseCourses.slice(0, 3);
  const allEnrolledCoursesCompleted =
    hasEnrolledCourses &&
    enrolledCourses.every((course) =>
      course.lessonList.every((lesson) => completedLessons.includes(lesson.slug))
    );

  const achievements = [
    {
      title: completedCount > 0 ? "Lesson Completed" : "Ready to Begin",
      desc:
        completedCount > 0
          ? `Finished ${completedCount} lesson${completedCount === 1 ? "" : "s"} so far`
          : "Start your first lesson to unlock milestones",
      tone: "bg-emerald-100 text-emerald-600",
      icon: (
        <Icon>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 12 2 2 4-4" />
        </Icon>
      ),
    },
    {
      title: "Course Enrolled",
      desc: enrolledCourses[0]?.title ?? "Choose a course to start learning",
      tone: "bg-violet-100 text-violet-600",
      icon: (
        <Icon>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
          <path d="M17 5h2a2 2 0 0 1 2 2c0 2.5-2 4-4 4" />
          <path d="M7 5H5a2 2 0 0 0-2 2c0 2.5 2 4 4 4" />
        </Icon>
      ),
    },
    {
      title: `${streakDays}-Day Streak`,
      desc: "Maintained your learning rhythm this week",
      tone: "bg-amber-100 text-amber-600",
      icon: (
        <Icon>
          <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z" />
        </Icon>
      ),
    },
  ];

  const stats = [
    {
      label: "Enrolled Courses",
      value: enrolledCourses.length,
      detail: `${Math.max(enrolledCourses.length - 1, 0)} in progress`,
      tone: "bg-violet-100 text-violet-600",
      icon: (
        <Icon>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z" />
          <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5V21" />
        </Icon>
      ),
    },
    {
      label: "Overall Progress",
      value: `${progressPercentage}%`,
      detail: "Across active courses",
      tone: "bg-blue-100 text-blue-600",
      icon: (
        <Icon>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
        </Icon>
      ),
    },
    {
      label: "Lessons Completed",
      value: completedCount,
      detail: `Of ${totalLessons} total`,
      tone: "bg-emerald-100 text-emerald-600",
      icon: (
        <Icon>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 12 2 2 4-4" />
        </Icon>
      ),
    },
    {
      label: "Study Time",
      value: `${Math.max(completedCount, 1) * 32}m`,
      detail: "Focused learning time",
      tone: "bg-amber-100 text-amber-600",
      icon: (
        <Icon>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </Icon>
      ),
    },
  ];

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[34px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.7),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.78),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_320px] xl:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                Student Dashboard
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Welcome back, {welcomeName}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {hasEnrolledCourses
                  ? allEnrolledCoursesCompleted
                    ? "You’ve completed all active lessons for now. Explore more published courses whenever you’re ready for the next learning path."
                    : "Continue your learning journey and keep building momentum in a cleaner, calmer workspace."
                  : "Your learning workspace is ready. Browse published courses to start building momentum and track progress here."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={currentLesson ? `/lesson/${currentLesson}` : "/courses"}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <Icon className="h-4 w-4">
                    <path
                      d="M8 6.5v11l9-5.5z"
                      fill="currentColor"
                      stroke="none"
                    />
                  </Icon>
                  Continue Learning
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/92 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  Browse Courses
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/90 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Learning Streak
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Complete a lesson today to maintain your rhythm.
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Active
                </span>
              </div>
              <div className="mt-6 flex items-end gap-3">
                <p className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {streakDays}
                </p>
                <p className="pb-1 text-sm text-slate-500">days</p>
              </div>
              <div className="mt-6 grid grid-cols-7 gap-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={`${day}-${index}`} className="text-center">
                    <div
                      className={cn(
                        "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition duration-200",
                        index < streakDays
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                      )}
                    >
                      {day}
                    </div>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      {day}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Learning Overview
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Your current learning snapshot
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              A single place for your core learning metrics today, with room for
              richer activity signals in future updates.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)] sm:p-6"
              >
                <span
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                    stat.tone
                  )}
                >
                  {stat.icon}
                </span>
                <p className="mt-5 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
                {stat.label === "Overall Progress" ? (
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Continue Learning
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Pick up where you left off
                  </h2>
                </div>
                <Link
                  href="/courses"
                  className="hidden text-sm font-semibold text-blue-600 transition hover:text-blue-700 sm:inline-flex"
                >
                  View All
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {continueCourses.length > 0 ? (
                  continueCourses.map(({ course, done, nextLesson, progress }, index) => (
                    <article
                      key={course.slug}
                      className="flex flex-col gap-5 rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:flex-row sm:items-center sm:p-5"
                    >
                      <div
                        className={cn(
                          "relative h-24 w-full shrink-0 overflow-hidden rounded-[24px] bg-gradient-to-br sm:w-28",
                          art[index % art.length]
                        )}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.34),transparent_18%)]" />
                        <div className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {course.level}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Lesson {Math.min(done + 1, course.lessonList.length)} of{" "}
                          {course.lessonList.length} {" · "} {nextLesson.title}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-500">
                            {progress}%
                          </span>
                        </div>
                      </div>

                      <Link
                        href={
                          progress < 100
                            ? `/lesson/${nextLesson.slug}`
                            : `/courses/${course.slug}`
                        }
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:bg-white sm:w-auto"
                      >
                        Continue Lesson
                      </Link>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                    <p className="text-lg font-semibold tracking-tight text-slate-950">
                      No course activity yet
                    </p>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                      Enroll in a published course to build your continue-learning
                      queue and resume lessons from one focused place.
                    </p>
                    <Link
                      href="/courses"
                      className="mt-5 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      Browse Available Courses
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/courses"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-white sm:hidden"
              >
                View All My Courses
              </Link>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Course Grid
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Recommended for your path
                  </h2>
                </div>
                <Link
                  href="/courses"
                  className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Browse All
                </Link>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {gridCourses.length > 0 ? (
                  gridCourses.map((course, index) => {
                    const done = course.lessonList.filter((lesson) =>
                      completedLessons.includes(lesson.slug)
                    ).length;
                    const progress =
                      course.lessonList.length > 0
                        ? Math.round((done / course.lessonList.length) * 100)
                        : 0;
                    const enrolled = enrolledCourseSlugs.includes(course.slug);

                    return (
                      <article
                        key={course.slug}
                        className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                      >
                        <div
                          className={cn(
                            "relative h-32 bg-gradient-to-br",
                            art[index % art.length]
                          )}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.48),transparent_22%),radial-gradient(circle_at_80%_78%,rgba(255,255,255,0.24),transparent_22%)]" />
                          <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold text-slate-700">
                            {course.level}
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="min-h-[3.5rem] text-2xl font-semibold tracking-tight text-slate-950">
                            {course.title}
                          </h3>
                          <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-500">
                            {course.description}
                          </p>
                          <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                            <span>Progress</span>
                            <span className="font-semibold text-slate-700">
                              {progress}%
                            </span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <Link
                            href={`/courses/${course.slug}`}
                            className={cn(
                              "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200",
                              enrolled
                                ? "bg-blue-600 text-white hover:-translate-y-0.5 hover:bg-blue-700"
                                : "border border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50"
                            )}
                          >
                            {enrolled ? "Continue Learning" : "Start Course"}
                          </Link>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="xl:col-span-3 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                    <p className="text-lg font-semibold tracking-tight text-slate-950">
                      {hasRecommendedCourses
                        ? "Recommended courses are coming together"
                        : "No published courses available yet"}
                    </p>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                      {hasRecommendedCourses
                        ? "We’re preparing more structured learning paths for your dashboard recommendations."
                        : "Once published courses are available, they’ll appear here for students to explore."}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Achievements
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Recent milestones
              </h2>
              <div className="mt-6 space-y-5">
                {achievements.map((achievement) => (
                  <article
                    key={achievement.title}
                    className="flex gap-4 rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4 transition duration-200 hover:bg-white"
                  >
                    <span
                      className={cn(
                        "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                        achievement.tone
                      )}
                    >
                      {achievement.icon}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                        {achievement.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {achievement.desc}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <Link
                href="/profile"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-white"
              >
                View All Achievements
              </Link>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Quick Actions
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Jump back in
              </h2>
              <div className="mt-6 space-y-3">
                {[
                  {
                    label: currentLesson
                      ? "Continue Lesson"
                      : "Browse All Courses",
                    href: currentLesson ? `/lesson/${currentLesson}` : "/courses",
                    note: currentLesson
                      ? "Resume from where you paused"
                      : allEnrolledCoursesCompleted
                      ? "You completed your active path"
                      : "Find your next place to start",
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
                      "block rounded-2xl px-4 py-4 transition duration-200",
                      action.primary
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:bg-blue-700"
                        : "border border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:bg-slate-50"
                    )}
                  >
                    <span className="block text-sm font-semibold">
                      {action.label}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-xs",
                        action.primary ? "text-blue-100" : "text-slate-500"
                      )}
                    >
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
