import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import { signIn } from "@/auth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M21.805 12.23c0-.76-.068-1.49-.195-2.19H12v4.146h5.49a4.696 4.696 0 0 1-2.038 3.08v2.557h3.297c1.93-1.777 3.056-4.398 3.056-7.593Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.075-.915 6.767-2.477l-3.297-2.557c-.915.613-2.085.976-3.47.976-2.67 0-4.932-1.803-5.74-4.227H2.85v2.638A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.26 13.715A5.996 5.996 0 0 1 5.94 12c0-.595.108-1.172.32-1.715V7.647H2.85A10 10 0 0 0 2 12c0 1.61.385 3.133 1.068 4.353l3.19-2.638Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.057c1.5 0 2.846.516 3.905 1.528l2.93-2.93C17.07 2.992 14.755 2 12 2a10 10 0 0 0-9.15 5.647l3.41 2.638C7.068 7.86 9.33 6.057 12 6.057Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.08 1.84 2.82 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.48-1.33-5.48-5.94 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.32c1.02 0 2.05.14 3.01.42 2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.9 1.24 3.22 0 4.62-2.82 5.63-5.5 5.93.43.37.82 1.1.82 2.22v3.28c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function FeaturePill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/10 px-4 py-4 ring-1 ring-white/15 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-white/90">{value}</p>
    </div>
  );
}

function ProviderButton({
  label,
  accent,
  icon,
  action,
}: {
  label: string;
  accent: string;
  icon: ReactElement;
  action: () => Promise<void>;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="flex w-full items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]"
      >
        <span className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}
          >
            {icon}
          </span>
          <span>{label}</span>
        </span>
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-white/70 bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.45),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,0.94)_100%)] p-3 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-4">
        <div className="grid overflow-hidden rounded-[34px] border border-white/80 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.28),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(191,219,254,0.22),_transparent_22%),linear-gradient(160deg,_#0f172a_0%,_#142f57_54%,_#2563eb_100%)] p-8 text-white sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.14),transparent_16%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.12),transparent_18%)]" />
            <div className="absolute -right-12 top-10 h-40 w-40 rounded-full border border-white/10" />
            <div className="absolute bottom-8 left-8 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/paidevia_logo.png"
                  alt="Paidevia logo"
                  width={128}
                  height={36}
                  className="h-10 w-auto object-contain"
                  priority
                />
                <div>
                  <p className="text-2xl font-semibold tracking-tight">Paidevia</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
                    Learning Platform
                  </p>
                </div>
              </div>

              <div className="mt-12 max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
                  Welcome Back
                </p>

                <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Sign in to keep your learning momentum going
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-200 sm:text-base">
                  Re-enter your workspace, continue active lessons, and keep your
                  progress moving inside a cleaner, premium LMS experience.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <FeaturePill
                  label="Dashboard"
                  value="Jump back into your learning workspace."
                />
                <FeaturePill
                  label="Progress"
                  value="Resume lessons without losing momentum."
                />
                <FeaturePill
                  label="Account"
                  value="Use one identity across the platform."
                />
              </div>
            </div>
          </section>

          <section className="flex items-center p-8 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Authentication
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Access your account
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Choose your preferred provider to continue to your dashboard,
                courses, and lesson history.
              </p>

              <div className="mt-8 space-y-4">
                <ProviderButton
                  label="Continue with Google"
                  accent="bg-white ring-1 ring-slate-200 shadow-sm"
                  icon={<GoogleIcon />}
                  action={async () => {
                    "use server";
                    await signIn("google", { redirectTo: "/dashboard" });
                  }}
                />

                <ProviderButton
                  label="Continue with GitHub"
                  accent="bg-slate-950 text-white ring-1 ring-slate-900"
                  icon={<GitHubIcon />}
                  action={async () => {
                    "use server";
                    await signIn("github", { redirectTo: "/dashboard" });
                  }}
                />
              </div>

              <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-sm font-medium text-slate-500">
                  Looking ahead
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This layout is ready for future email sign-in or passwordless
                  auth without needing to change the overall structure.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/home"
                  className="inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50"
                >
                  Back to Home
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-slate-100"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
