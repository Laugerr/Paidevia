"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { courses } from "@/lib/courses";
import {
  getCompletedLessons,
  markLessonCompleted,
  setCurrentLesson,
} from "@/lib/progress";

export default function LessonPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [justCompleted, setJustCompleted] = useState(false);

  const foundCourse = courses.find((course) =>
    course.lessonList.some((lesson) => lesson.slug === slug)
  );

  const foundLesson = foundCourse?.lessonList.find(
    (lesson) => lesson.slug === slug
  );

  useEffect(() => {
    setCompletedLessons(getCompletedLessons());
    setJustCompleted(false);

    if (foundLesson) {
      setCurrentLesson(foundLesson.slug);
    }
  }, [foundLesson]);

  if (!foundCourse || !foundLesson) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Lesson Not Found
          </h1>
          <p className="mt-4 text-slate-600">
            The lesson you are looking for does not exist.
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

  const currentLessonIndex = foundCourse.lessonList.findIndex(
    (lesson) => lesson.slug === foundLesson.slug
  );

  const totalLessons = foundCourse.lessonList.length;

  const completedLessonsInCourse = foundCourse.lessonList.filter((lesson) =>
    completedLessons.includes(lesson.slug)
  ).length;

  const progressPercentage = Math.round(
    (completedLessonsInCourse / totalLessons) * 100
  );

  const previousLesson =
    currentLessonIndex > 0
      ? foundCourse.lessonList[currentLessonIndex - 1]
      : null;

  const nextLesson =
    currentLessonIndex < foundCourse.lessonList.length - 1
      ? foundCourse.lessonList[currentLessonIndex + 1]
      : null;

  const handleMarkCompleted = () => {
    markLessonCompleted(foundLesson.slug);
    setCompletedLessons(getCompletedLessons());
    setJustCompleted(true);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Course Player
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {foundCourse.title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Follow the lessons in order and continue learning step by step.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-700">
              Lesson {currentLessonIndex + 1} of {foundCourse.lessonList.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Current lesson in this course
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">
              Course Progress
            </p>

            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {completedLessonsInCourse} / {totalLessons} lessons completed
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {foundCourse.lessonList.map((lesson, index) => {
              const isActive = lesson.slug === foundLesson.slug;
              const isCompleted = completedLessons.includes(lesson.slug);

              const isUnlocked =
                index === 0 ||
                completedLessons.includes(foundCourse.lessonList[index - 1].slug);

              const content = (
                <>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isCompleted
                        ? "bg-green-100 text-green-700"
                        : isUnlocked
                        ? "bg-white text-slate-600 ring-1 ring-slate-200"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isCompleted ? "✓" : isUnlocked ? index + 1 : "🔒"}
                  </span>

                  <span className="font-medium">{lesson.title}</span>
                </>
              );

              if (!isUnlocked) {
                return (
                  <div
                    key={lesson.slug}
                    className="flex items-center gap-3 rounded-2xl px-4 py-4 text-sm bg-slate-100 text-slate-400"
                  >
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={lesson.slug}
                  href={`/lesson/${lesson.slug}`}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-sm transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {content}
                </Link>
              );
            })}
          </div>

          <Link
            href={`/courses/${foundCourse.slug}`}
            className="mt-6 block w-full rounded-xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Back to Course
          </Link>
        </aside>

        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              {foundCourse.title}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              {foundLesson.title}
            </h1>

            <p className="mt-4 max-w-3xl text-slate-600">
              Learn through structured lessons inside the Paidevia course player.
              This layout is designed to feel more like a real LMS experience.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
              <p className="text-xl font-semibold text-slate-800">
                Lesson Video Area
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Embedded video player or lesson media will go here later.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900">
              Lesson Notes
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              This section can later include full lesson text, practical
              exercises, downloadable files, references, and quizzes. For now,
              it acts as the content area of the course player.
            </p>

            <button
              onClick={handleMarkCompleted}
              className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
            >
              Mark Lesson as Completed
            </button>

            {justCompleted && (
              <div className="mt-6 rounded-2xl bg-green-50 p-4 ring-1 ring-green-200">
                <p className="font-medium text-green-700">
                  Lesson completed successfully ✓
                </p>

                {nextLesson ? (
                  <Link
                    href={`/lesson/${nextLesson.slug}`}
                    className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                  >
                    Go to Next Lesson
                  </Link>
                ) : (
                  <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                    Course completed 🎉 You reached the final lesson.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {previousLesson ? (
              <Link
                href={`/lesson/${previousLesson.slug}`}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <p className="text-sm font-medium text-slate-500">
                  Previous Lesson
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {previousLesson.title}
                </h3>
              </Link>
            ) : (
              <div className="rounded-2xl bg-slate-100 p-5 text-slate-400 ring-1 ring-slate-200">
                <p className="text-sm font-medium">Previous Lesson</p>
                <h3 className="mt-2 text-lg font-semibold">
                  This is the first lesson
                </h3>
              </div>
            )}

            {nextLesson ? (
              <Link
                href={`/lesson/${nextLesson.slug}`}
                className="rounded-2xl bg-white p-5 text-right shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <p className="text-sm font-medium text-slate-500">
                  Next Lesson
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {nextLesson.title}
                </h3>
              </Link>
            ) : (
              <div className="rounded-2xl bg-slate-100 p-5 text-right text-slate-400 ring-1 ring-slate-200">
                <p className="text-sm font-medium">Next Lesson</p>
                <h3 className="mt-2 text-lg font-semibold">
                  You reached the last lesson
                </h3>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}