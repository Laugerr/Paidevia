import { notFound } from "next/navigation";
import CourseDetailClient from "@/components/CourseDetailClient";
import { prisma } from "@/lib/prisma";

type CoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;

  const foundCourse = await prisma.course.findFirst({
    where: {
      slug,
      status: "published",
    },
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
  });

  if (!foundCourse) {
    notFound();
  }

  return (
    <CourseDetailClient
      course={{
        id: foundCourse.id,
        slug: foundCourse.slug,
        title: foundCourse.title,
        description: foundCourse.description,
        level: foundCourse.level,
        lessons: foundCourse.courseLessons.length,
        lessonList: foundCourse.courseLessons,
      }}
    />
  );
}
