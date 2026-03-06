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
        <h1 className="text-4xl font-bold text-gray-900">Course Not Found</h1>
        <p className="mt-4 text-gray-600">
          The course you are looking for does not exist.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          {course.level}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          {course.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          {course.description}
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">Course Lessons</h2>
        <ul className="mt-6 space-y-3">
          {course.lessonList.map((lesson, index) => (
            <li
              key={lesson}
              className="rounded-lg border border-gray-100 px-4 py-3 text-gray-700"
            >
              Lesson {index + 1} — {lesson}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}