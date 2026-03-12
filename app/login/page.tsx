import Link from "next/link";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 lg:grid-cols-2">
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            Welcome to Paidevia
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Sign in to continue learning
          </h1>

          <p className="mt-4 max-w-md text-blue-100">
            Access your dashboard, continue your lessons, and track your course
            progress across the platform.
          </p>

          <div className="mt-10 space-y-4 text-sm text-blue-50">
            <p>• Continue where you left off</p>
            <p>• Track course progress</p>
            <p>• Access your enrolled courses</p>
          </div>
        </section>

        <section className="p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Authentication
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Sign in
            </h2>

            <p className="mt-3 text-slate-600">
              Choose a provider to access your Paidevia account.
            </p>

            <div className="mt-8 space-y-4">
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/dashboard" });
                }}
              >
                <button
                  type="submit"
                  className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Continue with Google
                </button>
              </form>

              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/dashboard" });
                }}
              >
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
                >
                  Continue with GitHub
                </button>
              </form>
            </div>

            <p className="mt-8 text-sm text-slate-500">
              Email sign-in comes right after we add the database layer.
            </p>

            <Link
              href="/home"
              className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}