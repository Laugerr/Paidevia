import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-white px-8 py-20 text-center shadow-sm ring-1 ring-slate-200">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Modern Learning Starts Here
        </p>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
          Welcome to Paidevia
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-slate-600">
          A modern Learning Management System designed for structured courses,
          interactive lessons, and scalable education platforms.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/courses"
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Explore Courses
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Structured Courses
          </h2>
          <p className="text-slate-600">
            Organize lessons clearly for a better and more focused learning experience.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Interactive Lessons
          </h2>
          <p className="text-slate-600">
            Combine videos, lesson content, and progress tracking in one place.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Scalable Platform
          </h2>
          <p className="text-slate-600">
            Built to grow from a simple LMS into a complete education platform.
          </p>
        </div>
      </section>
    </main>
  );
}