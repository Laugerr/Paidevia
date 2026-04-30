"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const heroArt = [
  "from-blue-900 via-sky-800 to-indigo-900",
  "from-emerald-900 via-teal-800 to-green-900",
  "from-orange-900 via-red-800 to-rose-900",
];

type CourseDetailLesson = { title: string; slug: string };
type CourseDetailClientProps = {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    level: string;
    lessons: number;
    lessonList: CourseDetailLesson[];
  };
};

function getArtIndex(seed: string) {
  return seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export default function CourseDetailClient({ course: foundCourse }: CourseDetailClientProps) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoadingEnrollment, setIsLoadingEnrollment] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourseState() {
      try {
        const [enrollRes, progressRes] = await Promise.all([
          fetch("/api/enrollments", { cache: "no-store" }),
          fetch("/api/progress", { cache: "no-store" }),
        ]);
        if (!enrollRes.ok || !progressRes.ok) throw new Error("Failed to load state");
        const enrollData = await enrollRes.json();
        const progressData = await progressRes.json();
        const enrolledCourses: string[] = enrollData.enrolledCourses ?? [];
        const completedSlugs: string[] = progressData.completedLessons ?? [];
        setIsEnrolled(enrolledCourses.includes(foundCourse.slug));
        setCompletedLessons(completedSlugs);
        const firstIncomplete = foundCourse.lessonList.find((l) => !completedSlugs.includes(l.slug)) ?? foundCourse.lessonList[0];
        setCurrentLesson(firstIncomplete?.slug ?? null);
      } catch (error) {
        console.error("Failed to load course state:", error);
      } finally {
        setIsLoadingEnrollment(false);
      }
    }
    loadCourseState();
  }, [foundCourse]);

  const totalLessons = foundCourse.lessonList.length;
  const completedLessonsInCourse = useMemo(
    () => foundCourse.lessonList.filter((l) => completedLessons.includes(l.slug)).length,
    [completedLessons, foundCourse.lessonList]
  );
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsInCourse / totalLessons) * 100) : 0;
  const hasLessons = totalLessons > 0;

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      setEnrollmentError(null);
      setEnrollmentSuccess(null);
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: foundCourse.slug }),
      });
      if (response.status === 401) { router.push("/login"); return; }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setEnrollmentError(data?.error ?? "Failed to enroll");
        return;
      }
      setIsEnrolled(true);
      setEnrollmentSuccess("You're enrolled! Jump straight into the lesson flow.");
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const artIndex = getArtIndex(foundCourse.id);

  return (
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-[#209cee]/8 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#a78bfa]/6 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#209cee]/40 to-transparent" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_320px] xl:items-center">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 font-pixel text-[8px] text-[#209cee]">
                  {foundCourse.level}
                </span>
                <span className="rounded-lg bg-[#209cee] px-3 py-1.5 font-pixel text-[8px] text-white">
                  Learning Path
                </span>
              </div>

              <h1 className="font-heading mt-5 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl lg:text-4xl">
                {foundCourse.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#8b949e] sm:text-base">
                {foundCourse.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[`${foundCourse.lessons} lessons`, "Self-paced", "Guided progression"].map((tag) => (
                  <span key={tag} className="rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-sm font-medium text-[#8b949e]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className={cn("relative h-56 overflow-hidden rounded-2xl bg-gradient-to-br shadow-[0_12px_32px_rgba(0,0,0,0.4)]", heroArt[artIndex % heroArt.length])}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%)]" />
              <div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 font-pixel text-[8px] text-white backdrop-blur">
                Featured Path
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/40 p-4 backdrop-blur">
                <p className="text-xs font-medium text-white/70">Course progress</p>
                <p className="mt-1.5 text-3xl font-bold text-white">{progressPercentage}%</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content grid */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_300px]">

          {/* Sidebar */}
          <aside className="order-1 space-y-4 xl:order-2">
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
              <p className="font-pixel text-[8px] text-[#6e7681]">Course Access</p>
              <h2 className="font-heading mt-2 text-lg font-semibold text-[#e6edf3]">Start learning right away</h2>
              <p className="mt-2 text-sm leading-6 text-[#8b949e]">
                Enroll to unlock the lesson flow and continue through the player experience.
              </p>

              {isLoadingEnrollment ? (
                <div className="mt-5 rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-4 text-center text-sm text-[#8b949e]">
                  Checking enrollment...
                </div>
              ) : !hasLessons ? (
                <div className="mt-5 rounded-xl border border-[rgba(247,213,29,0.3)] bg-[rgba(247,213,29,0.08)] px-5 py-4 text-sm font-medium text-[#f7d51d]">
                  No lessons available yet.
                </div>
              ) : !isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="mt-5 w-full rounded-xl bg-[#209cee] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(32,156,238,0.3)] transition duration-200 hover:bg-[#1786c9] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEnrolling ? "Enrolling..." : "Enroll in Course"}
                </button>
              ) : (
                <>
                  <div className="mt-5 rounded-xl border border-[rgba(146,204,65,0.3)] bg-[rgba(146,204,65,0.08)] px-5 py-4 text-sm font-medium text-[#92cc41]">
                    {currentLesson ? "You're enrolled and ready to continue." : "All lessons completed!"}
                  </div>
                  {currentLesson && (
                    <Link
                      href={`/lesson/${currentLesson}`}
                      className="mt-3 block w-full rounded-xl bg-[#209cee] px-5 py-3.5 text-center text-sm font-semibold text-white shadow-[0_4px_12px_rgba(32,156,238,0.25)] transition duration-200 hover:bg-[#1786c9]"
                    >
                      Continue Learning
                    </Link>
                  )}
                </>
              )}

              {enrollmentError && (
                <div className="mt-3 rounded-xl border border-[rgba(231,110,85,0.3)] bg-[rgba(231,110,85,0.08)] px-5 py-4 text-sm font-medium text-[#e76e55]">
                  {enrollmentError}
                </div>
              )}
              {enrollmentSuccess && (
                <div className="mt-3 rounded-xl border border-[rgba(146,204,65,0.3)] bg-[rgba(146,204,65,0.08)] px-5 py-4 text-sm font-medium text-[#92cc41]">
                  {enrollmentSuccess}
                </div>
              )}

              <Link
                href="/dashboard"
                className="mt-3 block w-full rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3.5 text-center text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b]"
              >
                Go to Dashboard
              </Link>
            </section>

            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
              <p className="font-pixel text-[8px] text-[#209cee]">Learning Snapshot</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Lessons", value: foundCourse.lessons },
                  { label: "Completed", value: completedLessonsInCourse },
                  { label: "Current state", value: isEnrolled ? "Active" : "Preview" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-4">
                    <p className="text-xs font-medium text-[#8b949e]">{item.label}</p>
                    <p className="mt-1.5 text-xl font-bold text-[#e6edf3]">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          {/* Main content */}
          <div className="order-2 space-y-5 xl:order-1">
            {/* Progress */}
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-pixel text-[9px] text-[#209cee]">Course Progress</p>
                  <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3]">Track your journey</h2>
                </div>
                <div className="rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3 text-center">
                  <p className="text-xs font-medium text-[#8b949e]">Progress</p>
                  <p className="mt-1 text-2xl font-bold text-[#e6edf3]">{progressPercentage}%</p>
                </div>
              </div>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[#2d333b]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#209cee] to-[#92cc41] transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-[#8b949e]">{completedLessonsInCourse} / {totalLessons} lessons completed</p>
            </section>

            {/* Lesson Roadmap */}
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-pixel text-[9px] text-[#209cee]">Lessons</p>
                  <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3]">Course roadmap</h2>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b]"
                >
                  Back to Courses
                </Link>
              </div>

              <ul className="mt-6 space-y-3">
                {foundCourse.lessonList.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.slug);
                  const isUnlocked = index === 0 || completedLessons.includes(foundCourse.lessonList[index - 1].slug);

                  return (
                    <li
                      key={lesson.slug}
                      className={cn(
                        "rounded-xl border px-4 py-4 transition duration-200",
                        isUnlocked ? "border-[#30363d] bg-[#21262d] hover:border-[#3d444d]" : "border-[#30363d] bg-[#1a1f26] opacity-60"
                      )}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <span className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-pixel text-[9px]",
                            isCompleted && "bg-[rgba(146,204,65,0.15)] text-[#92cc41]",
                            !isCompleted && isUnlocked && "bg-[#2d333b] text-[#e6edf3] ring-1 ring-[#30363d]",
                            !isUnlocked && "bg-[#2d333b] text-[#6e7681]"
                          )}>
                            {isCompleted ? "OK" : isUnlocked ? index + 1 : "..."}
                          </span>
                          <div>
                            <p className="font-pixel text-[8px] text-[#209cee]">Lesson {index + 1}</p>
                            <h3 className="font-heading mt-1.5 text-base font-semibold text-[#e6edf3]">{lesson.title}</h3>
                            <p className="mt-1 text-xs text-[#8b949e]">
                              {isCompleted ? "Completed and ready for review." : isUnlocked ? "Unlocked and ready to start." : "Finish the previous lesson to unlock."}
                            </p>
                          </div>
                        </div>

                        {isUnlocked ? (
                          <Link
                            href={`/lesson/${lesson.slug}`}
                            className="inline-flex items-center justify-center rounded-xl bg-[#209cee] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-[#1786c9]"
                          >
                            Open Lesson
                          </Link>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-xl bg-[#2d333b] px-4 py-2.5 text-sm font-semibold text-[#6e7681]">
                            Locked
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
                {foundCourse.lessonList.length === 0 && (
                  <li className="rounded-xl border border-dashed border-[#30363d] bg-[#21262d] px-5 py-6 text-sm leading-7 text-[#8b949e]">
                    This course is published, but lessons are still being prepared.
                  </li>
                )}
              </ul>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
