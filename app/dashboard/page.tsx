export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Student Area
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Track your enrolled courses and learning progress.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Enrolled Courses</h2>
          <p className="mt-3 text-3xl font-bold text-blue-600">3</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Completed Lessons</h2>
          <p className="mt-3 text-3xl font-bold text-blue-600">8</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Progress</h2>
          <p className="mt-3 text-3xl font-bold text-blue-600">42%</p>
        </div>
      </section>
    </main>
  );
}