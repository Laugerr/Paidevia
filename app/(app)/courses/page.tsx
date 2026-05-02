import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CoursesClient from "@/components/CoursesClient";

export default async function CoursesPage() {
  const session = await auth();

  const [courses, totalEnrollments, userEnrollments] = await Promise.all([
    prisma.course.findMany({
      where: { status: "published", courseLessons: { some: {} } },
      select: {
        slug: true,
        title: true,
        description: true,
        level: true,
        instructor: { select: { name: true } },
        _count: { select: { courseLessons: true, enrollments: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.enrollment.count(),
    session?.user?.email
      ? prisma.enrollment.findMany({
          where: { user: { email: session.user.email } },
          select: { course: { select: { slug: true } } },
        })
      : [],
  ]);

  const enrolledSlugs = userEnrollments.map((e) => e.course.slug);

  const shaped = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    description: c.description,
    level: c.level,
    lessonCount: c._count.courseLessons,
    enrollmentCount: c._count.enrollments,
    instructorName: c.instructor?.name ?? null,
  }));

  return (
    <CoursesClient
      courses={shaped}
      enrolledSlugs={enrolledSlugs}
      totalEnrollments={totalEnrollments}
    />
  );
}
