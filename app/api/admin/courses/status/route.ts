import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      role: true,
    },
  });

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { courseId, status } = body;

  if (!courseId || !status) {
    return NextResponse.json(
      { error: "Missing courseId or status" },
      { status: 400 }
    );
  }

  if (!["draft", "published", "archived"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: { status },
    select: {
      id: true,
      status: true,
    },
  });

  return NextResponse.json({
    success: true,
    course: updatedCourse,
  });
}