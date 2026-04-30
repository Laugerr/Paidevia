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
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const fallbackLetter = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();
  const role = isUserRole(user.role) ? user.role : "student";
  const roleTone =
    role === "admin"
      ? "bg-[rgba(231,110,85,0.12)] text-[#e76e55]"
      : role === "instructor"
      ? "bg-[rgba(247,213,29,0.12)] text-[#f7d51d]"
      : "bg-[rgba(32,156,238,0.12)] text-[#209cee]";

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
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Header */}
        <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-[#209cee]/8 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#a78bfa]/6 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#209cee]/40 to-transparent" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                {user.image ? (
                  <img
                    src={user.image}
                    alt="Profile avatar"
                    className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[#30363d] sm:h-24 sm:w-24"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#209cee] to-[#a78bfa] text-2xl font-bold text-white ring-2 ring-[#30363d] sm:h-24 sm:w-24">
                    {fallbackLetter}
                  </div>
                )}
              </div>

              <div className="max-w-xl">
                <p className="font-pixel text-[9px] text-[#209cee]">Identity</p>
                <h1 className="font-heading mt-3 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl lg:text-4xl">
                  {user.name ?? "User"}
                </h1>
                <p className="mt-1.5 text-base font-medium text-[#8b949e]">@{username}</p>
                <p className="mt-1 text-sm text-[#6e7681]">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <span className="inline-flex rounded-xl border border-[#30363d] bg-[#21262d] px-3 py-2 font-pixel text-[8px] text-[#8b949e]">
                Active Profile
              </span>
              <div className="rounded-xl border border-[#30363d] bg-[#21262d] px-3 py-2 text-sm font-medium text-[#8b949e]">
                {profileUrl}
              </div>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_280px]">
          <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:p-7">
            <p className="font-pixel text-[9px] text-[#209cee]">Account Fields</p>
            <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3] sm:text-2xl">
              Profile details
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#8b949e]">
              Identity layout designed for future profile editing and public account URLs.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.label} className="space-y-2">
                  <label className="font-pixel text-[8px] text-[#6e7681]">{field.label}</label>
                  <div className="flex min-h-[56px] items-center rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-3 text-sm font-medium text-[#e6edf3]">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <p className="font-pixel text-[9px] text-[#209cee]">Account Meta</p>
            <h2 className="font-heading mt-2 text-xl font-bold tracking-tight text-[#e6edf3]">
              Identity details
            </h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-4">
                <p className="font-pixel text-[8px] text-[#6e7681]">Joined</p>
                <p className="mt-2 text-lg font-bold text-[#e6edf3]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-4">
                <p className="font-pixel text-[8px] text-[#6e7681]">Role</p>
                <div className="mt-2">
                  <span className={`inline-flex rounded-lg px-3 py-1.5 font-pixel text-[8px] ${roleTone}`}>
                    {role}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-4">
                <p className="font-pixel text-[8px] text-[#6e7681]">Account ID</p>
                <p className="mt-2 break-all text-xs leading-6 text-[#8b949e]">{user.id}</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
