import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessInstructorArea, isAdminRole } from "@/lib/roles";

type NewCoursePageProps = {
  searchParams?: {
    error?: string;
    title?: string;
    slug?: string;
    description?: string;
    level?: string;
  };
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default async function NewInstructorCoursePage({
  searchParams,
}: NewCoursePageProps) {
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

  async function createCourse(formData: FormData) {
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

    const title = String(formData.get("title") ?? "").trim();
    const slug = normalizeSlug(String(formData.get("slug") ?? ""));
    const description = String(formData.get("description") ?? "").trim();
    const level = String(formData.get("level") ?? "").trim();

    const params = new URLSearchParams({
      title,
      slug,
      description,
      level,
    });

    if (!title || !slug || !description || !level) {
      params.set("error", "Please complete all required fields.");
      redirect(`/instructor/courses/new?${params.toString()}`);
    }

    const existingCourse = await prisma.course.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingCourse) {
      params.set("error", "That slug is already in use. Please choose another.");
      redirect(`/instructor/courses/new?${params.toString()}`);
    }

    await prisma.course.create({
      data: {
        title,
        slug,
        description,
        level,
        status: "draft",
        lessons: 0,
        instructorId: currentUser.id,
      },
    });

    redirect("/instructor");
  }

  const titleValue = searchParams?.title ?? "";
  const slugValue = searchParams?.slug ?? "";
  const descriptionValue = searchParams?.description ?? "";
  const levelValue = searchParams?.level ?? "Beginner";
  const errorMessage = searchParams?.error;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(253,224,71,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.72),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-blue-200/25 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">
              Instructor Workspace
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Create a new course draft
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Start with the core course identity first. This draft will be
              saved to the database and linked to your instructor account.
            </p>
            {isAdminRole(user.role) ? (
              <p className="mt-3 text-sm font-medium text-amber-700">
                Admin access is enabled here for testing and oversight.
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/instructor"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/92 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
              >
                Back to Instructor Workspace
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Course Details
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Draft setup
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Newly created courses are stored as drafts. Public course pages
              still rely on static course data for now, so this workflow is the
              instructor-side foundation first.
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={createCourse} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Course Title
                </span>
                <input
                  name="title"
                  type="text"
                  defaultValue={titleValue}
                  placeholder="Introduction to Product Design"
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
                  placeholder="introduction-to-product-design"
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
                placeholder="Write a clear summary of what learners will gain from this course."
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                required
              />
            </label>

            <div className="grid gap-6 md:grid-cols-[minmax(0,240px)_1fr]">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Level</span>
                <select
                  name="level"
                  defaultValue={levelValue}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400"
                >
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Draft defaults
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 ring-1 ring-slate-200">
                    Status: Draft
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 ring-1 ring-slate-200">
                    Lessons: 0
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 ring-1 ring-slate-200">
                    Owner linked
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Create Draft Course
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
