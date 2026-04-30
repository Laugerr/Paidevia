import { notFound } from "next/navigation";
import LessonPlayerClient from "@/components/LessonPlayerClient";
import { prisma } from "@/lib/prisma";

type LessonPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;

  const lessons = await prisma.lesson.findMany({
    where: {
      slug,
      course: {
        status: "published",
      },
    },
    include: {
      course: {
        include: {
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
    take: 2,
  });

  if (lessons.length !== 1) {
    notFound();
  }

  const [lesson] = lessons;

  return (
    <LessonPlayerClient
      course={{
        id: lesson.course.id,
        slug: lesson.course.slug,
        title: lesson.course.title,
        lessonList: lesson.course.courseLessons,
      }}
      lesson={{
        title: lesson.title,
        slug: lesson.slug,
        summary: lesson.summary,
      }}
    />
  );
}
