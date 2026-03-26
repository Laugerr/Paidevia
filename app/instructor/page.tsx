import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessInstructorArea, isAdminRole } from "@/lib/roles";

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone: "blue" | "amber" | "green" | "slate";
}) {
  const toneClassName =
    tone === "blue"
      ? "bg-blue-100 text-blue-600"
      : tone === "amber"
      ? "bg-amber-100 text-amber-600"
      : tone === "green"
      ? "bg-emerald-100 text-emerald-600"
      : "bg-slate-100 text-slate-600";

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div
        className={`inline-flex rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${toneClassName}`}
      >
        Live
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

export default async function InstructorPage() {
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
      name: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!canAccessInstructorArea(user.role)) {
    redirect("/dashboard");
  }

  const ownedCourses = await prisma.course.findMany({
    where: {
      instructorId: user.id,
    },
    include: {
      enrollments: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const ownedCourseCount = ownedCourses.length;
  const draftCourses = ownedCourses.filter((course) => course.status === "draft");
  const publishedCourses = ownedCourses.filter(
    (course) => course.status === "published"
  );
  const archivedCourses = ownedCourses.filter(
    (course) => course.status === "archived"
  );
  const totalLessons = ownedCourses.reduce(
    (sum, course) => sum + course.lessons,
    0
  );
  const totalEnrollments = ownedCourses.reduce(
    (sum, course) => sum + course.enrollments.length,
    0
  );

  const firstName = user.name?.split(" ")[0] ?? "Instructor";
  const hasCourses = ownedCourseCount > 0;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(253,224,71,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.72),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-blue-200/25 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_340px] xl:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">
                Instructor Workspace
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Welcome, {firstName}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Manage your teaching area, review owned course status, and
                prepare the foundation for course creation, editing, and lesson
                publishing.
              </p>
              {isAdminRole(user.role) ? (
                <p className="mt-3 text-sm font-medium text-amber-700">
                  Admin access is enabled here for oversight and testing.
                </p>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  View Course Catalog
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/92 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/90 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Workspace Status
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Owned courses</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {ownedCourseCount}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">
                    Publish-ready focus
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                    {publishedCourses.length} published
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">Draft queue</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">
                    {draftCourses.length} drafts
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Instructor Overview
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Your workspace snapshot
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              These metrics now reflect courses assigned to your account, so the
              instructor area can grow around real ownership data.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Owned Courses"
              value={ownedCourseCount}
              detail="Courses linked to your account"
              tone="blue"
            />
            <StatCard
              label="Draft Courses"
              value={draftCourses.length}
              detail="Work still in progress"
              tone="amber"
            />
            <StatCard
              label="Published"
              value={publishedCourses.length}
              detail="Visible learning paths"
              tone="green"
            />
            <StatCard
              label="Total Lessons"
              value={totalLessons}
              detail="Across your owned courses"
              tone="slate"
            />
            <StatCard
              label="Enrollments"
              value={totalEnrollments}
              detail="Learners enrolled in your courses"
              tone="blue"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    My Courses
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Owned course inventory
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {ownedCourseCount} linked courses
                </span>
              </div>

              {hasCourses ? (
                <div className="mt-6 space-y-4">
                  {ownedCourses.map((course) => {
                    const statusClassName =
                      course.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : course.status === "draft"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700";

                    return (
                      <article
                        key={course.id}
                        className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                                {course.title}
                              </h3>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusClassName}`}
                              >
                                {course.status}
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                              {course.description}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                                {course.lessons} lessons
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                                {course.enrollments.length} enrollments
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                                {course.level}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                            <Link
                              href={`/courses/${course.slug}`}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
                            >
                              View Course
                            </Link>
                            <span className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
                              Manage Soon
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Empty State
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    No courses are assigned yet
                  </h3>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                    This instructor workspace is ready, but your account does not
                    own any courses yet. The next step is connecting real course
                    creation and management flows to this area.
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Quick Actions
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Next instructor moves
              </h2>
              <div className="mt-6 space-y-3">
                {[
                  {
                    label: "Create New Course",
                    note: "Next major feature in this workspace",
                    primary: true,
                  },
                  {
                    label: "Review Draft Courses",
                    note: `${draftCourses.length} draft course${
                      draftCourses.length === 1 ? "" : "s"
                    } currently linked`,
                    primary: false,
                  },
                  {
                    label: "Review Published Courses",
                    note: `${publishedCourses.length} published course${
                      publishedCourses.length === 1 ? "" : "s"
                    } live`,
                    primary: false,
                  },
                ].map((action) => (
                  <div
                    key={action.label}
                    className={
                      action.primary
                        ? "rounded-2xl bg-blue-600 px-4 py-4 text-white shadow-lg shadow-blue-500/20"
                        : "rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-800"
                    }
                  >
                    <span className="block text-sm font-semibold">
                      {action.label}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        action.primary ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      {action.note}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-amber-100 bg-[radial-gradient(circle_at_top_right,_rgba(253,224,71,0.22),_transparent_30%),linear-gradient(135deg,_#ffffff_0%,_#fffaf0_100%)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                Publishing Visibility
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Status balance
              </h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white/80 px-4 py-4 ring-1 ring-amber-100">
                  <p className="text-sm font-medium text-slate-500">Drafts</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-amber-700">
                    {draftCourses.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-4 ring-1 ring-emerald-100">
                  <p className="text-sm font-medium text-slate-500">Published</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-emerald-700">
                    {publishedCourses.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-4 ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Archived</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-slate-700">
                    {archivedCourses.length}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
