import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getUserByEmail,
  getUserCompletedLessonSlugs,
  markLessonCompleted,
} from "@/lib/lms";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ completedLessons: [] });
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    return NextResponse.json({ completedLessons: [] });
  }

  // This powers the dashboard, course pages, and lesson player progress UI.
  const completedLessons = await getUserCompletedLessonSlugs(user.id);

  return NextResponse.json({ completedLessons });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { courseSlug, lessonSlug } = body;

  if (!courseSlug || !lessonSlug) {
    return NextResponse.json(
      { error: "Missing courseSlug or lessonSlug" },
      { status: 400 }
    );
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      status: true,
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.status !== "published") {
    return NextResponse.json(
      { error: "This course is not available for progress updates" },
      { status: 403 }
    );
  }

  const [enrollment, lesson] = await Promise.all([
    prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      select: {
        id: true,
      },
    }),
    prisma.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId: course.id,
          slug: lessonSlug,
        },
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!enrollment) {
    return NextResponse.json(
      { error: "You must enroll before tracking lesson progress" },
      { status: 403 }
    );
  }

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Progress is stored per user and lesson so resume flows stay consistent.
  await markLessonCompleted(user.id, course.id, lessonSlug);

  // Check if this completion finishes the entire course
  const [allLessons, completedLessons] = await Promise.all([
    prisma.lesson.findMany({ where: { courseId: course.id }, select: { slug: true } }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, courseId: course.id, completed: true },
      select: { lessonSlug: true },
    }),
  ]);

  const completedSlugs = new Set(completedLessons.map((l) => l.lessonSlug));
  const allDone = allLessons.every((l) => completedSlugs.has(l.slug));

  if (allDone && allLessons.length > 0) {
    const courseData = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { title: true },
    });
    const existing = await prisma.notification.findFirst({
      where: { userId: user.id, type: "course_complete", link: `/courses/${courseSlug}` },
    });
    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "course_complete",
          title: "Course completed!",
          message: `You've completed "${courseData?.title ?? courseSlug}". Great work!`,
          link: `/courses/${courseSlug}`,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}
