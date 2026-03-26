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
    title?: string;
    slug?: string;
    description?: string;
    level?: string;
    status?: string;
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

export default async function ManageInstructorCoursePage({
  params,
  searchParams,
}: ManageInstructorCoursePageProps) {
  const [{ courseId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);

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
    },
  });

  if (!course) {
    notFound();
  }

  const canManageCourse =
    isAdminRole(user.role) || course.instructorId === user.id;

  if (!canManageCourse) {
    redirect("/instructor");
  }

  async function updateCourse(formData: FormData) {
    "use server";

    const session = await auth();

    if (!session?.user?.email) {
      redirect("/login");
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser || !canAccessInstructorArea(currentUser.role)) {
      redirect("/dashboard");
    }

    const currentCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        instructorId: true,
      },
    });

    if (!currentCourse) {
      notFound();
    }

    const canManageCurrentCourse =
      isAdminRole(currentUser.role) || currentCourse.instructorId === currentUser.id;

    if (!canManageCurrentCourse) {
      redirect("/instructor");
    }

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

    redirect("/instructor");
  }

  const titleValue = resolvedSearchParams.title ?? course.title;
  const slugValue = resolvedSearchParams.slug ?? course.slug;
  const descriptionValue =
    resolvedSearchParams.description ?? course.description;
  const levelValue = resolvedSearchParams.level ?? course.level;
  const statusValue = resolvedSearchParams.status ?? course.status;
  const errorMessage = resolvedSearchParams.error;
  const firstName = user.name?.split(" ")[0] ?? "Instructor";

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
                Update the core identity of your course and keep its draft,
                published, or archived state organized from one clean editor.
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
                  <p className="text-sm font-medium text-slate-500">Lessons</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {course.lessons}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Enrollments</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {course.enrollments.length}
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
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
      </div>
    </main>
  );
}
