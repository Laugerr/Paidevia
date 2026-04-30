import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminUsersTable from "@/components/AdminUsersTable";
import { DEFAULT_USER_ROLE, isAdminRole, isUserRole } from "@/lib/roles";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!currentUser) {
    redirect("/login");
  }

  if (!isAdminRole(currentUser.role)) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      image: true,
    },
  });

  const normalizedUsers = users.map((user) => ({
    ...user,
    role: isUserRole(user.role) ? user.role : DEFAULT_USER_ROLE,
  }));

  return (
    <AdminUsersTable users={normalizedUsers} currentUserId={currentUser.id} />
  );
}
