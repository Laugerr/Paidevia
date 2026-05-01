import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

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
    <AppShell
      userRole={user?.role ?? null}
      userName={user?.name ?? session.user.name ?? null}
      userImage={user?.image ?? session.user.image ?? null}
      userEmail={user?.email ?? session.user.email ?? null}
    >
      {children}
    </AppShell>
  );
}
