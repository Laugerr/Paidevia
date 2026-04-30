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

function FeaturePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm">
      <p className="font-pixel text-[8px] text-[#209cee]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-white/80">{value}</p>
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
        className="flex w-full items-center justify-between rounded-xl border border-[#30363d] bg-[#21262d] px-5 py-4 text-left text-sm font-semibold text-[#e6edf3] transition duration-200 hover:border-[#3d444d] hover:bg-[#2d333b] hover:-translate-y-0.5"
      >
        <span className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
            {icon}
          </span>
          <span>{label}</span>
        </span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#6e7681]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="px-3 py-8 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left panel */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0e2040] to-[#0a1628] p-7 text-white sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(32,156,238,0.18),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(146,204,65,0.08),transparent_35%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#209cee]/60 to-transparent" />
            <div className="absolute -right-12 top-10 h-40 w-40 rounded-full border border-white/5" />
            <div className="absolute bottom-8 left-8 h-24 w-24 rounded-full bg-[#209cee]/8 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/paidevia_logo.png"
                  alt="Paidevia logo"
                  width={128}
                  height={36}
                  className="h-9 w-auto object-contain"
                  priority
                />
                <div>
                  <p className="font-pixel text-[12px] tracking-tight text-white">Paidevia</p>
                  <p className="font-pixel text-[8px] text-[#209cee]">LMS Platform</p>
                </div>
              </div>

              <div className="mt-10 max-w-lg">
                <p className="font-pixel text-[8px] text-[#209cee]">Welcome Back</p>
                <h1 className="font-heading mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Sign in to keep your learning momentum going
                </h1>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/60 sm:text-base">
                  Re-enter your workspace, continue active lessons, and keep your
                  progress moving inside a focused LMS experience.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <FeaturePill label="Dashboard" value="Jump back into your learning workspace." />
                <FeaturePill label="Progress" value="Resume lessons without losing momentum." />
                <FeaturePill label="Account" value="One identity across the platform." />
              </div>
            </div>
          </section>

          {/* Right panel */}
          <section className="flex items-center bg-[#161b22] p-7 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              <p className="font-pixel text-[9px] text-[#209cee]">Authentication</p>
              <h2 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#e6edf3] sm:text-3xl">
                Access your account
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#8b949e]">
                Choose your preferred provider to continue to your dashboard,
                courses, and lesson history.
              </p>

              <div className="mt-7 space-y-3">
                <ProviderButton
                  label="Continue with Google"
                  accent="bg-white"
                  icon={<GoogleIcon />}
                  action={async () => {
                    "use server";
                    await signIn("google", { redirectTo: "/dashboard" });
                  }}
                />
                <ProviderButton
                  label="Continue with GitHub"
                  accent="bg-[#21262d] text-white ring-1 ring-[#30363d]"
                  icon={<GitHubIcon />}
                  action={async () => {
                    "use server";
                    await signIn("github", { redirectTo: "/dashboard" });
                  }}
                />
              </div>

              <div className="mt-6 rounded-xl border border-[#30363d] bg-[#21262d] p-4">
                <p className="font-pixel text-[8px] text-[#6e7681]">Looking ahead</p>
                <p className="mt-2 text-sm leading-6 text-[#8b949e]">
                  This layout is ready for future email sign-in or passwordless
                  auth without structural changes.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/home"
                  className="inline-flex rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-2.5 text-sm font-semibold text-[#e6edf3] transition duration-200 hover:bg-[#2d333b]"
                >
                  Back to Home
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-2.5 text-sm font-semibold text-[#8b949e] transition duration-200 hover:bg-[#2d333b] hover:text-[#e6edf3]"
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
