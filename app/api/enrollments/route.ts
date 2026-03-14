import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserByEmail, getUserEnrolledCourseSlugs } from "@/lib/lms";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ enrolledCourses: [] });
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    return NextResponse.json({ enrolledCourses: [] });
  }

  const enrolledCourses = await getUserEnrolledCourseSlugs(user.id);

  return NextResponse.json({ enrolledCourses });
}