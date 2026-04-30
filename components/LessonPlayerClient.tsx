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
  "from-blue-900 via-sky-800 to-indigo-900",
  "from-emerald-900 via-teal-800 to-cyan-900",
  "from-orange-900 via-rose-800 to-red-900",
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
  const courseIsCompleted =
    totalLessons > 0 && completedLessonsInCourse >= totalLessons;

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
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-[#209cee]/6 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#a78bfa]/6 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#209cee]/40 to-transparent" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px] xl:items-center">
            <div className="max-w-3xl">
              <p className="font-pixel text-[9px] text-[#209cee]">Lesson Player</p>
              <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl lg:text-4xl">
                {foundLesson.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#8b949e] sm:text-base">
                {foundLesson.summary?.trim()
                  ? foundLesson.summary
                  : "Continue learning inside a cleaner lesson workspace built around focus, progress visibility, and smooth movement through the course roadmap."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#8b949e]">
                  {foundCourse.title}
                </span>
                <span className="rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#8b949e]">
                  Lesson {currentLessonIndex + 1} of {foundCourse.lessonList.length}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "relative h-56 overflow-hidden rounded-2xl bg-gradient-to-br shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                lessonArt[artIndex % lessonArt.length]
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.06),transparent_22%)]" />
              <div className="absolute left-4 top-4">
                <span className="inline-flex rounded-lg bg-[rgba(32,156,238,0.2)] px-3 py-1 font-pixel text-[8px] text-[#209cee]">
                  Current Lesson
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                <p className="font-pixel text-[8px] text-[#8b949e]">Course progress</p>
                <p className="mt-2 text-3xl font-bold text-[#e6edf3]">
                  {progressPercentage}%
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#209cee] to-[#92cc41] transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">

          {/* Sidebar roadmap */}
          <aside className="order-1 h-fit space-y-5 xl:sticky xl:top-28">
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <p className="font-pixel text-[9px] text-[#209cee]">Lesson Roadmap</p>
              <h2 className="font-heading mt-2 text-lg font-semibold text-[#e6edf3]">
                Follow the course flow
              </h2>

              <div className="mt-4">
                <p className="text-xs font-medium text-[#8b949e]">Course Progress</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#2d333b]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#209cee] to-[#92cc41] transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#6e7681]">
                  {completedLessonsInCourse} / {totalLessons} lessons completed
                </p>
              </div>

              <div className="mt-5 space-y-2">
                {foundCourse.lessonList.map((lesson, index) => {
                  const isActive = lesson.slug === foundLesson.slug;
                  const isCompleted = completedLessons.includes(lesson.slug);
                  const isUnlocked =
                    index === 0 ||
                    completedLessons.includes(foundCourse.lessonList[index - 1].slug);

                  const badgeClass = cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-pixel text-[8px]",
                    isActive && "bg-[#209cee] text-white",
                    !isActive && isCompleted && "bg-[rgba(146,204,65,0.2)] text-[#92cc41]",
                    !isActive && !isCompleted && isUnlocked && "bg-[#2d333b] text-[#8b949e]",
                    !isUnlocked && "bg-[#21262d] text-[#6e7681]"
                  );

                  const content = (
                    <>
                      <span className={badgeClass}>
                        {isCompleted ? "✓" : isUnlocked ? index + 1 : "·"}
                      </span>
                      <span className="min-w-0 truncate text-sm font-medium">{lesson.title}</span>
                    </>
                  );

                  if (!isUnlocked) {
                    return (
                      <div
                        key={lesson.slug}
                        className="flex items-center gap-3 rounded-xl border border-[#30363d] bg-[#21262d] px-3 py-3 text-[#6e7681]"
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
                        "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition duration-200",
                        isActive
                          ? "border-[#209cee]/30 bg-[rgba(32,156,238,0.1)] text-[#e6edf3] shadow-[0_2px_8px_rgba(32,156,238,0.15)]"
                          : "border-[#30363d] bg-[#21262d] text-[#8b949e] hover:border-[#3d444d] hover:text-[#e6edf3]"
                      )}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={`/courses/${foundCourse.slug}`}
                className="mt-5 block w-full rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-3 text-center text-sm font-semibold text-[#8b949e] transition duration-200 hover:border-[#3d444d] hover:text-[#e6edf3]"
              >
                Back to Course
              </Link>
            </section>
          </aside>

          {/* Main content */}
          <section className="order-2 flex flex-col gap-5">

            {/* Media area */}
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#21262d] p-8 sm:p-10">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="font-pixel text-[9px] text-[#209cee]">Lesson Media</p>
                  <h2 className="font-heading mt-3 text-xl font-bold text-[#e6edf3]">
                    Learning media area
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#8b949e]">
                    Embedded video, interactive content, or richer lesson media
                    can live here later. For now, this acts as the structured
                    player frame for the lesson flow.
                  </p>

                  <div className="mt-7 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#209cee] text-white shadow-[0_4px_16px_rgba(32,156,238,0.3)]">
                      <Icon className="h-7 w-7">
                        <path d="M8 6.5v11l9-5.5z" fill="currentColor" stroke="none" />
                      </Icon>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Lesson content + actions */}
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-pixel text-[9px] text-[#209cee]">Lesson Player</p>
                  <h2 className="font-heading mt-2 text-xl font-bold text-[#e6edf3]">
                    Key learning space
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_280px]">
                <div className="space-y-4">
                  {/* Lesson text */}
                  <div className="rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-5">
                    <p className="text-sm leading-7 text-[#8b949e]">
                      {foundLesson.summary?.trim()
                        ? foundLesson.summary
                        : "This is where lesson text, instructor notes, downloadable files, and follow-up exercises can live later. Right now, the layout is built to feel production-ready, with enough structure for richer course content to slot in cleanly."}
                    </p>
                  </div>

                  {/* Mark complete action */}
                  <div className="rounded-xl border border-[#92cc41]/20 bg-[rgba(146,204,65,0.06)] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-pixel text-[8px] text-[#92cc41]">Lesson Action</p>
                        <p className="mt-2 text-sm text-[#8b949e]">
                          Mark this step as completed to update your progress and
                          unlock the next lesson in the roadmap.
                        </p>
                      </div>

                      {isCurrentLessonCompleted ? (
                        <div className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-[#92cc41]/30 bg-[rgba(146,204,65,0.12)] px-5 py-3 text-sm font-semibold text-[#92cc41] lg:w-[240px]">
                          <Icon className="h-4 w-4">
                            <path d="M20 6 9 17l-5-5" />
                          </Icon>
                          Lesson Complete
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleMarkCompleted}
                          disabled={isMarkingCompleted}
                          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-[#92cc41]/30 bg-[rgba(146,204,65,0.12)] px-5 py-3 text-sm font-semibold text-[#92cc41] transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(146,204,65,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#92cc41]/30 disabled:cursor-not-allowed disabled:opacity-60 lg:w-[240px]"
                        >
                          <Icon className="h-4 w-4">
                            <path d="M20 6 9 17l-5-5" />
                          </Icon>
                          {isMarkingCompleted ? "Saving..." : "Mark Lesson as Completed"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Just completed banner */}
                  {justCompleted ? (
                    <div className="rounded-xl border border-[#92cc41]/20 bg-[rgba(146,204,65,0.08)] p-5">
                      <p className="font-semibold text-[#92cc41]">
                        Great work. This lesson has been added to your completed progress.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#8b949e]">
                        {nextLesson
                          ? "Your roadmap has been updated and the next lesson is now ready."
                          : "You've completed the final lesson in this course."}
                      </p>

                      {nextLesson ? (
                        <Link
                          href={`/lesson/${nextLesson.slug}`}
                          className="mt-4 inline-flex rounded-xl bg-[#209cee] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(32,156,238,0.3)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#1786c9]"
                        >
                          Continue to Next Lesson
                        </Link>
                      ) : (
                        <div className="mt-4 rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-3 text-sm font-medium text-[#8b949e]">
                          Course complete. You reached the end of this learning path.
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Error */}
                  {progressError ? (
                    <div className="rounded-xl border border-[#e76e55]/20 bg-[rgba(231,110,85,0.08)] p-5 text-sm font-medium text-[#e76e55]">
                      {progressError}
                    </div>
                  ) : null}
                </div>

                {/* Stats sidebar */}
                <aside className="space-y-3">
                  <div className="rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-4">
                    <p className="font-pixel text-[8px] text-[#6e7681]">Current lesson</p>
                    <p className="mt-2 text-2xl font-bold text-[#e6edf3]">
                      {currentLessonIndex + 1}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-4">
                    <p className="font-pixel text-[8px] text-[#6e7681]">Completed</p>
                    <p className="mt-2 text-2xl font-bold text-[#e6edf3]">
                      {completedLessonsInCourse} lessons
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-4">
                    <p className="font-pixel text-[8px] text-[#6e7681]">Next step</p>
                    <p className="mt-2 text-sm font-semibold text-[#e6edf3]">
                      {nextLesson
                        ? nextLesson.title
                        : courseIsCompleted
                        ? "Course completed"
                        : "You are on the final step"}
                    </p>
                  </div>
                </aside>
              </div>
            </section>

            {/* Prev / Next navigation */}
            <section className="grid gap-3 sm:grid-cols-2">
              {previousLesson ? (
                <Link
                  href={`/lesson/${previousLesson.slug}`}
                  className="group rounded-xl border border-[#30363d] bg-[#21262d] p-5 transition duration-200 hover:border-[#3d444d] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-pixel text-[8px] text-[#6e7681]">Previous Lesson</p>
                      <h3 className="font-heading mt-3 text-lg font-semibold text-[#e6edf3]">
                        {previousLesson.title}
                      </h3>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#30363d] bg-[#2d333b] text-[#8b949e] transition duration-200 group-hover:-translate-x-0.5 group-hover:text-[#e6edf3]">
                      <Icon className="h-4 w-4">
                        <path d="m15 18-6-6 6-6" />
                      </Icon>
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#8b949e] transition group-hover:text-[#209cee]">
                    Go back
                  </p>
                </Link>
              ) : (
                <div className="rounded-xl border border-[#30363d] bg-[#21262d]/50 p-5 text-[#6e7681]">
                  <p className="font-pixel text-[8px]">Previous Lesson</p>
                  <h3 className="font-heading mt-3 text-lg font-semibold">
                    This is the first lesson
                  </h3>
                </div>
              )}

              {nextLesson ? (
                <Link
                  href={`/lesson/${nextLesson.slug}`}
                  className="group rounded-xl border border-[#209cee]/20 bg-[rgba(32,156,238,0.06)] p-5 text-right transition duration-200 hover:border-[#209cee]/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(32,156,238,0.15)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#209cee] text-white shadow-[0_2px_8px_rgba(32,156,238,0.3)] transition duration-200 group-hover:translate-x-0.5">
                      <Icon className="h-4 w-4">
                        <path d="m9 6 6 6-6 6" />
                      </Icon>
                    </span>
                    <div>
                      <p className="font-pixel text-[8px] text-[#6e7681]">Next Lesson</p>
                      <h3 className="font-heading mt-3 text-lg font-semibold text-[#e6edf3]">
                        {nextLesson.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#209cee] transition group-hover:translate-x-0.5">
                    Continue forward
                  </p>
                </Link>
              ) : (
                <div className="rounded-xl border border-[#30363d] bg-[#21262d]/50 p-5 text-right text-[#6e7681]">
                  <p className="font-pixel text-[8px]">Next Lesson</p>
                  <h3 className="font-heading mt-3 text-lg font-semibold">
                    {courseIsCompleted
                      ? "You completed this course"
                      : "You reached the last lesson"}
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
