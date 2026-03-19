"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { courses } from "@/lib/courses";

export default function LessonPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

  const foundCourse = courses.find((course) =>
    course.lessonList.some((lesson) => lesson.slug === slug)
  );

  const foundLesson = foundCourse?.lessonList.find(
    (lesson) => lesson.slug === slug
  );

  useEffect(() => {
    setJustCompleted(false);

    async function loadProgress() {
      try {
        const response = await fetch("/api/progress");
        const data = await response.json();
        setCompletedLessons(data.completedLessons ?? []);
      } catch (error) {
        console.error("Failed to load progress:", error);
      }
    }

    loadProgress();
  }, [foundLesson?.slug]);

  if (!foundCourse || !foundLesson) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="rounded-[32px] border border-white/70 bg-white/90 p-8">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Lesson Not Found
            </h1>
            <p className="mt-4 text-slate-600">
              The lesson you are looking for does not exist.
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

  const handleMarkCompleted = async () => {
    try {
      setIsMarkingCompleted(true);

      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSlug: foundCourse.slug,
          lessonSlug: foundLesson.slug,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark lesson completed");
      }

      const progressResponse = await fetch("/api/progress");
      const progressData = await progressResponse.json();

      setCompletedLessons(progressData.completedLessons ?? []);
      setJustCompleted(true);
    } catch (error) {
      console.error("Failed to mark lesson completed:", error);
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[30px] border border-white/70 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_26%),linear-gradient(180deg,_#10213f_0%,_#081428_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] xl:sticky xl:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Lesson Player
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              {foundCourse.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Follow the lesson sequence and keep your progress moving inside a
              more polished player experience.
            </p>

            <div className="mt-6 rounded-[24px] bg-white/8 px-4 py-4 ring-1 ring-white/10">
              <p className="text-sm font-medium text-slate-200">
                Lesson {currentLessonIndex + 1} of {foundCourse.lessonList.length}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-300">
                Current step
              </p>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-slate-200">Course Progress</p>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-300">
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
                      className={`flex h-8 w-8 items-center justify-center rounded-2xl text-xs font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : isCompleted
                          ? "bg-emerald-400 text-emerald-950"
                          : isUnlocked
                          ? "bg-white text-slate-700"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {isCompleted ? "OK" : isUnlocked ? index + 1 : "..."}
                    </span>

                    <span className="font-medium">{lesson.title}</span>
                  </>
                );

                if (!isUnlocked) {
                  return (
                    <div
                      key={lesson.slug}
                      className="flex items-center gap-3 rounded-[22px] bg-white/6 px-4 py-4 text-sm text-slate-400"
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={lesson.slug}
                    href={`/lesson/${lesson.slug}`}
                    className={`flex items-center gap-3 rounded-[22px] px-4 py-4 text-sm transition ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                        : "bg-white/8 text-slate-100 hover:bg-white/12"
                    }`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            <Link
              href={`/courses/${foundCourse.slug}`}
              className="mt-6 block w-full rounded-2xl border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/8"
            >
              Back to Course
            </Link>
          </aside>

          <section className="space-y-6">
            <div className="relative overflow-hidden rounded-[32px] border border-cyan-100 bg-[radial-gradient(circle_at_left,_rgba(125,211,252,0.3),_transparent_26%),linear-gradient(135deg,_#f3fbff_0%,_#ffffff_58%,_#eef6ff_100%)] p-8">
              <div className="absolute -left-4 top-7 h-24 w-24 rounded-full border-[10px] border-cyan-200/40" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                  {foundCourse.title}
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {foundLesson.title}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Learn through a more immersive player layout designed to feel
                  closer to a real LMS lesson experience while keeping your
                  existing progress tracking intact.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="rounded-[28px] border border-cyan-100 bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.35),_transparent_30%),linear-gradient(135deg,_#0b1730_0%,_#17396a_100%)] p-10 text-white">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Lesson Media
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                    Video player area
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-slate-200">
                    Embedded media, interactive content, or live lesson visuals
                    can live here later. For now, this panel acts as the premium
                    player frame for the lesson flow.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                    Lesson Notes
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Key learning space
                  </h2>
                </div>

                <div className="rounded-[24px] bg-slate-50 px-5 py-4 ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Progress</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                    {progressPercentage}%
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
                <div className="space-y-5">
                  <div className="rounded-[26px] bg-slate-50 px-5 py-5 ring-1 ring-slate-200">
                    <p className="text-sm leading-7 text-slate-600">
                      This is where lesson text, instructor notes, downloadable
                      files, and follow-up exercises can live later. Right now,
                      the layout is built to feel production-ready, with enough
                      structure for richer course content to slot in cleanly.
                    </p>
                  </div>

                  <button
                    onClick={handleMarkCompleted}
                    disabled={isMarkingCompleted}
                    className="rounded-2xl bg-[linear-gradient(135deg,_#16a34a_0%,_#10b981_100%)] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isMarkingCompleted ? "Saving..." : "Mark Lesson as Completed"}
                  </button>

                  {justCompleted && (
                    <div className="rounded-[26px] bg-emerald-50 p-5 ring-1 ring-emerald-200">
                      <p className="font-semibold text-emerald-700">
                        Lesson completed successfully.
                      </p>

                      {nextLesson ? (
                        <Link
                          href={`/lesson/${nextLesson.slug}`}
                          className="mt-4 inline-flex rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0ea5e9_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                        >
                          Go to Next Lesson
                        </Link>
                      ) : (
                        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-emerald-200">
                          Course completed. You reached the final lesson.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="rounded-[26px] border border-white/70 bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-500">Current lesson</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      {currentLessonIndex + 1}
                    </p>
                  </div>
                  <div className="rounded-[26px] border border-white/70 bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-500">Completed</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      {completedLessonsInCourse} lessons
                    </p>
                  </div>
                  <div className="rounded-[26px] border border-white/70 bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-500">Next step</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {nextLesson ? nextLesson.title : "You are on the final step"}
                    </p>
                  </div>
                </aside>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {previousLesson ? (
                <Link
                  href={`/lesson/${previousLesson.slug}`}
                  className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Previous Lesson
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {previousLesson.title}
                  </h3>
                </Link>
              ) : (
                <div className="rounded-[28px] border border-slate-200 bg-slate-100/80 p-6 text-slate-400">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Previous Lesson
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    This is the first lesson
                  </h3>
                </div>
              )}

              {nextLesson ? (
                <Link
                  href={`/lesson/${nextLesson.slug}`}
                  className="rounded-[28px] border border-white/70 bg-white/90 p-6 text-right shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Next Lesson
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {nextLesson.title}
                  </h3>
                </Link>
              ) : (
                <div className="rounded-[28px] border border-slate-200 bg-slate-100/80 p-6 text-right text-slate-400">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Next Lesson
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    You reached the last lesson
                  </h3>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
