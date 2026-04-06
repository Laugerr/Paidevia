import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessInstructorArea, isAdminRole } from "@/lib/roles";

type ManageInstructorCoursePageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    publishError?: string;
    publishSuccess?: string;
    title?: string;
    slug?: string;
    description?: string;
    level?: string;
    status?: string;
    lessonError?: string;
    lessonTitle?: string;
    lessonSlug?: string;
    lessonSummary?: string;
    editingLessonId?: string;
  }>;
};

const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const COURSE_STATUSES = ["draft", "published", "archived"] as const;

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getPublishReadiness(input: {
  title: string;
  slug: string;
  description: string;
  level: string;
  lessonCount: number;
}) {
  const checks = [
    {
      id: "title",
      label: "Course title is set",
      ready: Boolean(input.title.trim()),
    },
    {
      id: "slug",
      label: "Course slug is set",
      ready: Boolean(input.slug.trim()),
    },
    {
      id: "description",
      label: "Course description is set",
      ready: Boolean(input.description.trim()),
    },
    {
      id: "level",
      label: "Course level is selected",
      ready: COURSE_LEVELS.includes(input.level as (typeof COURSE_LEVELS)[number]),
    },
    {
      id: "lessons",
      label: "At least one lesson exists",
      ready: input.lessonCount > 0,
    },
  ];

  return {
    checks,
    isReady: checks.every((check) => check.ready),
  };
}

async function getAuthorizedInstructorActor() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      role: true,
      name: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!canAccessInstructorArea(user.role)) {
    redirect("/dashboard");
  }

  return user;
}

async function getManageableCourse(courseId: string, userId: string, role: string) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      enrollments: {
        select: {
          id: true,
        },
      },
      courseLessons: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const canManageCourse = isAdminRole(role) || course.instructorId === userId;

  if (!canManageCourse) {
    redirect("/instructor");
  }

  return course;
}

