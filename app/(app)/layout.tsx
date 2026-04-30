import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Unauthenticated: render page directly (each page handles its own auth redirect)
  if (!session?.user?.email) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {children}
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, name: true, image: true, email: true },
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        userRole={user?.role ?? null}
        userName={user?.name ?? session.user.name ?? null}
        userImage={user?.image ?? session.user.image ?? null}
        userEmail={user?.email ?? session.user.email ?? null}
      />
      <div style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
