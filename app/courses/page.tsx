import Link from "next/link";
import { courses } from "@/lib/courses";

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Learning Paths
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Courses
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Explore available learning paths on Paidevia.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.slug}`}>
            <article className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-md">
              <p className="mb-3 text-sm font-medium text-blue-600">
                {course.level}
              </p>

              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                {course.title}
              </h2>

              <p className="mb-4 text-slate-600">{course.description}</p>

              <p className="text-sm font-medium text-slate-500">
                {course.lessons} lessons
              </p>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}