"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const lessonArt = [
  "from-sky-500 via-blue-400 to-cyan-100",
  "from-emerald-500 via-teal-400 to-lime-100",
  "from-orange-500 via-rose-400 to-amber-100",
];

type LessonPlayerLesson = {
  title: string;
  slug: string;
};

type LessonPlayerClientProps = {
  course: {
    id: string;
    slug: string;
    title: string;
    lessonList: LessonPlayerLesson[];
  };
  lesson: {
    title: string;
    slug: string;
    summary: string | null;
  };
};

function getArtIndex(seed: string) {
  return seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export default function LessonPlayerClient({
  course: foundCourse,
  lesson: foundLesson,
}: LessonPlayerClientProps) {
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    setJustCompleted(false);

    async function loadProgress() {
      try {
        const response = await fetch("/api/progress");

        if (!response.ok) {
          throw new Error("Failed to load progress");
        }

        const data = await response.json();
        setCompletedLessons(data.completedLessons ?? []);
      } catch (error) {
        console.error("Failed to load progress:", error);
      }
    }

    loadProgress();
  }, [foundLesson.slug]);

  const currentLessonIndex = foundCourse.lessonList.findIndex(
    (lesson) => lesson.slug === foundLesson.slug
  );

  const totalLessons = foundCourse.lessonList.length;
  const completedLessonsInCourse = foundCourse.lessonList.filter((lesson) =>
    completedLessons.includes(lesson.slug)
  ).length;
  const isCurrentLessonCompleted = completedLessons.includes(foundLesson.slug);
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
      setProgressError(null);

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

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setProgressError(data?.error ?? "Failed to mark lesson completed");
        return;
      }

      const progressResponse = await fetch("/api/progress");

      if (!progressResponse.ok) {
        throw new Error("Failed to refresh lesson progress");
      }

      const progressData = await progressResponse.json();

      setCompletedLessons(progressData.completedLessons ?? []);
      setJustCompleted(true);
    } catch (error) {
      console.error("Failed to mark lesson completed:", error);
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  const artIndex = getArtIndex(foundCourse.id);

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.76),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.8),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-200/25 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_340px] xl:items-center">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                Lesson Player
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {foundLesson.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {foundLesson.summary?.trim()
                  ? foundLesson.summary
                  : "Continue learning inside a cleaner lesson workspace built around focus, progress visibility, and smooth movement through the course roadmap."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80">
                  {foundCourse.title}
                </span>
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80">
                  Lesson {currentLessonIndex + 1} of {foundCourse.lessonList.length}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "relative h-64 overflow-hidden rounded-[32px] bg-gradient-to-br shadow-[0_18px_48px_rgba(15,23,42,0.08)]",
                lessonArt[artIndex % lessonArt.length]
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.44),transparent_22%),radial-gradient(circle_at_82%_78%,rgba(255,255,255,0.22),transparent_22%)]" />
              <div className="absolute left-5 top-5 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                Current Lesson
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

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="order-1 h-fit space-y-6 xl:sticky xl:top-28">
            <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_#0f1f3d_0%,_#081428_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Lesson Roadmap
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Follow the course flow
              </h2>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-200">
                  Course Progress
                </p>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-300">
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
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-bold",
                          isActive && "bg-white/20 text-white",
                          !isActive &&
                            isCompleted &&
                            "bg-emerald-400 text-emerald-950",
                          !isActive &&
                            !isCompleted &&
                            isUnlocked &&
                            "bg-white text-slate-700",
                          !isUnlocked && "bg-white/10 text-slate-400"
                        )}
                      >
                        {isCompleted ? "OK" : isUnlocked ? index + 1 : "..."}
                      </span>

                      <span className="min-w-0 font-medium">{lesson.title}</span>
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
                      className={cn(
                        "flex items-center gap-3 rounded-[22px] px-4 py-4 text-sm transition duration-200",
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                          : "bg-white/8 text-slate-100 hover:bg-white/12"
                      )}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={`/courses/${foundCourse.slug}`}
                className="mt-6 block w-full rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition duration-200 hover:bg-white/8"
              >
                Back to Course
              </Link>
            </section>
          </aside>

          <section className="order-2 flex flex-col gap-6">
            <section className="order-2 rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Lesson Player
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Key learning space
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_300px]">
                <div className="space-y-5">
                  <div className="rounded-[26px] bg-slate-50/80 px-5 py-5 ring-1 ring-slate-200/70">
                    <p className="text-sm leading-7 text-slate-600">
                      {foundLesson.summary?.trim()
                        ? foundLesson.summary
                        : "This is where lesson text, instructor notes, downloadable files, and follow-up exercises can live later. Right now, the layout is built to feel production-ready, with enough structure for richer course content to slot in cleanly."}
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-emerald-100 bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ffffff_100%)] p-5 shadow-[0_16px_36px_rgba(16,185,129,0.08)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
                          Lesson Action
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Mark this step as completed to update your progress and
                          unlock the next lesson in the roadmap.
                        </p>
                      </div>

                      {isCurrentLessonCompleted ? (
                        <div className="inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-100 px-6 py-4 text-sm font-semibold text-emerald-900 shadow-[0_18px_40px_rgba(34,197,94,0.18)] lg:w-[260px]">
                          <Icon className="h-4 w-4">
                            <path d="M20 6 9 17l-5-5" />
                          </Icon>
                          Lesson Completed
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleMarkCompleted}
                          disabled={isMarkingCompleted}
                          className="inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-100 px-6 py-4 text-sm font-semibold text-emerald-900 shadow-[0_18px_40px_rgba(34,197,94,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 lg:w-[260px]"
                        >
                          <Icon className="h-4 w-4">
                            <path d="M20 6 9 17l-5-5" />
                          </Icon>
                          {isMarkingCompleted
                            ? "Saving..."
                            : "Mark Lesson as Completed"}
                        </button>
                      )}
                    </div>
                  </div>

                  {justCompleted ? (
                    <div className="rounded-[26px] bg-emerald-50 p-5 ring-1 ring-emerald-200">
                      <p className="font-semibold text-emerald-700">
                        Lesson completed successfully.
                      </p>

                      {nextLesson ? (
                        <Link
                          href={`/lesson/${nextLesson.slug}`}
                          className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                        >
                          Go to Next Lesson
                        </Link>
                      ) : (
                        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-emerald-200">
                          Course completed. You reached the final lesson.
                        </div>
                      )}
                    </div>
                  ) : null}

                  {progressError ? (
                    <div className="rounded-[26px] border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
                      {progressError}
                    </div>
                  ) : null}
                </div>

                <aside className="space-y-4">
                  <div className="rounded-[26px] bg-slate-50/80 p-5 ring-1 ring-slate-200/70">
                    <p className="text-sm font-medium text-slate-500">
                      Current lesson
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      {currentLessonIndex + 1}
                    </p>
                  </div>
                  <div className="rounded-[26px] bg-slate-50/80 p-5 ring-1 ring-slate-200/70">
                    <p className="text-sm font-medium text-slate-500">
                      Completed
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      {completedLessonsInCourse} lessons
                    </p>
                  </div>
                  <div className="rounded-[26px] bg-slate-50/80 p-5 ring-1 ring-slate-200/70">
                    <p className="text-sm font-medium text-slate-500">Next step</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {nextLesson ? nextLesson.title : "You are on the final step"}
                    </p>
                  </div>
                </aside>
              </div>
            </section>

            <section className="order-1 rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
              <div className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.35),_transparent_30%),linear-gradient(135deg,_#eff6ff_0%,_#ffffff_55%,_#f8fafc_100%)] p-8 sm:p-10">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Lesson Media
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    Learning media area
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Embedded video, interactive content, or richer lesson media
                    can live here later. For now, this acts as the structured
                    player frame for the lesson flow.
                  </p>

                  <div className="mt-8 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                      <Icon className="h-8 w-8">
                        <path
                          d="M8 6.5v11l9-5.5z"
                          fill="currentColor"
                          stroke="none"
                        />
                      </Icon>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="order-3 grid gap-4 sm:grid-cols-2">
              {previousLesson ? (
                <Link
                  href={`/lesson/${previousLesson.slug}`}
                  className="group rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Previous Lesson
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                        {previousLesson.title}
                      </h3>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition duration-200 group-hover:-translate-x-0.5 group-hover:bg-slate-200">
                      <Icon className="h-5 w-5">
                        <path d="m15 18-6-6 6-6" />
                      </Icon>
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-blue-600">
                    Go back
                  </p>
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
                  className="group rounded-[28px] border border-blue-200 bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_52%,_#f0f9ff_100%)] p-6 text-right shadow-[0_18px_52px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition duration-200 group-hover:translate-x-0.5">
                      <Icon className="h-5 w-5">
                        <path d="m9 6 6 6-6 6" />
                      </Icon>
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Next Lesson
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                        {nextLesson.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-blue-600 transition group-hover:translate-x-0.5">
                    Continue forward
                  </p>
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
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}
