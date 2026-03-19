import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isUserRole } from "@/lib/roles";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const fallbackLetter = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();
  const role = isUserRole(user.role) ? user.role : "student";
  const roleToneClassName =
    role === "admin"
      ? "bg-red-100 text-red-700"
      : role === "instructor"
      ? "bg-amber-100 text-amber-700"
      : "bg-blue-100 text-blue-700";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[32px] border border-cyan-100 bg-[radial-gradient(circle_at_left,_rgba(125,211,252,0.28),_transparent_26%),linear-gradient(135deg,_#f4fbff_0%,_#ffffff_58%,_#eef6ff_100%)] p-8">
              <div className="absolute -left-4 top-7 h-24 w-24 rounded-full border-[10px] border-cyan-200/40" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative h-28 w-28">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="Profile avatar"
                      className="h-28 w-28 rounded-[28px] object-cover ring-2 ring-white shadow-lg shadow-slate-900/10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-orange-400 to-pink-500 text-3xl font-bold text-white ring-2 ring-white shadow-lg shadow-slate-900/10">
                      {fallbackLetter}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                    Account
                  </p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    {user.name ?? "Student"}
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    View your identity, access level, and core account details
                    inside the refreshed Paidevia shell.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${roleToneClassName}`}
                    >
                      {role}
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm ring-1 ring-slate-200">
                      Active Account
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-medium text-slate-500">Full Name</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  {user.name ?? "Not provided"}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-medium text-slate-500">Email Address</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  {user.email}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-medium text-slate-500">Account ID</p>
                <p className="mt-3 break-all text-sm font-medium leading-6 text-slate-900">
                  {user.id}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-medium text-slate-500">Joined</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-cyan-100 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.8),_transparent_34%),linear-gradient(135deg,_#ffffff_0%,_#f8fbff_100%)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                Identity Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white/90 px-4 py-4 ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Role</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {role}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 px-4 py-4 ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Auth Provider</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    OAuth
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 px-4 py-4 ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Platform</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    Paidevia
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Notes
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Account settings can grow here
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This panel is ready for future profile editing, passwordless
                settings, connected identities, and instructor/admin account
                preferences.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
