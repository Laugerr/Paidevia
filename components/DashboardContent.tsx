"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCompletedLessons, getCurrentLesson } from "@/lib/progress";
import { getEnrolledCourses } from "@/lib/enrollment";
import { courses } from "@/lib/courses";

export default function DashboardContent() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [currentLesson, setCurrentLessonState] = useState<string | null>(null);

  useEffect(() => {
    setCompletedLessons(getCompletedLessons());
    setEnrolledCourses(getEnrolledCourses());
    setCurrentLessonState(getCurrentLesson());
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

  const progressPercentage =
    totalLessonsInEnrolledCourses > 0
      ? Math.round(
          (completedLessonsInEnrolledCourses / totalLessonsInEnrolledCourses) *
            100
        )
      : 0;

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

      <section className="grid gap-6 md:grid-cols-3">
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
            Start a course to begin learning.
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

              return (
                <li
                  key={course.slug}
                  className="rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {courseCompletedCount} / {course.lessonList.length}{" "}
                        lessons completed
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