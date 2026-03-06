type Props = {
  params: {
    slug: string;
  };
};

export default function CoursePage({ params }: Props) {
  const { slug } = params;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold capitalize">
        {slug.replace(/-/g, " ")}
      </h1>

      <p className="mt-4 text-lg text-gray-600">
        This is the course detail page.
      </p>

      <div className="mt-10 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Course Lessons</h2>

        <ul className="mt-4 space-y-2 text-gray-700">
          <li>Lesson 1 — Introduction</li>
          <li>Lesson 2 — Core Concepts</li>
          <li>Lesson 3 — Practical Example</li>
        </ul>
      </div>
    </main>
  );
}