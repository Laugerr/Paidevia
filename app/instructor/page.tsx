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
  const toneClass =
    tone === "blue" ? "bg-[rgba(32,156,238,0.12)] text-[#209cee]"
    : tone === "amber" ? "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]"
    : tone === "green" ? "bg-[rgba(146,204,65,0.12)] text-[#92cc41]"
    : "bg-[#2d333b] text-[#8b949e]";

  return (
    <article className="rounded-xl border border-[#30363d] bg-[#21262d] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex rounded-lg px-3 py-1 font-pixel text-[8px] ${toneClass}`}>Live</div>
        <span className="font-pixel text-[7px] text-[#6e7681]">Overview</span>
      </div>
      <p className="mt-4 text-xs font-medium text-[#8b949e]">{label}</p>
      <p className="mt-1.5 text-3xl font-bold text-[#e6edf3]">{value}</p>
      <p className="mt-1 text-xs text-[#6e7681]">{detail}</p>
    </article>
  );
}

export default async function InstructorPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, role: true },
  });
  if (!user) redirect("/login");
  if (!canAccessInstructorArea(user.role)) redirect("/dashboard");

  const ownedCourses = await prisma.course.findMany({
    where: { instructorId: user.id },
    include: { enrollments: { select: { id: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const ownedCourseCount = ownedCourses.length;
  const draftCourses = ownedCourses.filter((c) => c.status === "draft");
  const publishedCourses = ownedCourses.filter((c) => c.status === "published");
  const archivedCourses = ownedCourses.filter((c) => c.status === "archived");
  const totalLessons = ownedCourses.reduce((sum, c) => sum + c.lessons, 0);
  const totalEnrollments = ownedCourses.reduce((sum, c) => sum + c.enrollments.length, 0);
  const readyToGrowCourses = ownedCourses.filter((c) => c.status !== "archived" && c.lessons > 0).length;
  const firstName = user.name?.split(" ")[0] ?? "Instructor";

  return (
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-[#f7d51d]/6 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#209cee]/6 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f7d51d]/40 to-transparent" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px] xl:items-center">
            <div className="max-w-2xl">
              <p className="font-pixel text-[9px] text-[#f7d51d]">Instructor Workspace</p>
              <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl lg:text-4xl">
                Welcome, <span className="text-[#f7d51d]">{firstName}</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#8b949e] sm:text-base">
                Manage your teaching area, review owned course status, and
                prepare the foundation for course creation and lesson publishing.
              </p>
              {isAdminRole(user.role) && (
                <p className="mt-3 text-sm font-medium text-[#f7d51d]">
                  Admin access is enabled here for oversight.
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/instructor/courses/new"
                  className="inline-flex items-center justify-center rounded-xl bg-[#209cee] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(32,156,238,0.3)] transition duration-200 hover:bg-[#1786c9] hover:-translate-y-0.5"
                >
                  Create New Course
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b] hover:-translate-y-0.5"
                >
                  View Catalog
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b] hover:-translate-y-0.5"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>

            <aside className="rounded-xl border border-[#30363d] bg-[#21262d] p-5">
              <p className="font-pixel text-[8px] text-[#6e7681]">Workspace Status</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Owned courses", value: ownedCourseCount, color: "text-[#e6edf3]" },
                  { label: "Published", value: publishedCourses.length, color: "text-[#92cc41]" },
                  { label: "Drafts", value: draftCourses.length, color: "text-[#f7d51d]" },
                  { label: "Ready to grow", value: readyToGrowCourses, color: "text-[#209cee]" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3">
                    <p className="text-xs font-medium text-[#8b949e]">{item.label}</p>
                    <p className={`mt-1.5 text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* Stats */}
        <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-pixel text-[9px] text-[#209cee]">Instructor Overview</p>
              <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3] sm:text-2xl">
                Workspace snapshot
              </h2>
            </div>
            <p className="text-xs text-[#6e7681]">Courses assigned to your account</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Owned Courses" value={ownedCourseCount} detail="Linked to your account" tone="blue" />
            <StatCard label="Draft Courses" value={draftCourses.length} detail="Work in progress" tone="amber" />
            <StatCard label="Published" value={publishedCourses.length} detail="Visible learning paths" tone="green" />
            <StatCard label="Total Lessons" value={totalLessons} detail="Across owned courses" tone="slate" />
            <StatCard label="Enrollments" value={totalEnrollments} detail="Learners in your courses" tone="blue" />
          </div>
        </section>

        {/* Courses + Sidebar */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_300px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-pixel text-[9px] text-[#209cee]">My Courses</p>
                  <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3] sm:text-2xl">
                    Owned course inventory
                  </h2>
                </div>
                <span className="inline-flex rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1 font-pixel text-[8px] text-[#6e7681]">
                  {ownedCourseCount} courses
                </span>
              </div>

              {ownedCourses.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {ownedCourses.map((course) => {
                    const statusClass =
                      course.status === "published" ? "bg-[rgba(146,204,65,0.12)] text-[#92cc41]"
                      : course.status === "draft" ? "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]"
                      : "bg-[#2d333b] text-[#8b949e]";

                    return (
                      <article
                        key={course.id}
                        className="rounded-xl border border-[#30363d] bg-[#21262d] p-4 transition duration-200 hover:border-[#3d444d] sm:p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-heading text-lg font-semibold text-[#e6edf3]">{course.title}</h3>
                              <span className={`rounded-lg px-2.5 py-1 font-pixel text-[8px] ${statusClass}`}>
                                {course.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#8b949e]">{course.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {[
                                `${course.lessons} lessons`,
                                `${course.enrollments.length} enrollments`,
                                course.level,
                              ].map((tag) => (
                                <span key={tag} className="rounded-lg bg-[#2d333b] px-2.5 py-1 font-pixel text-[8px] text-[#6e7681]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-row gap-3 lg:flex-col">
                            <Link
                              href={`/courses/${course.slug}`}
                              className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-2.5 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#3d444d]"
                            >
                              View Course
                            </Link>
                            <Link
                              href={`/instructor/courses/${course.id}`}
                              className="inline-flex items-center justify-center rounded-xl bg-[#209cee] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-[#1786c9]"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-[#30363d] bg-[#21262d] p-7 text-center">
                  <p className="font-pixel text-[9px] text-[#209cee]">Empty State</p>
                  <h3 className="font-heading mt-3 text-xl font-bold text-[#e6edf3]">No courses assigned yet</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#8b949e]">
                    Your workspace is ready. Create your first course to get started.
                  </p>
                  <Link
                    href="/instructor/courses/new"
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#209cee] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(32,156,238,0.25)] transition duration-200 hover:bg-[#1786c9]"
                  >
                    Create Your First Course
                  </Link>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            {/* Quick Actions */}
            <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
              <p className="font-pixel text-[9px] text-[#209cee]">Quick Actions</p>
              <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3]">
                Next instructor moves
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Create New Course", note: "Start a new draft in the database", href: "/instructor/courses/new", primary: true },
                  { label: "Review Drafts", note: `${draftCourses.length} draft course${draftCourses.length === 1 ? "" : "s"}`, href: "/instructor", primary: false },
                  { label: "Review Published", note: `${publishedCourses.length} published course${publishedCourses.length === 1 ? "" : "s"}`, href: "/instructor", primary: false },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={
                      action.primary
                        ? "block rounded-xl bg-[#209cee] px-4 py-3.5 text-white shadow-[0_4px_12px_rgba(32,156,238,0.25)] transition duration-200 hover:bg-[#1786c9]"
                        : "block rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-3.5 text-[#e6edf3] transition duration-200 hover:bg-[#2d333b]"
                    }
                  >
                    <span className="block text-sm font-semibold">{action.label}</span>
                    <span className={`mt-0.5 block text-xs ${action.primary ? "text-white/70" : "text-[#6e7681]"}`}>
                      {action.note}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Workflow */}
            <section className="rounded-2xl border border-[#30363d] bg-[#21262d] p-5">
              <p className="font-pixel text-[9px] text-[#209cee]">Workflow Guidance</p>
              <h2 className="font-heading mt-2 text-lg font-semibold text-[#e6edf3]">Recommended flow</h2>
              <div className="mt-4 space-y-3">
                {[
                  "Create a draft course and define its core identity.",
                  "Add and organize lessons in the course editor.",
                  "Use the publishing checklist before going live.",
                ].map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(32,156,238,0.12)] font-pixel text-[9px] text-[#209cee]">
                      {index + 1}
                    </span>
                    <p className="text-xs leading-6 text-[#8b949e]">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Status Balance */}
            <section className="rounded-2xl border border-[#30363d] bg-[#21262d] p-5">
              <p className="font-pixel text-[9px] text-[#f7d51d]">Publishing Visibility</p>
              <h2 className="font-heading mt-2 text-lg font-semibold text-[#e6edf3]">Status balance</h2>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Drafts", value: draftCourses.length, color: "text-[#f7d51d]" },
                  { label: "Published", value: publishedCourses.length, color: "text-[#92cc41]" },
                  { label: "Archived", value: archivedCourses.length, color: "text-[#8b949e]" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3.5">
                    <p className="text-xs font-medium text-[#8b949e]">{item.label}</p>
                    <p className={`mt-1.5 text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
