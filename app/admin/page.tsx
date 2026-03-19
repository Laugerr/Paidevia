import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
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

  return (
    <article className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className={`inline-flex rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${toneClassName}`}>
        Live
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
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

  if (user.role !== "admin") {
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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_340px]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[32px] border border-red-100 bg-[radial-gradient(circle_at_left,_rgba(252,165,165,0.24),_transparent_26%),linear-gradient(135deg,_#fff7f7_0%,_#ffffff_60%,_#eff6ff_100%)] p-8">
              <div className="absolute -left-4 top-7 h-24 w-24 rounded-full border-[10px] border-red-200/40" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">
                  Admin Area
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Platform command center
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Monitor the health of Paidevia, manage people and courses,
                  and keep the LMS running with a cleaner dashboard experience
                  that matches the new shared shell.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/admin/users"
                    className="rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0ea5e9_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                  >
                    Manage Users
                  </Link>
                  <Link
                    href="/admin/courses"
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    Manage Courses
                  </Link>
                </div>
              </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Users" value={totalUsers} tone="red" />
              <StatCard label="Courses" value={totalCourses} tone="blue" />
              <StatCard label="Enrollments" value={totalEnrollments} tone="amber" />
              <StatCard
                label="Completed Lessons"
                value={totalCompletedLessons}
                tone="green"
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Link
                href="/admin/users"
                className="group rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
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
                className="group rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              >
                <div className="inline-flex rounded-2xl bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                  Control
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                  Manage Courses
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Review course visibility, track enrollment activity, and
                  moderate which learning paths are live.
                </p>
                <p className="mt-6 text-sm font-semibold text-blue-600 transition group-hover:translate-x-1">
                  Open course management
                </p>
              </Link>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-red-100 bg-[radial-gradient(circle_at_top_right,_rgba(252,165,165,0.3),_transparent_30%),linear-gradient(135deg,_#ffffff_0%,_#fff7f7_100%)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-600">
                Admin Notes
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Keep operations steady
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The admin area is now visually aligned with the new platform
                shell. Next we can keep extending this same system into the rest
                of the LMS surfaces.
              </p>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Snapshot
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Today
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">User growth</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {totalUsers} accounts tracked
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">Course inventory</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {totalCourses} courses visible to admins
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">Learning activity</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {totalCompletedLessons} lessons completed
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
