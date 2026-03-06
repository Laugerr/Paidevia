import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
          Modern Learning Starts Here
        </p>

        <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900">
          Welcome to Paidevia
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          A modern Learning Management System designed for structured courses,
          interactive lessons, and scalable education platforms.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/courses"
            className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800"
          >
            Explore Courses
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-900 transition hover:bg-gray-100"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Structured Courses</h2>
          <p className="text-gray-600">
            Organize lessons clearly for a better and more focused learning experience.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Interactive Lessons</h2>
          <p className="text-gray-600">
            Combine videos, lesson content, and progress tracking in one place.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Scalable Platform</h2>
          <p className="text-gray-600">
            Built to grow from a simple LMS into a complete education platform.
          </p>
        </div>
      </section>
    </main>
  );
}