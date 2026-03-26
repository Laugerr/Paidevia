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
  const toneClassName =
    tone === "red"
      ? "bg-red-100 text-red-600"
      : tone === "blue"
      ? "bg-blue-100 text-blue-600"
      : tone === "amber"
      ? "bg-amber-100 text-amber-600"
      : "bg-emerald-100 text-emerald-600";

  const progressToneClassName =
    tone === "red"
      ? "from-red-500 to-rose-400"
      : tone === "blue"
      ? "from-blue-600 to-sky-400"
      : tone === "amber"
      ? "from-amber-500 to-orange-400"
      : "from-emerald-500 to-teal-400";

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)] sm:p-6">
      <span
        className={`inline-flex rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${toneClassName}`}
      >
        Live
      </span>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full w-2/3 rounded-full bg-gradient-to-r ${progressToneClassName}`}
        />
      </div>
    </article>
  );
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Keep the admin area protected at the page boundary before loading stats.
  if (!isAdminRole(user.role)) {
    redirect("/dashboard");
  }

  const totalUsers = await prisma.user.count();
  const totalCourses = await prisma.course.count();
  const totalEnrollments = await prisma.enrollment.count();
  const totalCompletedLessons = await prisma.lessonProgress.count({
    where: {
      completed: true,
    },
  });

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 lg:space-y-7">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(252,165,165,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.72),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-red-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-blue-200/25 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_340px] xl:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600">
                Admin Area
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Platform command center
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Monitor the health of Paidevia, review learning activity, and
                manage users and courses from a cleaner, more structured admin
                workspace.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin/users"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Manage Users
                </Link>
                <Link
                  href="/admin/courses"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/92 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  Manage Courses
                </Link>
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/90 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Admin Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">User growth</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {totalUsers} accounts tracked
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">
                    Course inventory
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {totalCourses} courses visible
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-sm font-medium text-slate-500">
                    Learning activity
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {totalCompletedLessons} lessons completed
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Users"
            value={totalUsers}
            detail="Active accounts in the platform"
            tone="red"
          />
          <StatCard
            label="Courses"
            value={totalCourses}
            detail="Courses currently available to admins"
            tone="blue"
          />
          <StatCard
            label="Enrollments"
            value={totalEnrollments}
            detail="Total course enrollments recorded"
            tone="amber"
          />
          <StatCard
            label="Completed Lessons"
            value={totalCompletedLessons}
            detail="Finished lesson records in the LMS"
            tone="green"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <section className="grid gap-6 md:grid-cols-2">
            <Link
              href="/admin/users"
              className="group rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
            >
              <div className="inline-flex rounded-2xl bg-red-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-600">
                Access
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                Manage Users
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Review registered users, update roles, and control who has
                elevated access across the platform.
              </p>
              <p className="mt-6 text-sm font-semibold text-red-600 transition group-hover:translate-x-1">
                Open user management
              </p>
            </Link>

            <Link
              href="/admin/courses"
              className="group rounded-[30px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
            >
              <div className="inline-flex rounded-2xl bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                Control
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                Manage Courses
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Review course visibility, moderate learning paths, and track how
                the course inventory is evolving.
              </p>
              <p className="mt-6 text-sm font-semibold text-blue-600 transition group-hover:translate-x-1">
                Open course management
              </p>
            </Link>
          </section>

          <aside className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-600">
              Operations
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Keep the platform steady
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This admin workspace is designed to give you a clean overview of
              user growth, course inventory, and learning momentum before you
              move into deeper management tasks.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                <p className="text-sm font-medium text-slate-500">
                  Role control
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  Protect access with server-side admin checks
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                <p className="text-sm font-medium text-slate-500">
                  Course moderation
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  Manage published, draft, and archived states
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
