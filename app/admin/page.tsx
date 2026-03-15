import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Admin Area
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          Manage the Paidevia platform and monitor key system statistics.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Users</h2>
          <p className="mt-3 text-3xl font-bold text-red-600">
            {totalUsers}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
          <p className="mt-3 text-3xl font-bold text-red-600">
            {totalCourses}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Enrollments
          </h2>
          <p className="mt-3 text-3xl font-bold text-red-600">
            {totalEnrollments}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Completed Lessons
          </h2>
          <p className="mt-3 text-3xl font-bold text-red-600">
            {totalCompletedLessons}
          </p>
        </div>
      </section>
    </main>
  );
}