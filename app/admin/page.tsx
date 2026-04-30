import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "red" | "blue" | "amber" | "green";
}) {
  const toneClass =
    tone === "red" ? "bg-[rgba(231,110,85,0.12)] text-[#e76e55]"
    : tone === "blue" ? "bg-[rgba(32,156,238,0.12)] text-[#209cee]"
    : tone === "amber" ? "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]"
    : "bg-[rgba(146,204,65,0.12)] text-[#92cc41]";

  const barClass =
    tone === "red" ? "from-[#e76e55] to-[#c0392b]"
    : tone === "blue" ? "from-[#209cee] to-[#92cc41]"
    : tone === "amber" ? "from-[#f7d51d] to-[#e59400]"
    : "from-[#92cc41] to-[#209cee]";

  return (
    <article className="rounded-xl border border-[#30363d] bg-[#21262d] p-4 transition duration-200 hover:border-[#3d444d] hover:-translate-y-0.5 sm:p-5">
      <span className={`inline-flex rounded-lg px-3 py-1 font-pixel text-[8px] ${toneClass}`}>Live</span>
      <p className="mt-4 text-xs font-medium text-[#8b949e]">{label}</p>
      <p className="mt-1.5 text-3xl font-bold text-[#e6edf3] sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs text-[#6e7681]">{detail}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#2d333b]">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${barClass}`} />
      </div>
    </article>
  );
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  if (!isAdminRole(user.role)) redirect("/dashboard");

  const totalUsers = await prisma.user.count();
  const totalCourses = await prisma.course.count();
  const totalEnrollments = await prisma.enrollment.count();
  const totalCompletedLessons = await prisma.lessonProgress.count({ where: { completed: true } });

  return (
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-[#e76e55]/6 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#209cee]/6 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e76e55]/40 to-transparent" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px] xl:items-center">
            <div className="max-w-2xl">
              <p className="font-pixel text-[9px] text-[#e76e55]">Admin Area</p>
              <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl lg:text-4xl">
                Platform command center
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#8b949e] sm:text-base">
                Monitor the health of Paidevia, review learning activity, and
                manage users and courses from a structured admin workspace.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin/users"
                  className="inline-flex items-center justify-center rounded-xl bg-[#209cee] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(32,156,238,0.3)] transition duration-200 hover:bg-[#1786c9] hover:-translate-y-0.5"
                >
                  Manage Users
                </Link>
                <Link
                  href="/admin/courses"
                  className="inline-flex items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b] hover:-translate-y-0.5"
                >
                  Manage Courses
                </Link>
              </div>
            </div>

            <aside className="rounded-xl border border-[#30363d] bg-[#21262d] p-5">
              <p className="font-pixel text-[8px] text-[#6e7681]">Admin Snapshot</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "User growth", value: `${totalUsers} accounts tracked` },
                  { label: "Course inventory", value: `${totalCourses} courses visible` },
                  { label: "Learning activity", value: `${totalCompletedLessons} lessons completed` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-3.5">
                    <p className="text-xs font-medium text-[#8b949e]">{item.label}</p>
                    <p className="mt-1.5 text-lg font-bold text-[#e6edf3]">{item.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Users" value={totalUsers} detail="Active accounts in the platform" tone="red" />
          <StatCard label="Courses" value={totalCourses} detail="Courses currently available" tone="blue" />
          <StatCard label="Enrollments" value={totalEnrollments} detail="Total course enrollments" tone="amber" />
          <StatCard label="Completed Lessons" value={totalCompletedLessons} detail="Finished lesson records" tone="green" />
        </section>

        {/* Action cards */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/users"
              className="group rounded-xl border border-[#30363d] bg-[#21262d] p-5 transition duration-200 hover:border-[#e76e55]/30 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
            >
              <div className="inline-flex rounded-lg bg-[rgba(231,110,85,0.12)] px-3 py-1 font-pixel text-[8px] text-[#e76e55]">
                Access
              </div>
              <h2 className="font-heading mt-4 text-lg font-semibold text-[#e6edf3]">Manage Users</h2>
              <p className="mt-2 text-sm leading-6 text-[#8b949e]">
                Review users, update roles, and control elevated access.
              </p>
              <p className="mt-5 text-sm font-semibold text-[#e76e55] transition group-hover:translate-x-1">
                Open user management →
              </p>
            </Link>

            <Link
              href="/admin/courses"
              className="group rounded-xl border border-[#30363d] bg-[#21262d] p-5 transition duration-200 hover:border-[#209cee]/30 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
            >
              <div className="inline-flex rounded-lg bg-[rgba(32,156,238,0.12)] px-3 py-1 font-pixel text-[8px] text-[#209cee]">
                Control
              </div>
              <h2 className="font-heading mt-4 text-lg font-semibold text-[#e6edf3]">Manage Courses</h2>
              <p className="mt-2 text-sm leading-6 text-[#8b949e]">
                Review visibility, moderate paths, and track inventory.
              </p>
              <p className="mt-5 text-sm font-semibold text-[#209cee] transition group-hover:translate-x-1">
                Open course management →
              </p>
            </Link>
          </div>

          <aside className="rounded-xl border border-[#30363d] bg-[#21262d] p-5">
            <p className="font-pixel text-[9px] text-[#e76e55]">Operations</p>
            <h2 className="font-heading mt-2 text-lg font-semibold text-[#e6edf3]">Keep the platform steady</h2>
            <p className="mt-3 text-sm leading-7 text-[#8b949e]">
              This admin workspace gives you a clean overview of user growth, course inventory, and learning momentum.
            </p>

            <div className="mt-5 space-y-3">
              {[
                { label: "Role control", value: "Server-side admin checks protect access" },
                { label: "Course moderation", value: "Manage published, draft, and archived states" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#30363d] bg-[#2d333b] px-4 py-4">
                  <p className="font-pixel text-[8px] text-[#6e7681]">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-[#e6edf3]">{item.value}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
