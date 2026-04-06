import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { enrollUserInCourse, getUserByEmail } from "@/lib/lms";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { courseSlug } = body;

  if (!courseSlug) {
    return NextResponse.json({ error: "Missing courseSlug" }, { status: 400 });
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
      _count: {
        select: {
          courseLessons: true,
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.status !== "published") {
    return NextResponse.json(
      { error: "This course is not available for enrollment" },
      { status: 403 }
    );
  }

  if (course._count.courseLessons < 1) {
    return NextResponse.json(
      { error: "This course does not have any public lessons yet" },
      { status: 409 }
    );
  }

  await enrollUserInCourse(user.id, course.id);

  return NextResponse.json({ success: true });
}
