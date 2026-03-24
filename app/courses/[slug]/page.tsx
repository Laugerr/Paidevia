"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

const heroArt = [
  "from-sky-500 via-blue-400 to-cyan-100",
  "from-emerald-500 via-teal-400 to-lime-100",
  "from-orange-500 via-rose-400 to-amber-100",
];

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const foundCourse = useMemo(() => {
    if (!slug) return undefined;
    return courses.find((course) => course.slug === slug);
  }, [slug]);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoadingEnrollment, setIsLoadingEnrollment] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (!foundCourse) {
      setIsLoadingEnrollment(false);
      return;
    }

    const course = foundCourse;

    async function loadCourseState() {
      try {
        const [enrollmentResponse, progressResponse] = await Promise.all([
          fetch("/api/enrollments", { cache: "no-store" }),
          fetch("/api/progress", { cache: "no-store" }),
        ]);

        if (!enrollmentResponse.ok) {
          throw new Error("Failed to load enrollments");
        }

        if (!progressResponse.ok) {
          throw new Error("Failed to load progress");
        }

        const enrollmentData = await enrollmentResponse.json();
        const progressData = await progressResponse.json();

        const enrolledCourses: string[] = enrollmentData.enrolledCourses ?? [];
        const completedLessonSlugs: string[] =
          progressData.completedLessons ?? [];

        setIsEnrolled(enrolledCourses.includes(course.slug));
        setCompletedLessons(completedLessonSlugs);

        const firstIncompleteLesson =
          course.lessonList.find(
            (lesson) => !completedLessonSlugs.includes(lesson.slug)
          ) ?? course.lessonList[0];

        setCurrentLesson(firstIncompleteLesson?.slug ?? null);
      } catch (error) {
        console.error("Failed to load course state:", error);
      } finally {
        setIsLoadingEnrollment(false);
      }
    }

    loadCourseState();
  }, [foundCourse]);

  if (!slug || !foundCourse) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[36px] border border-white/80 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Course Not Found
          </h1>
          <p className="mt-4 text-slate-600">
            The course you are looking for does not exist.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-blue-700"
          >
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  const totalLessons = foundCourse.lessonList.length;
  const completedLessonsInCourse = foundCourse.lessonList.filter((lesson) =>
    completedLessons.includes(lesson.slug)
  ).length;
  const progressPercentage =
    totalLessons > 0
      ? Math.round((completedLessonsInCourse / totalLessons) * 100)
      : 0;

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);

      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSlug: foundCourse.slug,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to enroll");
      }

      setIsEnrolled(true);
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const artIndex = courses.findIndex((course) => course.slug === foundCourse.slug);

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.76),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.8),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-200/25 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_340px] xl:items-center">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 shadow-sm ring-1 ring-slate-200/80">
                  {foundCourse.level}
                </span>
                <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  Learning Path
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {foundCourse.title}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {foundCourse.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80">
                  {foundCourse.lessons} lessons
                </span>
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80">
                  Self-paced
                </span>
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80">
                  Guided progression
                </span>
              </div>
            </div>

            <div
              className={cn(
                "relative h-64 overflow-hidden rounded-[32px] bg-gradient-to-br shadow-[0_18px_48px_rgba(15,23,42,0.08)]",
                heroArt[(artIndex + heroArt.length) % heroArt.length]
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(255,255,255,0.22),transparent_22%)]" />
              <div className="absolute left-5 top-5 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                Featured Path
              </div>
              <div className="absolute bottom-5 left-5 right-5 rounded-[26px] bg-white/18 p-5 text-white backdrop-blur">
                <p className="text-sm font-medium text-white/80">Course progress</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">
                  {progressPercentage}%
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_320px]">
          <aside className="order-1 space-y-6 xl:order-2">
            <section className="rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Course Access
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Start learning right away
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Enroll in this course to unlock the lesson flow and continue
                through the player experience step by step.
              </p>

              {isLoadingEnrollment ? (
                <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-4 text-center text-sm font-medium text-slate-500 ring-1 ring-slate-200">
                  Checking enrollment...
                </div>
              ) : !isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="mt-6 w-full rounded-2xl border border-blue-200 bg-blue-100 px-5 py-4 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(59,130,246,0.12)] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-950 hover:shadow-[0_24px_48px_rgba(16,185,129,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: "#dbeafe" }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = "#d1fae5";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = "#dbeafe";
                  }}
                >
                  {isEnrolling ? "Enrolling..." : "Enroll in Course"}
                </button>
              ) : (
                <>
                  <div className="mt-6 rounded-[24px] bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                    Enrolled. You now have access to this learning path.
                  </div>

                  {currentLesson ? (
                    <Link
                      href={`/lesson/${currentLesson}`}
                      className="mt-4 block w-full rounded-xl bg-blue-600 px-5 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      Continue Learning
                    </Link>
                  ) : null}
                </>
              )}

              <Link
                href="/dashboard"
                className="mt-4 block w-full rounded-xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Go to Dashboard
              </Link>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Learning Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Lessons</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {foundCourse.lessons}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Completed</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {completedLessonsInCourse}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">
                    Current state
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {isEnrolled ? "Active" : "Preview"}
                  </p>
                </div>
              </div>
            </section>
          </aside>

          <div className="order-2 space-y-6 xl:order-1">
            <section className="rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Course Progress
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Track your journey
                  </h2>
                </div>

                <div className="rounded-[24px] bg-slate-50/80 px-5 py-4 text-center ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Progress</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                    {progressPercentage}%
                  </p>
                </div>
              </div>

              <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-600">
                {completedLessonsInCourse} / {totalLessons} lessons completed
              </p>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Lessons
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Course roadmap
                  </h2>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Back to Courses
                </Link>
              </div>

              <ul className="mt-8 space-y-4">
                {foundCourse.lessonList.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.slug);
                  const isUnlocked =
                    index === 0 ||
                    completedLessons.includes(foundCourse.lessonList[index - 1].slug);

                  return (
                    <li
                      key={lesson.slug}
                      className={cn(
                        "rounded-[26px] border px-5 py-5 transition duration-200",
                        isUnlocked
                          ? "border-slate-200 bg-slate-50/70 hover:bg-slate-50"
                          : "border-slate-200 bg-slate-100/80 opacity-75"
                      )}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <span
                            className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold",
                              isCompleted &&
                                "bg-emerald-100 text-emerald-700",
                              !isCompleted &&
                                isUnlocked &&
                                "bg-white text-slate-600 ring-1 ring-slate-200",
                              !isUnlocked && "bg-slate-200 text-slate-500"
                            )}
                          >
                            {isCompleted ? "OK" : isUnlocked ? index + 1 : "..."}
                          </span>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                              Lesson {index + 1}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-950">
                              {lesson.title}
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                              {isCompleted
                                ? "Completed and ready for review."
                                : isUnlocked
                                ? "Unlocked and ready to start."
                                : "Finish the previous lesson to unlock this step."}
                            </p>
                          </div>
                        </div>

                        {isUnlocked ? (
                          <Link
                            href={`/lesson/${lesson.slug}`}
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                          >
                            Open Lesson
                          </Link>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-xl bg-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-500">
                            Locked
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
