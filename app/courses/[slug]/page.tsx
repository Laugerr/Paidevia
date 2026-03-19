"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { courses } from "@/lib/courses";

export default function CoursePage() {
  const params = useParams();
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
        const completedLessonSlugs: string[] = progressData.completedLessons ?? [];

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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="rounded-[32px] border border-white/70 bg-white/90 p-8">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Course Not Found
            </h1>
            <p className="mt-4 text-slate-600">
              The course you are looking for does not exist.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0ea5e9_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
            >
              Back to Courses
            </Link>
          </div>
        </section>
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[32px] border border-cyan-100 bg-[radial-gradient(circle_at_left,_rgba(125,211,252,0.3),_transparent_28%),linear-gradient(135deg,_#f4fbff_0%,_#ffffff_58%,_#eef6ff_100%)] p-8">
              <div className="absolute -left-4 top-7 h-24 w-24 rounded-full border-[10px] border-cyan-200/40" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 shadow-sm ring-1 ring-slate-200">
                    {foundCourse.level}
                  </span>
                  <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Learning Path
                  </span>
                </div>

                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {foundCourse.title}
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {foundCourse.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                    {foundCourse.lessons} lessons
                  </span>
                  <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                    Self-paced
                  </span>
                  <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                    Guided progression
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                    Course Progress
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Your journey through this path
                  </h2>
                </div>

                <div className="rounded-[24px] bg-slate-50 px-5 py-4 text-center ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Progress</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                    {progressPercentage}%
                  </p>
                </div>
              </div>

              <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-600">
                {completedLessonsInCourse} / {totalLessons} lessons completed
              </p>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                    Lessons
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Course roadmap
                  </h2>
                </div>
                <Link
                  href="/courses"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
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
                      className={`rounded-[24px] border px-5 py-5 transition ${
                        isUnlocked
                          ? "border-slate-200 bg-slate-50/80 hover:bg-slate-50"
                          : "border-slate-200 bg-slate-100/80 opacity-70"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-700"
                                : isUnlocked
                                ? "bg-white text-slate-600 ring-1 ring-slate-200"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {isCompleted ? "OK" : isUnlocked ? index + 1 : "..."}
                          </span>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
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
                            className="rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0ea5e9_100%)] px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                          >
                            Open Lesson
                          </Link>
                        ) : (
                          <span className="rounded-2xl bg-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-500">
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

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
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
                  className="mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0ea5e9_100%)] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEnrolling ? "Enrolling..." : "Enroll in Course"}
                </button>
              ) : (
                <>
                  <div className="mt-6 rounded-[24px] bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                    Enrolled. You now have access to this learning path.
                  </div>

                  {currentLesson && (
                    <Link
                      href={`/lesson/${currentLesson}`}
                      className="mt-4 block w-full rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0ea5e9_100%)] px-5 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                    >
                      Continue Learning
                    </Link>
                  )}
                </>
              )}

              <Link
                href="/dashboard"
                className="mt-4 block w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Go to Dashboard
              </Link>
            </section>

            <section className="rounded-[30px] border border-cyan-100 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.8),_transparent_34%),linear-gradient(135deg,_#ffffff_0%,_#f8fbff_100%)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                Learning Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white/90 px-4 py-4 ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Lessons</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {foundCourse.lessons}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 px-4 py-4 ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Completed</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {completedLessonsInCourse}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 px-4 py-4 ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Current state</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {isEnrolled ? "Active" : "Preview"}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
