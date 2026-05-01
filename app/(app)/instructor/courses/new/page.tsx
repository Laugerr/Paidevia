import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessInstructorArea } from "@/lib/roles";

type NewCoursePageProps = {
  searchParams?: Promise<{
    error?: string;
    title?: string;
    slug?: string;
    description?: string;
    level?: string;
  }>;
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 14,
  color: "var(--text)",
  outline: "none",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 7,
};

export default async function NewInstructorCoursePage({ searchParams }: NewCoursePageProps) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, name: true },
  });
  if (!user || !canAccessInstructorArea(user.role)) redirect("/dashboard");

  async function createCourse(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!currentUser || !canAccessInstructorArea(currentUser.role)) redirect("/dashboard");

    const title = String(formData.get("title") ?? "").trim();
    const slug = normalizeSlug(String(formData.get("slug") ?? ""));
    const description = String(formData.get("description") ?? "").trim();
    const level = String(formData.get("level") ?? "").trim();

    const params = new URLSearchParams({ title, slug, description, level });

    if (!title || !slug || !description || !level) {
      params.set("error", "Please complete all required fields.");
      redirect(`/instructor/courses/new?${params.toString()}`);
    }

    const existing = await prisma.course.findUnique({ where: { slug }, select: { id: true } });
    if (existing) {
      params.set("error", "That slug is already in use. Please choose another.");
      redirect(`/instructor/courses/new?${params.toString()}`);
    }

    await prisma.course.create({
      data: { title, slug, description, level, status: "draft", lessons: 0, instructorId: currentUser.id },
    });

    redirect("/instructor");
  }

  const sp = await searchParams;
  const titleValue = sp?.title ?? "";
  const slugValue = sp?.slug ?? "";
  const descriptionValue = sp?.description ?? "";
  const levelValue = sp?.level ?? "Beginner";
  const errorMessage = sp?.error;
  const firstName = user.name?.split(" ")[0] ?? "Instructor";

  return (
    <div className="r-page" style={{ padding: "32px 32px 80px", maxWidth: 720 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 13, color: "var(--subtle)" }}>
          <Link href="/instructor" style={{ color: "var(--muted)" }}>Instructor</Link>
          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span style={{ color: "var(--text)" }}>New Course</span>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hover)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Instructor Workspace
        </p>
        <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Create a new course
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
          Creating as <strong style={{ color: "var(--text)", fontWeight: 600 }}>{firstName}</strong>. Courses start as drafts and can be published once lessons are added.
        </p>
      </div>

      {/* Error */}
      {errorMessage && (
        <div style={{
          padding: "12px 16px", marginBottom: 24,
          background: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: 10, fontSize: 13, color: "var(--red)",
        }}>
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px" }}>
        <form action={createCourse} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

          {/* Title + Slug row */}
          <div className="r-form-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Course Title</label>
              <input
                name="title"
                type="text"
                defaultValue={titleValue}
                placeholder="e.g. Introduction to Python"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Slug <span style={{ color: "var(--subtle)", fontWeight: 400 }}>(URL-safe, auto-normalized)</span></label>
              <input
                name="slug"
                type="text"
                defaultValue={slugValue}
                placeholder="e.g. intro-to-python"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={descriptionValue}
              placeholder="Write a clear summary of what learners will gain from this course."
              required
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
            />
          </div>

          {/* Level */}
          <div style={{ maxWidth: 240 }}>
            <label style={labelStyle}>Difficulty Level</label>
            <select name="level" defaultValue={levelValue} style={inputStyle}>
              {["Beginner", "Intermediate", "Advanced"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Draft info */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "16px 20px",
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>What happens after creation</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Course is saved as a draft — not visible to students yet.",
                "You can add lessons from the instructor workspace.",
                "An admin can publish it once it's ready.",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "var(--accent-hover)", marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button
              type="submit"
              style={{
                padding: "11px 28px",
                background: "var(--accent)",
                color: "#fff",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 16px var(--accent-glow)",
                transition: "all 0.15s",
              }}
            >
              Create Draft
            </button>
            <Link href="/instructor" style={{
              padding: "11px 22px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              color: "var(--muted)",
            }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
