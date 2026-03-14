"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { courses } from "@/lib/courses";
import { getCompletedLessons, getCurrentLesson } from "@/lib/progress";

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

    const savedCurrentLesson = getCurrentLesson();
    const savedCompletedLessons = getCompletedLessons();

    setCompletedLessons(savedCompletedLessons);

    const belongsToThisCourse = foundCourse.lessonList.some(
      (lesson) => lesson.slug === savedCurrentLesson
    );

    if (belongsToThisCourse && savedCurrentLesson) {
      setCurrentLesson(savedCurrentLesson);
    } else {
      setCurrentLesson(foundCourse.lessonList[0]?.slug ?? null);
    }

    async function loadEnrollment() {
      try {
        const response = await fetch("/api/enrollments", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load enrollments");
        }

        const data = await response.json();
        const enrolledCourses: string[] = data.enrolledCourses ?? [];

        if (foundCourse) {
          setIsEnrolled(enrolledCourses.includes(foundCourse.slug));
        }
      } catch (error) {
        console.error("Failed to load enrollments:", error);
      } finally {
        setIsLoadingEnrollment(false);
      }
    }

    loadEnrollment();
  }, [foundCourse]);

  if (!slug || !foundCourse) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Course Not Found
          </h1>
          <p className="mt-4 text-slate-600">
            The course you are looking for does not exist.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
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
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {foundCourse.level}
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {foundCourse.title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {foundCourse.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {foundCourse.lessons} lessons
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Self-paced
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              LMS Course
            </span>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-slate-700">
              Course Progress
            </p>

            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-slate-600">
              {completedLessonsInCourse} / {totalLessons} lessons completed
            </p>
          </div>
        </div>

        <aside className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900">
            Course Access
          </h2>

          <p className="mt-4 text-slate-600">
            Enroll in this course and start learning step by step through
            structured lessons.
          </p>

          {isLoadingEnrollment ? (
            <div className="mt-6 rounded-xl bg-slate-100 px-5 py-3 text-center text-sm font-medium text-slate-500">
              Checking enrollment...
            </div>
          ) : !isEnrolled ? (
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEnrolling ? "Enrolling..." : "Enroll in Course"}
            </button>
          ) : (
            <>
              <div className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200">
                Enrolled ✓ You have access to this course
              </div>

              {currentLesson && (
                <Link
                  href={`/lesson/${currentLesson}`}
                  className="mt-4 block w-full rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-700"
                >
                  Continue Learning
                </Link>
              )}
            </>
          )}

          <Link
            href="/dashboard"
            className="mt-4 block w-full rounded-xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Go to Dashboard
          </Link>
        </aside>
      </section>

      <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">
          Course Lessons
        </h2>
        <p className="mt-2 text-slate-600">
          Follow the lessons in order and build your knowledge progressively.
        </p>

        <ul className="mt-8 space-y-4">
          {foundCourse.lessonList.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.slug);

            const isUnlocked =
              index === 0 ||
              completedLessons.includes(foundCourse.lessonList[index - 1].slug);

            return (
              <li
                key={lesson.slug}
                className={`rounded-2xl border px-5 py-4 transition ${
                  isUnlocked
                    ? "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    : "border-slate-200 bg-slate-100 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        isCompleted
                          ? "bg-green-100 text-green-700"
                          : isUnlocked
                          ? "bg-white text-slate-600 ring-1 ring-slate-200"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? "✓" : isUnlocked ? index + 1 : "🔒"}
                    </span>

                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Lesson {index + 1}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {lesson.title}
                      </h3>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <Link
                      href={`/lesson/${lesson.slug}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
                    >
                      Open Lesson
                    </Link>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500">
                      Locked
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}