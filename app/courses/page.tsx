import Link from "next/link";

const courses = [
  {
    id: 1,
    title: "Cybersecurity Fundamentals",
    description: "Learn the foundations of cybersecurity, threats, and defense concepts.",
    lessons: 12,
  },
  {
    id: 2,
    title: "Introduction to Web Development",
    description: "Understand HTML, CSS, JavaScript, and modern frontend basics.",
    lessons: 18,
  },
  {
    id: 3,
    title: "Python for Beginners",
    description: "Start coding with Python and build confidence through practice.",
    lessons: 15,
  },
];

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Courses</h1>
        <p className="mt-3 text-lg text-gray-600">
          Explore available learning paths on Paidevia.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const slug = course.title.toLowerCase().replace(/\s+/g, "-");

          return (
            <Link key={course.id} href={`/courses/${slug}`}>
              <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <h2 className="mb-3 text-xl font-semibold text-gray-900">
                  {course.title}
                </h2>
                <p className="mb-4 text-gray-600">{course.description}</p>
                <p className="text-sm font-medium text-gray-500">
                  {course.lessons} lessons
                </p>
              </article>
            </Link>
          );
        })}
      </section>
    </main>
  );
}