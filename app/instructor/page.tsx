import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "blue" | "amber" | "green";
}) {
  const toneClassName =
    tone === "blue"
      ? "bg-blue-100 text-blue-600"
      : tone === "amber"
      ? "bg-amber-100 text-amber-600"
      : "bg-emerald-100 text-emerald-600";

  return (
    <article className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div
        className={`inline-flex rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${toneClassName}`}
      >
        Live
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
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
      name: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "instructor") {
    redirect("/dashboard");
  }

  const totalCourses = await prisma.course.count();
  const publishedCourses = await prisma.course.count({
    where: {
      status: "published",
    },
  });
  const totalEnrollments = await prisma.enrollment.count();

  const firstName = user.name?.split(" ")[0] ?? "Instructor";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[32px] border border-amber-100 bg-[radial-gradient(circle_at_left,_rgba(253,224,71,0.22),_transparent_28%),linear-gradient(135deg,_#fffaf0_0%,_#ffffff_58%,_#eef6ff_100%)] p-8">
              <div className="absolute -left-4 top-7 h-24 w-24 rounded-full border-[10px] border-amber-200/40" />

              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Instructor Area
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Welcome, {firstName}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  This is the protected instructor workspace. It gives the new
                  role a dedicated home before we add course creation, lesson
                  management, and publishing flows.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/courses"
                    className="rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0ea5e9_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                  >
                    View Course Catalog
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <StatCard label="Courses in system" value={totalCourses} tone="blue" />
              <StatCard label="Published courses" value={publishedCourses} tone="green" />
              <StatCard label="Enrollments" value={totalEnrollments} tone="amber" />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="inline-flex rounded-2xl bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                  Next
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                  Create course flow
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The next upgrade here is a draft-course creation form backed by
                  Prisma so instructors can start building real content.
                </p>
              </article>

              <article className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="inline-flex rounded-2xl bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
                  Roadmap
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                  Lesson management
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  After course creation, we can add lesson CRUD, ordering, and
                  publish readiness checks inside this workspace.
                </p>
              </article>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-amber-100 bg-[radial-gradient(circle_at_top_right,_rgba(253,224,71,0.22),_transparent_30%),linear-gradient(135deg,_#ffffff_0%,_#fffaf0_100%)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                Role Active
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Instructor access enabled
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Navigation now exposes the instructor area only for instructor
                accounts, and the route is protected with a server-side role
                check.
              </p>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Ready For
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Version 3
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">Draft course creation</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">Course editing</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">Lesson builder and publishing</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
