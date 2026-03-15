import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Account
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          View your account details and learning identity on Paidevia.
        </p>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24">
            {user.image ? (
              <img
                src={user.image}
                alt="Profile avatar"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-slate-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-600 ring-2 ring-slate-200">
                {fallbackLetter}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {user.name ?? "Student"}
            </h2>
            <p className="mt-1 text-slate-600">{user.email}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Full Name</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {user.name ?? "Not provided"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Email Address</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Account ID</p>
            <p className="mt-2 break-all text-sm font-medium text-slate-900">
              {user.id}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Joined</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}