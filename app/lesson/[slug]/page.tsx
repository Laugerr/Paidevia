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

  const lesson = await prisma.lesson.findFirst({
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
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!lesson) {
    notFound();
  }

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
