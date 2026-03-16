import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminCoursesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      role: true,
    },
  });

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      enrollments: true,
      progress: {
        where: {
          completed: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Admin Area
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Course Management
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          View all courses and monitor their activity across the platform.
        </p>

        <div className="mt-6">
          <Link
            href="/admin"
            className="inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Lessons
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Enrollments
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Completed Lessons
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Link
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {course.title}
                      </p>
                      <p className="text-sm text-slate-500">{course.slug}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {course.level}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {course.lessons}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {course.enrollments.length}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {course.progress.length}
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      Open Course
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}