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
    const category = String(formData.get("category") ?? "").trim() || null;

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
      data: { title, slug, description, level, category, status: "draft", lessons: 0, instructorId: currentUser.id },
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

  const levels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className="r-page" style={{ padding: "28px 28px 80px" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "var(--subtle)" }}>
        <Link href="/instructor" style={{ color: "var(--muted)" }}>Instructor</Link>
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span style={{ color: "var(--text)", fontWeight: 500 }}>New Course</span>
      </div>

      {/* Page heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-heading" style={{
          fontSize: 26, fontWeight: 800, color: "var(--text)",
          letterSpacing: "-0.02em", marginBottom: 6,
        }}>
          Create a new course
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Start building your course. You can save it as a draft and publish it when it&apos;s ready.
        </p>
      </div>

      {/* Error */}
      {errorMessage && (
        <div style={{
          padding: "12px 16px", marginBottom: 20,
          background: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: 10, fontSize: 13, color: "var(--red)",
        }}>
          {errorMessage}
        </div>
      )}

      {/* Two-column layout */}
      <div className="r-panel-grid" style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>

        {/* ── Left: Form ── */}
        <form action={createCourse} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Title + Slug row */}
          <div className="r-form-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Title card */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "20px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--accent-hover)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Course Title</label>
              </div>
              <input
                name="title"
                type="text"
                defaultValue={titleValue}
                placeholder="e.g. Introduction to Python"
                required
                style={inputStyle}
              />
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 8 }}>
                e.g. Intro to Python · Create a short, engaging title for your learners
              </p>
            </div>

            {/* Slug card */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "20px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--green)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Slug</label>
              </div>
              <input
                name="slug"
                type="text"
                defaultValue={slugValue}
                placeholder="e.g. intro-to-python"
                required
                style={inputStyle}
              />
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 8 }}>
                e.g. intro-to-python · Readable URL identifier, auto-normalized
              </p>
            </div>
          </div>

          {/* Description card */}
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "20px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--blue)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Description</label>
            </div>
            <textarea
              name="description"
              rows={4}
              defaultValue={descriptionValue}
              placeholder="Write a clear summary of what learners will gain from this course."
              required
              maxLength={500}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
            />
            <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 8, textAlign: "right" }}>
              {descriptionValue.length} / 500
            </p>
          </div>

          {/* Difficulty Level */}
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "20px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--yellow)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Difficulty Level</label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {levels.map((l) => (
                <label key={l} style={{ flex: 1, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="level"
                    value={l}
                    defaultChecked={levelValue === l}
                    style={{ display: "none" }}
                  />
                  <span style={{
                    display: "block", textAlign: "center",
                    padding: "9px 0",
                    borderRadius: 9,
                    fontSize: 13, fontWeight: 600,
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    background: levelValue === l ? "var(--accent)" : "var(--surface)",
                    color: levelValue === l ? "#fff" : "var(--muted)",
                    boxShadow: levelValue === l ? "0 2px 12px var(--accent-glow)" : "none",
                    transition: "all 0.15s",
                  }}>
                    {l}
                  </span>
                </label>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 10 }}>
              The difficulty level will be shown to students on the course listing.
            </p>
          </div>

          {/* Category */}
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "20px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--accent-hover)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 10h16M4 14h10" />
                </svg>
              </div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Category</label>
            </div>
            <select
              name="category"
              style={{
                width: "100%", padding: "11px 14px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 9, fontSize: 13, color: "var(--text)",
                outline: "none",
              }}
            >
              <option value="">— No category —</option>
              {["Web Development", "Programming", "Cybersecurity", "Data Science", "Mobile Development"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* What happens after creation */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "20px 20px",
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
              What happens after creation
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Course is saved as a draft — not visible to students yet.",
                "You can add lessons, questions, and discussion from the instructor workspace.",
                "An admin can review and publish the course once it's ready for learners.",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
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
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              color: "var(--muted)",
              display: "inline-flex", alignItems: "center",
            }}>
              Cancel
            </Link>
          </div>
        </form>

        {/* ── Right panel ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Course Preview */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Course Preview</p>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 2 }}>How your card will look</p>
            </div>
            <div style={{ padding: 16 }}>
              {/* Mini course card */}
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 12, overflow: "hidden",
              }}>
                {/* Card header */}
                <div style={{
                  height: 80,
                  background: "linear-gradient(135deg, rgba(109,92,247,0.4) 0%, rgba(167,139,250,0.3) 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <span style={{ fontSize: 28 }}>📘</span>
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", color: "#fff",
                    background: "rgba(109,92,247,0.7)", padding: "2px 8px",
                    borderRadius: 99,
                  }}>
                    {levelValue}
                  </div>
                </div>
                {/* Card body */}
                <div style={{ padding: "12px 14px" }}>
                  <p style={{
                    fontSize: 13, fontWeight: 700, color: "var(--text)",
                    marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {titleValue || "Course Title"}
                  </p>
                  <p style={{
                    fontSize: 11, color: "var(--muted)", lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {descriptionValue || "Short description will appear here."}
                  </p>
                  <div style={{
                    marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: 10, color: "var(--subtle)" }}>Creating as {firstName}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.06em", color: "var(--yellow)",
                      border: "1px solid var(--yellow)", padding: "2px 6px", borderRadius: 99,
                    }}>
                      Draft
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Need help? */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--accent-hover)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Need help?</p>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
              Follow our best practices to create effective and engaging courses.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "How to build a great title",
                "Structuring your lessons",
                "Publishing guidelines",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    background: "var(--accent)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800, color: "#fff",
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 12, color: "var(--muted)" }}>{tip}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
              <Link href="/instructor" style={{
                fontSize: 12, fontWeight: 600, color: "var(--accent-hover)",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                View Instructor Guide
                <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
