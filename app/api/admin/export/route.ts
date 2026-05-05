import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers, totalCourses, publishedCourses, draftCourses, archivedCourses,
    totalEnrollments, totalCompleted, totalAttempts,
    adminCount, instructorCount, studentCount,
    topCourses, recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { status: "published" } }),
    prisma.course.count({ where: { status: "draft" } }),
    prisma.course.count({ where: { status: "archived" } }),
    prisma.enrollment.count(),
    prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.lessonProgress.count(),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { role: "instructor" } }),
    prisma.user.count({ where: { role: "student" } }),
    prisma.course.findMany({
      where: { status: "published" },
      orderBy: { enrollments: { _count: "desc" } },
      take: 10,
      select: {
        title: true, slug: true, level: true, category: true,
        _count: { select: { enrollments: true, courseLessons: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const completionRate = totalAttempts > 0 ? Math.round((totalCompleted / totalAttempts) * 100) : 0;
  const generatedAt = new Date().toISOString();

  const rows: string[] = [];

  const csv = (cols: string[]) => cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",");

  // Section 1: Platform Summary
  rows.push("PLATFORM SUMMARY");
  rows.push(csv(["Metric", "Value"]));
  rows.push(csv(["Generated At", generatedAt]));
  rows.push(csv(["Total Users", String(totalUsers)]));
  rows.push(csv(["Total Courses", String(totalCourses)]));
  rows.push(csv(["Published Courses", String(publishedCourses)]));
  rows.push(csv(["Draft Courses", String(draftCourses)]));
  rows.push(csv(["Archived Courses", String(archivedCourses)]));
  rows.push(csv(["Total Enrollments", String(totalEnrollments)]));
  rows.push(csv(["Lessons Completed", String(totalCompleted)]));
  rows.push(csv(["Completion Rate", `${completionRate}%`]));
  rows.push("");

  // Section 2: Users by Role
  rows.push("USERS BY ROLE");
  rows.push(csv(["Role", "Count"]));
  rows.push(csv(["Students", String(studentCount)]));
  rows.push(csv(["Instructors", String(instructorCount)]));
  rows.push(csv(["Admins", String(adminCount)]));
  rows.push("");

  // Section 3: Top Courses
  rows.push("TOP COURSES BY ENROLLMENT");
  rows.push(csv(["Title", "Slug", "Level", "Category", "Enrollments", "Lessons"]));
  for (const c of topCourses) {
    rows.push(csv([
      c.title, c.slug, c.level, c.category ?? "—",
      String(c._count.enrollments), String(c._count.courseLessons),
    ]));
  }
  rows.push("");

  // Section 4: Recent Users
  rows.push("RECENT USERS (last 20)");
  rows.push(csv(["Name", "Email", "Role", "Joined"]));
  for (const u of recentUsers) {
    rows.push(csv([
      u.name ?? "—", u.email ?? "—", u.role,
      new Date(u.createdAt).toLocaleDateString("en-US"),
    ]));
  }

  const content = rows.join("\r\n");
  const filename = `paidevia-report-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
