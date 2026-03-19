import Link from "next/link";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="grid overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.26),_transparent_26%),linear-gradient(160deg,_#0d1b35_0%,_#17396a_58%,_#1d4ed8_100%)] p-10 text-white sm:p-12">
            <div className="absolute -left-8 top-10 h-28 w-28 rounded-full border-[12px] border-white/10" />
            <div className="absolute bottom-10 right-10 h-36 w-36 rounded-full bg-cyan-400/10 blur-2xl" />

            <div className="relative max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Welcome to Paidevia
              </p>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Sign in to continue learning
              </h1>

              <p className="mt-5 text-sm leading-7 text-slate-200 sm:text-base">
                Access your dashboard, continue lessons, and move through a
                learning experience that now feels much closer to a real LMS
                workspace.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] bg-white/8 px-4 py-5 ring-1 ring-white/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                    Progress
                  </p>
                  <p className="mt-2 text-lg font-semibold">Continue where you left off</p>
                </div>
                <div className="rounded-[24px] bg-white/8 px-4 py-5 ring-1 ring-white/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                    Courses
                  </p>
                  <p className="mt-2 text-lg font-semibold">Resume enrolled learning paths</p>
                </div>
                <div className="rounded-[24px] bg-white/8 px-4 py-5 ring-1 ring-white/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                    Identity
                  </p>
                  <p className="mt-2 text-lg font-semibold">Keep one account across the platform</p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-8 sm:p-10">
            <div className="mx-auto max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                Authentication
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Sign in
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Choose your provider to access Paidevia and jump back into your
                courses, dashboard, and lesson progress.
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
                    className="flex w-full items-center justify-between rounded-[24px] border border-slate-300 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                  >
                    <span>Continue with Google</span>
                    <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      OAuth
                    </span>
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
                    className="flex w-full items-center justify-between rounded-[24px] bg-slate-950 px-5 py-4 text-left text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
                  >
                    <span>Continue with GitHub</span>
                    <span className="rounded-2xl bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                      OAuth
                    </span>
                  </button>
                </form>
              </div>

              <div className="mt-8 rounded-[24px] bg-slate-50 px-5 py-5 ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  Looking ahead
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Email sign-in can plug into this same screen later without
                  changing the visual structure.
                </p>
              </div>

              <Link
                href="/home"
                className="mt-6 inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
