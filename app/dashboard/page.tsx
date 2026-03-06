export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-3 text-lg text-gray-600">
          Track your enrolled courses and learning progress.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Enrolled Courses</h2>
          <p className="mt-3 text-3xl font-bold">3</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Completed Lessons</h2>
          <p className="mt-3 text-3xl font-bold">8</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Progress</h2>
          <p className="mt-3 text-3xl font-bold">42%</p>
        </div>
      </section>
    </main>
  );
}