export default async function ManageInstructorCoursePage({
  params,
  searchParams,
}: ManageInstructorCoursePageProps) {
  const [{ courseId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);

  const user = await getAuthorizedInstructorActor();
  const course = await getManageableCourse(courseId, user.id, user.role);

  async function updateCourse(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    const title = String(formData.get("title") ?? "").trim();
    const slug = normalizeSlug(String(formData.get("slug") ?? ""));
    const description = String(formData.get("description") ?? "").trim();
    const level = String(formData.get("level") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();

    const params = new URLSearchParams({
      title,
      slug,
      description,
      level,
      status,
    });

    if (!title || !slug || !description || !level || !status) {
      params.set("error", "Please complete all required fields.");
      redirect(`/instructor/courses/${courseId}?${params.toString()}`);
    }

    if (!COURSE_LEVELS.includes(level as (typeof COURSE_LEVELS)[number])) {
      params.set("error", "Please choose a valid level.");
      redirect(`/instructor/courses/${courseId}?${params.toString()}`);
    }

    if (!COURSE_STATUSES.includes(status as (typeof COURSE_STATUSES)[number])) {
      params.set("error", "Please choose a valid status.");
      redirect(`/instructor/courses/${courseId}?${params.toString()}`);
    }

    const publishReadiness = getPublishReadiness({
      title,
      slug,
      description,
      level,
      lessonCount: course.courseLessons.length,
    });

    if (status === "published" && !publishReadiness.isReady) {
      params.set(
        "error",
        "This course is not ready to publish yet. Complete the publishing checklist first."
      );
      redirect(`/instructor/courses/${courseId}?${params.toString()}#publishing-workflow`);
    }

    const existingCourse = await prisma.course.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingCourse && existingCourse.id !== courseId) {
      params.set("error", "That slug is already in use. Please choose another.");
      redirect(`/instructor/courses/${courseId}?${params.toString()}`);
    }

    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        title,
        slug,
        description,
        level,
        status,
      },
    });

    redirect(`/instructor/courses/${courseId}`);
  }

  async function publishCourse() {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    const currentCourse = await getManageableCourse(
      courseId,
      currentUser.id,
      currentUser.role
    );

    const readiness = getPublishReadiness({
      title: currentCourse.title,
      slug: currentCourse.slug,
      description: currentCourse.description,
      level: currentCourse.level,
      lessonCount: currentCourse.courseLessons.length,
    });

    if (!readiness.isReady) {
      redirect(
        `/instructor/courses/${courseId}?publishError=${encodeURIComponent(
          "This course is not ready to publish yet. Finish every checklist item first."
        )}#publishing-workflow`
      );
    }

    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        status: "published",
      },
    });

    redirect(
      `/instructor/courses/${courseId}?publishSuccess=${encodeURIComponent(
        "Course published successfully."
      )}#publishing-workflow`
    );
  }

  async function moveCourseToDraft() {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        status: "draft",
      },
    });

    redirect(
      `/instructor/courses/${courseId}?publishSuccess=${encodeURIComponent(
        "Course moved back to draft."
      )}#publishing-workflow`
    );
  }

  async function addLesson(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    const currentCourse = await getManageableCourse(
      courseId,
      currentUser.id,
      currentUser.role
    );

    const title = String(formData.get("lessonTitle") ?? "").trim();
    const slugInput = String(formData.get("lessonSlug") ?? "").trim();
    const slug = normalizeSlug(slugInput || title);
    const summary = String(formData.get("lessonSummary") ?? "").trim();

    const params = new URLSearchParams({
      lessonTitle: title,
      lessonSlug: slugInput,
      lessonSummary: summary,
    });

    if (!title || !slug) {
      params.set("lessonError", "Please provide a title and slug for the lesson.");
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const existingLesson = await prisma.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId,
          slug,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingLesson) {
      params.set("lessonError", "That lesson slug is already in use for this course.");
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const duplicatePublicLessonSlug = await prisma.lesson.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (duplicatePublicLessonSlug) {
      params.set(
        "lessonError",
        "That lesson slug is already used elsewhere. Public lesson slugs must stay unique."
      );
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const nextPosition = currentCourse.courseLessons.length + 1;

    await prisma.$transaction([
      prisma.lesson.create({
        data: {
          courseId,
          title,
          slug,
          summary: summary || null,
          position: nextPosition,
        },
      }),
      prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          lessons: nextPosition,
        },
      }),
    ]);

    redirect(`/instructor/courses/${courseId}#lesson-management`);
  }

  async function updateLesson(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    const lessonId = String(formData.get("lessonId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = normalizeSlug(slugInput || title);
    const summary = String(formData.get("summary") ?? "").trim();

    const params = new URLSearchParams({
      editingLessonId: lessonId,
      lessonTitle: title,
      lessonSlug: slugInput,
      lessonSummary: summary,
    });

    if (!lessonId || !title || !slug) {
      params.set("lessonError", "Please complete the lesson title and slug.");
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
        courseId: true,
      },
    });

    if (!lesson || lesson.courseId !== courseId) {
      notFound();
    }

    const existingLesson = await prisma.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId,
          slug,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingLesson && existingLesson.id !== lessonId) {
      params.set("lessonError", "That lesson slug is already in use for this course.");
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const duplicatePublicLessonSlug = await prisma.lesson.findFirst({
      where: {
        slug,
        NOT: {
          id: lessonId,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicatePublicLessonSlug) {
      params.set(
        "lessonError",
        "That lesson slug is already used elsewhere. Public lesson slugs must stay unique."
      );
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title,
        slug,
        summary: summary || null,
      },
    });

    redirect(`/instructor/courses/${courseId}#lesson-management`);
  }

  async function deleteLesson(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    const lessonId = String(formData.get("lessonId") ?? "");

    if (!lessonId) {
      redirect(`/instructor/courses/${courseId}#lesson-management`);
    }

    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
        courseId: true,
      },
    });

    if (!lesson || lesson.courseId !== courseId) {
      notFound();
    }

    await prisma.$transaction(async (tx) => {
      await tx.lesson.delete({
        where: {
          id: lessonId,
        },
      });

      const remainingLessons = await tx.lesson.findMany({
        where: {
          courseId,
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      });

      for (const [index, remainingLesson] of remainingLessons.entries()) {
        await tx.lesson.update({
          where: {
            id: remainingLesson.id,
          },
          data: {
            position: index + 1,
          },
        });
      }

      await tx.course.update({
        where: {
          id: courseId,
        },
        data: {
          lessons: remainingLessons.length,
        },
      });
    });

    redirect(`/instructor/courses/${courseId}#lesson-management`);
  }

  async function moveLesson(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    const lessonId = String(formData.get("lessonId") ?? "");
    const direction = String(formData.get("direction") ?? "");

    if (!lessonId || !["up", "down"].includes(direction)) {
      redirect(`/instructor/courses/${courseId}#lesson-management`);
    }

    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
        courseId: true,
        position: true,
      },
    });

    if (!lesson || lesson.courseId !== courseId) {
      notFound();
    }

    const targetPosition =
      direction === "up" ? lesson.position - 1 : lesson.position + 1;

    if (targetPosition < 1) {
      redirect(`/instructor/courses/${courseId}#lesson-management`);
    }

    const adjacentLesson = await prisma.lesson.findFirst({
      where: {
        courseId,
        position: targetPosition,
      },
      select: {
        id: true,
        position: true,
      },
    });

    if (!adjacentLesson) {
      redirect(`/instructor/courses/${courseId}#lesson-management`);
    }

    await prisma.$transaction([
      prisma.lesson.update({
        where: {
          id: lesson.id,
        },
        data: {
          position: adjacentLesson.position,
        },
      }),
      prisma.lesson.update({
        where: {
          id: adjacentLesson.id,
        },
        data: {
          position: lesson.position,
        },
      }),
    ]);

    redirect(`/instructor/courses/${courseId}#lesson-management`);
  }

  const titleValue = resolvedSearchParams.title ?? course.title;
  const slugValue = resolvedSearchParams.slug ?? course.slug;
  const descriptionValue =
    resolvedSearchParams.description ?? course.description;
  const levelValue = resolvedSearchParams.level ?? course.level;
  const statusValue = resolvedSearchParams.status ?? course.status;
  const errorMessage = resolvedSearchParams.error;
  const publishErrorMessage = resolvedSearchParams.publishError;
  const publishSuccessMessage = resolvedSearchParams.publishSuccess;
  const lessonErrorMessage = resolvedSearchParams.lessonError;
  const lessonTitleValue = resolvedSearchParams.lessonTitle ?? "";
  const lessonSlugValue = resolvedSearchParams.lessonSlug ?? "";
  const lessonSummaryValue = resolvedSearchParams.lessonSummary ?? "";
  const editingLessonId = resolvedSearchParams.editingLessonId;
  const firstName = user.name?.split(" ")[0] ?? "Instructor";
  const publishReadiness = getPublishReadiness({
    title: titleValue,
    slug: slugValue,
    description: descriptionValue,
    level: levelValue,
    lessonCount: course.courseLessons.length,
  });

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(253,224,71,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.72),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-blue-200/25 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_320px] xl:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">
                Instructor Workspace
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Manage course
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Update the core identity of your course, build out its lesson
                roadmap, and keep the draft, published, or archived state
                organized from one clean editor.
              </p>
              <p className="mt-3 text-sm font-medium text-amber-700">
                Editing as {firstName}
                {isAdminRole(user.role) ? " with admin oversight access." : "."}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/instructor"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/92 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  Back to Instructor Workspace
                </Link>
                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  View Public Course
                </Link>
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/90 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Course Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {course.status}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Lesson entries</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {course.courseLessons.length}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Enrollments</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {course.enrollments.length}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">
                    Last updated
                  </p>
                  <p className="mt-2 text-base font-semibold tracking-tight text-slate-950">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(course.updatedAt)}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Course Editor
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Course settings
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Public course pages still use static data for now, but these
              updates are stored in the database and ready for the instructor
              workflow.
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={updateCourse} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Course Title
                </span>
                <input
                  name="title"
                  type="text"
                  defaultValue={titleValue}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Course Slug
                </span>
                <input
                  name="slug"
                  type="text"
                  defaultValue={slugValue}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Description
              </span>
              <textarea
                name="description"
                rows={5}
                defaultValue={descriptionValue}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                required
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Level</span>
                <select
                  name="level"
                  defaultValue={levelValue}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                >
                  {COURSE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Status</span>
                <select
                  name="status"
                  defaultValue={statusValue}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                >
                  {COURSE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status[0].toUpperCase()}
                      {status.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Editing Guidance
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  "Keep the slug stable once learners start using the course.",
                  "Use the description to clarify the learning outcome.",
                  "Set the final status from the publishing controls below.",
                ].map((tip) => (
                  <div
                    key={tip}
                    className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"
                  >
                    <p className="text-sm leading-6 text-slate-600">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Save Course Changes
              </button>
              <Link
                href="/instructor"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>

        <section
          id="lesson-management"
          className="rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                Lesson Management
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Build your lesson roadmap
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Add lessons, keep the order clean, and update lesson titles and
              summaries before the public course flow moves to the database.
            </p>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="rounded-[28px] border border-emerald-100 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(240,253,244,0.92)_100%)] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                Add Lesson
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Create a lesson entry
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Start with the lesson title, give it a clean slug, and add a
                short summary that helps you identify the lesson later.
              </p>

              {lessonErrorMessage ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {lessonErrorMessage}
                </div>
              ) : null}

              <form action={addLesson} className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Lesson Title
                  </span>
                  <input
                    name="lessonTitle"
                    type="text"
                    defaultValue={lessonTitleValue}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-emerald-400"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Lesson Slug
                  </span>
                  <input
                    name="lessonSlug"
                    type="text"
                    defaultValue={lessonSlugValue}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-emerald-400"
                    placeholder="auto-generated from title if left blank"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Summary
                  </span>
                  <textarea
                    name="lessonSummary"
                    rows={4}
                    defaultValue={lessonSummaryValue}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-emerald-400"
                    placeholder="Short note for your internal lesson planning"
                  />
                </label>

                <button
                  type="submit"
                  style={{ backgroundColor: "#059669", color: "#ffffff" }}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  Add Lesson
                </button>
              </form>
            </aside>

            <div className="space-y-4">
              {course.courseLessons.length > 0 ? (
                course.courseLessons.map((lesson, index) => {
                  const isEditing = editingLessonId === lesson.id;

                  return (
                    <article
                      key={lesson.id}
                      className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                              Lesson {lesson.position}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                              {lesson.slug}
                            </span>
                          </div>
                          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                            {lesson.title}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-slate-500">
                            {lesson.summary?.trim()
                              ? lesson.summary
                              : "No summary added yet. Add one when you want a clearer planning note for this lesson."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:w-[220px] xl:justify-end">
                          <form action={moveLesson}>
                            <input type="hidden" name="lessonId" value={lesson.id} />
                            <input type="hidden" name="direction" value="up" />
                            <button
                              type="submit"
                              disabled={index === 0}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Move Up
                            </button>
                          </form>

                          <form action={moveLesson}>
                            <input type="hidden" name="lessonId" value={lesson.id} />
                            <input type="hidden" name="direction" value="down" />
                            <button
                              type="submit"
                              disabled={index === course.courseLessons.length - 1}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Move Down
                            </button>
                          </form>

                          <form action={deleteLesson}>
                            <input type="hidden" name="lessonId" value={lesson.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition duration-200 hover:-translate-y-0.5 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>

                      <details
                        open={isEditing}
                        className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/60 p-4"
                      >
                        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
                          Edit lesson details
                        </summary>

                        <form action={updateLesson} className="mt-4 space-y-4">
                          <input type="hidden" name="lessonId" value={lesson.id} />

                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-700">
                                Title
                              </span>
                              <input
                                name="title"
                                type="text"
                                defaultValue={isEditing ? lessonTitleValue || lesson.title : lesson.title}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                                required
                              />
                            </label>

                            <label className="block">
                              <span className="text-sm font-semibold text-slate-700">
                                Slug
                              </span>
                              <input
                                name="slug"
                                type="text"
                                defaultValue={isEditing ? lessonSlugValue || lesson.slug : lesson.slug}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                                required
                              />
                            </label>
                          </div>

                          <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                              Summary
                            </span>
                            <textarea
                              name="summary"
                              rows={3}
                              defaultValue={
                                isEditing
                                  ? lessonSummaryValue || lesson.summary || ""
                                  : lesson.summary || ""
                              }
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                            />
                          </label>

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                          >
                            Save Lesson
                          </button>
                        </form>
                      </details>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Lesson Roadmap
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    No lessons added yet
                  </h3>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                    Start by adding your first lesson from the panel on the left.
                    You can rename, reorder, and remove lessons here as your
                    course structure evolves.
                  </p>
                </div>
              )}

              {course.courseLessons.length > 0 ? (
                <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Lesson planning note
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Public lesson pages are now database-backed, so keeping this
                    roadmap ordered and the lesson slugs unique directly affects
                    the learner-facing experience.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section
          id="publishing-workflow"
          className="rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Publishing Workflow
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Course readiness
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Publishing is now rule-based. A course can only go live when its
              core identity is complete and it has at least one lesson.
            </p>
          </div>

          {publishErrorMessage ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {publishErrorMessage}
            </div>
          ) : null}

          {publishSuccessMessage ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {publishSuccessMessage}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Publish checklist
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Every item below must be complete before the course can be published.
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${
                    publishReadiness.isReady
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {publishReadiness.isReady ? "Ready to publish" : "Needs attention"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {publishReadiness.checks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          check.ready
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {check.ready ? "✓" : "!"}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {check.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                        check.ready ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {check.ready ? "Complete" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[28px] border border-blue-100 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(239,246,255,0.92)_100%)] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Publish Controls
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Status actions
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use these controls once you are happy with the course structure.
              </p>

              <div className="mt-6 space-y-3">
                {course.status !== "published" ? (
                  <form action={publishCourse}>
                    <button
                      type="submit"
                      disabled={!publishReadiness.isReady}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:text-emerald-50 disabled:shadow-none"
                    >
                      Publish Course
                    </button>
                  </form>
                ) : (
                  <form action={moveCourseToDraft}>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm font-semibold text-amber-800 transition duration-200 hover:-translate-y-0.5 hover:bg-amber-100"
                    >
                      Move Back to Draft
                    </button>
                  </form>
                )}

                <p className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
                  Current status:
                  <span className="ml-2 font-semibold text-slate-950">
                    {course.status}
                  </span>
                </p>
                <p className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
                  {publishReadiness.isReady
                    ? "This course meets the current publishing rules."
                    : "Complete the checklist items on the left before publishing."}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
