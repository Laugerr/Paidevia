import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardContent from "@/components/DashboardContent";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [enrollments, publishedCourses, progress] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        userId: user.id,
        course: {
          status: "published",
        },
      },
      select: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            level: true,
            courseLessons: {
              orderBy: {
                position: "asc",
              },
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.course.findMany({
      where: {
        status: "published",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        level: true,
        courseLessons: {
          orderBy: {
            position: "asc",
          },
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
    }),
    prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        completed: true,
      },
      select: {
        lessonSlug: true,
      },
    }),
  ]);

  const normalizeCourse = (course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    level: string;
    courseLessons: Array<{
      title: string;
      slug: string;
    }>;
  }) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    level: course.level,
    lessonList: course.courseLessons,
  });

  const enrolledCourses = enrollments
    .map((enrollment) => normalizeCourse(enrollment.course))
    .filter((course) => course.lessonList.length > 0);

  const recommendedCourses = publishedCourses
    .map(normalizeCourse)
    .filter((course) => course.lessonList.length > 0);

  const completedLessons = progress.map((item) => item.lessonSlug);

  const currentLesson =
    enrolledCourses
      .flatMap((course) => course.lessonList)
      .find((lesson) => !completedLessons.includes(lesson.slug))?.slug ?? null;

  return (
    <DashboardContent
      userName={user.name}
      enrolledCourses={enrolledCourses}
      recommendedCourses={recommendedCourses}
      completedLessons={completedLessons}
      currentLesson={currentLesson}
    />
  );
}
