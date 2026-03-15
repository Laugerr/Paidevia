"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { courses } from "@/lib/courses";

export default function DashboardContent() {
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

        if (!enrollmentResponse.ok) {
          throw new Error("Failed to load enrollments");
        }

        if (!progressResponse.ok) {
          throw new Error("Failed to load progress");
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
    return enrolledCourseObjects.reduce((total, course) => {
      return total + course.lessonList.length;
    }, 0);
  }, [enrolledCourseObjects]);

  const completedLessonsInEnrolledCourses = useMemo(() => {
    const enrolledLessonSlugs = enrolledCourseObjects.flatMap((course) =>
      course.lessonList.map((lesson) => lesson.slug)
    );

    return completedLessons.filter((lessonSlug) =>
      enrolledLessonSlugs.includes(lessonSlug)
    ).length;
  }, [completedLessons, enrolledCourseObjects]);

  const completedCourses = useMemo(() => {
    return enrolledCourseObjects.filter((course) =>
      course.lessonList.every((lesson) => completedLessons.includes(lesson.slug))
    );
  }, [enrolledCourseObjects, completedLessons]);

  const progressPercentage =
    totalLessonsInEnrolledCourses > 0
      ? Math.round(
          (completedLessonsInEnrolledCourses / totalLessonsInEnrolledCourses) *
            100
        )
      : 0;

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-slate-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Student Area
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          Track your enrolled courses and learning progress.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Enrolled Courses
          </h2>
          <p className="mt-3 text-3xl font-bold text-blue-600">
            {enrolledCourses.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Completed Lessons
          </h2>
          <p className="mt-3 text-3xl font-bold text-blue-600">
            {completedLessonsInEnrolledCourses}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Completed Courses
          </h2>
          <p className="mt-3 text-3xl font-bold text-green-600">
            {completedCourses.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Progress</h2>
          <p className="mt-3 text-3xl font-bold text-blue-600">
            {progressPercentage}%
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          Continue Learning
        </h2>

        {currentLesson ? (
          <Link
            href={`/lesson/${currentLesson}`}
            className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Resume Lesson
          </Link>
        ) : (
          <p className="mt-4 text-slate-600">
            You completed all available lessons. Great job 🎉
          </p>
        )}
      </section>

      <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          Enrolled Courses
        </h2>

        {enrolledCourseObjects.length === 0 ? (
          <p className="mt-4 text-slate-600">
            You are not enrolled in any courses yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {enrolledCourseObjects.map((course) => {
              const courseCompletedCount = course.lessonList.filter((lesson) =>
                completedLessons.includes(lesson.slug)
              ).length;

              const courseProgress = Math.round(
                (courseCompletedCount / course.lessonList.length) * 100
              );

              const isCourseCompleted =
                courseCompletedCount === course.lessonList.length;

              return (
                <li
                  key={course.slug}
                  className="rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {course.title}
                        </h3>

                        {isCourseCompleted && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Completed ✅
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-600">
                        {courseCompletedCount} / {course.lessonList.length} lessons completed
                      </p>
                    </div>

                    <Link
                      href={`/courses/${course.slug}`}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                    >
                      View Course
                    </Link>
                  </div>

                  <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${courseProgress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-sm font-medium text-blue-600">
                    {courseProgress}% complete
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          Completed Courses
        </h2>

        {completedCourses.length === 0 ? (
          <p className="mt-4 text-slate-600">
            You have not completed any courses yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {completedCourses.map((course) => (
              <li
                key={course.slug}
                className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200"
              >
                {course.title} — Course Completed ✅
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          Completed Lessons
        </h2>

        {completedLessonsInEnrolledCourses === 0 ? (
          <p className="mt-4 text-slate-600">
            You have not completed any lessons yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {completedLessons
              .filter((lessonSlug) =>
                enrolledCourseObjects
                  .flatMap((course) =>
                    course.lessonList.map((lesson) => lesson.slug)
                  )
                  .includes(lessonSlug)
              )
              .map((lesson) => (
                <li
                  key={lesson}
                  className="rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
                >
                  {lesson.replaceAll("-", " ")}
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}