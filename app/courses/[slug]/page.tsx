import Link from "next/link";
import { courses } from "@/lib/courses";

type CoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = courses.find((course) => course.slug === slug);

  if (!course) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Course Not Found
          </h1>
          <p className="mt-4 text-slate-600">
            The course you are looking for does not exist.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {course.level}
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {course.title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {course.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {course.lessons} lessons
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Self-paced
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Certificate later
            </span>
          </div>
        </div>

        <aside className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900">
            Course Access
          </h2>
          <p className="mt-4 text-slate-600">
            Enroll in this course and start learning step by step through structured lessons.
          </p>

          <button className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700">
            Enroll Now
          </button>

          <Link
            href="/dashboard"
            className="mt-3 block w-full rounded-xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Go to Dashboard
          </Link>
        </aside>
      </section>

      <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">
          Course Lessons
        </h2>
        <p className="mt-2 text-slate-600">
          Follow the lessons in order and build your knowledge progressively.
        </p>

        <ul className="mt-8 space-y-4">
          {course.lessonList.map((lesson, index) => (
            <li
              key={lesson}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:bg-slate-100"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Lesson {index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {lesson}
                  </h3>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
                  Preview
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}