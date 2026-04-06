import { prisma } from "@/lib/prisma";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserEnrolledCourseSlugs(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      course: {
        status: "published",
      },
    },
    include: {
      course: true,
    },
  });

  return enrollments.map((enrollment) => enrollment.course.slug);
}

export async function getUserCompletedLessonSlugs(userId: string) {
  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId,
      completed: true,
      course: {
        status: "published",
      },
    },
  });

  return progress.map((item) => item.lessonSlug);
}

export async function enrollUserInCourse(userId: string, courseId: string) {
  return prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {},
    create: {
      userId,
      courseId,
    },
  });
}

export async function markLessonCompleted(
  userId: string,
  courseId: string,
  lessonSlug: string
) {
  return prisma.lessonProgress.upsert({
    where: {
      userId_lessonSlug: {
        userId,
        lessonSlug,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
      courseId,
    },
    create: {
      userId,
      courseId,
      lessonSlug,
      completed: true,
      completedAt: new Date(),
    },
  });
}
