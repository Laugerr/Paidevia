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
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await markLessonCompleted(user.id, course.id, lessonSlug);

  return NextResponse.json({ success: true });
}