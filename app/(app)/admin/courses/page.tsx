import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminCoursesTable from "@/components/AdminCoursesTable";

export default async function AdminCoursesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
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
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      enrollments: true,
      progress: {
        where: {
          completed: true,
        },
      },
    },
  });

  return <AdminCoursesTable courses={courses} />;
}