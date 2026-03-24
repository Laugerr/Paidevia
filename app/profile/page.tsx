import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isUserRole } from "@/lib/roles";

function toUsername(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s._-]/g, "")
    .replace(/\s+/g, "")
    .replace(/_+/g, "_")
    .replace(/-+/g, "-");
}

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

  const fallbackLetter = (
    user.name?.[0] ??
    user.email?.[0] ??
    "U"
  ).toUpperCase();
  const role = isUserRole(user.role) ? user.role : "student";
  const roleToneClassName =
    role === "admin"
      ? "bg-red-100 text-red-700"
      : role === "instructor"
      ? "bg-amber-100 text-amber-700"
      : "bg-blue-100 text-blue-700";

  const baseIdentity = user.name?.trim() || user.email?.split("@")[0] || "user";
  const username = toUsername(baseIdentity) || "user";
  const [firstName = "", ...restName] = (user.name ?? "").trim().split(/\s+/).filter(Boolean);
  const lastName = restName.join(" ");
  const profileUrl = `/u/${username}`;

  const fields = [
    { label: "First Name", value: firstName || "Not set" },
    { label: "Last Name", value: lastName || "Not set" },
    { label: "Nickname", value: `@${username}` },
    { label: "Email", value: user.email ?? "Not set" },
  ];

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.75),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(224,231,255,0.8),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-200/25 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                {user.image ? (
                  <img
                    src={user.image}
                    alt="Profile avatar"
                    className="h-24 w-24 rounded-[28px] object-cover ring-2 ring-white shadow-lg shadow-slate-900/10 sm:h-28 sm:w-28"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-orange-400 to-pink-500 text-3xl font-bold text-white ring-2 ring-white shadow-lg shadow-slate-900/10 sm:h-28 sm:w-28">
                    {fallbackLetter}
                  </div>
                )}
              </div>

              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                  Identity
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  {user.name ?? "User"}
                </h1>
                <p className="mt-2 text-lg font-medium text-slate-600">
                  @{username}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500 sm:text-base">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                Active Profile
              </span>
              <div className="rounded-2xl bg-white/88 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                {profileUrl}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_320px]">
          <section className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Account Fields
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Profile details
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                A cleaner identity layout designed for future profile editing and
                public account URLs.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.label} className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {field.label}
                  </label>
                  <div className="flex min-h-[68px] items-center rounded-[22px] bg-slate-50/80 px-4 py-4 text-base font-medium text-slate-900 ring-1 ring-slate-200/70">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Account Meta
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Identity details
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Joined
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Role
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${roleToneClassName}`}
                  >
                    {role}
                  </span>
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Account ID
                </p>
                <p className="mt-2 break-all text-sm leading-7 text-slate-600">
                  {user.id}
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
