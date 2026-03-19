import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardContent from "@/components/DashboardContent";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardContent
      userName={session.user.name}
      userImage={session.user.image}
    />
  );
}
