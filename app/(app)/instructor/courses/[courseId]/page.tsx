import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessInstructorArea, isAdminRole } from "@/lib/roles";

type CourseSearchParams = {
  error?: string;
  publishError?: string;
  publishSuccess?: string;
  title?: string;
  slug?: string;
  description?: string;
  level?: string;
  status?: string;
  lessonError?: string;
  lessonTitle?: string;
  lessonSlug?: string;
  lessonSummary?: string;
  editingLessonId?: string;
};

type ManageInstructorCoursePageProps = {
  params: Promise<{ courseId: string }>;
  searchParams?: Promise<CourseSearchParams>;
};

const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const COURSE_STATUSES = ["draft", "published", "archived"] as const;

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getPublishReadiness(input: {
  title: string;
  slug: string;
  description: string;
  level: string;
  lessonCount: number;
}) {
  const checks = [
    {
      id: "title",
      label: "Course title is set",
      ready: Boolean(input.title.trim()),
    },
    {
      id: "slug",
      label: "Course slug is set",
      ready: Boolean(input.slug.trim()),
    },
    {
      id: "description",
      label: "Course description is set",
      ready: Boolean(input.description.trim()),
    },
    {
      id: "level",
      label: "Course level is selected",
      ready: COURSE_LEVELS.includes(input.level as (typeof COURSE_LEVELS)[number]),
    },
    {
      id: "lessons",
      label: "At least one lesson exists",
      ready: input.lessonCount > 0,
    },
  ];

  return {
    checks,
    isReady: checks.every((check) => check.ready),
  };
}

async function getAuthorizedInstructorActor() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      role: true,
      name: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!canAccessInstructorArea(user.role)) {
    redirect("/dashboard");
  }

  return user;
}

async function getManageableCourse(courseId: string, userId: string, role: string) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      enrollments: {
        select: {
          id: true,
        },
      },
      courseLessons: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const canManageCourse = isAdminRole(role) || course.instructorId === userId;

  if (!canManageCourse) {
    redirect("/instructor");
  }

  return course;
}

export default async function ManageInstructorCoursePage({
  params,
  searchParams,
}: ManageInstructorCoursePageProps) {
  const [{ courseId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as CourseSearchParams),
  ]);

  const user = await getAuthorizedInstructorActor();
  const course = await getManageableCourse(courseId, user.id, user.role);

  async function updateCourse(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    const title = String(formData.get("title") ?? "").trim();
    const slug = normalizeSlug(String(formData.get("slug") ?? ""));
    const description = String(formData.get("description") ?? "").trim();
    const level = String(formData.get("level") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();

    const params = new URLSearchParams({
      title,
      slug,
      description,
      level,
      status,
    });

    if (!title || !slug || !description || !level || !status) {
      params.set("error", "Please complete all required fields.");
      redirect(`/instructor/courses/${courseId}?${params.toString()}`);
    }

    if (!COURSE_LEVELS.includes(level as (typeof COURSE_LEVELS)[number])) {
      params.set("error", "Please choose a valid level.");
      redirect(`/instructor/courses/${courseId}?${params.toString()}`);
    }

    if (!COURSE_STATUSES.includes(status as (typeof COURSE_STATUSES)[number])) {
      params.set("error", "Please choose a valid status.");
      redirect(`/instructor/courses/${courseId}?${params.toString()}`);
    }

    const publishReadiness = getPublishReadiness({
      title,
      slug,
      description,
      level,
      lessonCount: course.courseLessons.length,
    });

    if (status === "published" && !publishReadiness.isReady) {
      params.set(
        "error",
        "This course is not ready to publish yet. Complete the publishing checklist first."
      );
      redirect(`/instructor/courses/${courseId}?${params.toString()}#publishing-workflow`);
    }

    const existingCourse = await prisma.course.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingCourse && existingCourse.id !== courseId) {
      params.set("error", "That slug is already in use. Please choose another.");
      redirect(`/instructor/courses/${courseId}?${params.toString()}`);
    }

    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        title,
        slug,
        description,
        level,
        status,
      },
    });

    redirect(`/instructor/courses/${courseId}`);
  }

  async function publishCourse() {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    const currentCourse = await getManageableCourse(
      courseId,
      currentUser.id,
      currentUser.role
    );

    const readiness = getPublishReadiness({
      title: currentCourse.title,
      slug: currentCourse.slug,
      description: currentCourse.description,
      level: currentCourse.level,
      lessonCount: currentCourse.courseLessons.length,
    });

    if (!readiness.isReady) {
      redirect(
        `/instructor/courses/${courseId}?publishError=${encodeURIComponent(
          "This course is not ready to publish yet. Finish every checklist item first."
        )}#publishing-workflow`
      );
    }

    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        status: "published",
      },
    });

    redirect(
      `/instructor/courses/${courseId}?publishSuccess=${encodeURIComponent(
        "Course published successfully."
      )}#publishing-workflow`
    );
  }

  async function moveCourseToDraft() {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        status: "draft",
      },
    });

    redirect(
      `/instructor/courses/${courseId}?publishSuccess=${encodeURIComponent(
        "Course moved back to draft."
      )}#publishing-workflow`
    );
  }

  async function addLesson(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    const currentCourse = await getManageableCourse(
      courseId,
      currentUser.id,
      currentUser.role
    );

    const title = String(formData.get("lessonTitle") ?? "").trim();
    const slugInput = String(formData.get("lessonSlug") ?? "").trim();
    const slug = normalizeSlug(slugInput || title);
    const summary = String(formData.get("lessonSummary") ?? "").trim();

    const params = new URLSearchParams({
      lessonTitle: title,
      lessonSlug: slugInput,
      lessonSummary: summary,
    });

    if (!title || !slug) {
      params.set("lessonError", "Please provide a title and slug for the lesson.");
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const existingLesson = await prisma.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId,
          slug,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingLesson) {
      params.set("lessonError", "That lesson slug is already in use for this course.");
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const duplicatePublicLessonSlug = await prisma.lesson.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (duplicatePublicLessonSlug) {
      params.set(
        "lessonError",
        "That lesson slug is already used elsewhere. Public lesson slugs must stay unique."
      );
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const nextPosition = currentCourse.courseLessons.length + 1;

    await prisma.$transaction([
      prisma.lesson.create({
        data: {
          courseId,
          title,
          slug,
          summary: summary || null,
          position: nextPosition,
        },
      }),
      prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          lessons: nextPosition,
        },
      }),
    ]);

    redirect(`/instructor/courses/${courseId}#lesson-management`);
  }

  async function updateLesson(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    const lessonId = String(formData.get("lessonId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = normalizeSlug(slugInput || title);
    const summary = String(formData.get("summary") ?? "").trim();

    const params = new URLSearchParams({
      editingLessonId: lessonId,
      lessonTitle: title,
      lessonSlug: slugInput,
      lessonSummary: summary,
    });

    if (!lessonId || !title || !slug) {
      params.set("lessonError", "Please complete the lesson title and slug.");
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
        courseId: true,
      },
    });

    if (!lesson || lesson.courseId !== courseId) {
      notFound();
    }

    const existingLesson = await prisma.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId,
          slug,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingLesson && existingLesson.id !== lessonId) {
      params.set("lessonError", "That lesson slug is already in use for this course.");
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    const duplicatePublicLessonSlug = await prisma.lesson.findFirst({
      where: {
        slug,
        NOT: {
          id: lessonId,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicatePublicLessonSlug) {
      params.set(
        "lessonError",
        "That lesson slug is already used elsewhere. Public lesson slugs must stay unique."
      );
      redirect(
        `/instructor/courses/${courseId}?${params.toString()}#lesson-management`
      );
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title,
        slug,
        summary: summary || null,
      },
    });

    redirect(`/instructor/courses/${courseId}#lesson-management`);
  }

  async function deleteLesson(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    const lessonId = String(formData.get("lessonId") ?? "");

    if (!lessonId) {
      redirect(`/instructor/courses/${courseId}#lesson-management`);
    }

    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
        courseId: true,
      },
    });

    if (!lesson || lesson.courseId !== courseId) {
      notFound();
    }

    await prisma.$transaction(async (tx) => {
      await tx.lesson.delete({
        where: {
          id: lessonId,
        },
      });

      const remainingLessons = await tx.lesson.findMany({
        where: {
          courseId,
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      });

      for (const [index, remainingLesson] of remainingLessons.entries()) {
        await tx.lesson.update({
          where: {
            id: remainingLesson.id,
          },
          data: {
            position: index + 1,
          },
        });
      }

      await tx.course.update({
        where: {
          id: courseId,
        },
        data: {
          lessons: remainingLessons.length,
        },
      });
    });

    redirect(`/instructor/courses/${courseId}#lesson-management`);
  }

  async function moveLesson(formData: FormData) {
    "use server";

    const currentUser = await getAuthorizedInstructorActor();
    await getManageableCourse(courseId, currentUser.id, currentUser.role);

    const lessonId = String(formData.get("lessonId") ?? "");
    const direction = String(formData.get("direction") ?? "");

    if (!lessonId || !["up", "down"].includes(direction)) {
      redirect(`/instructor/courses/${courseId}#lesson-management`);
    }

    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
        courseId: true,
        position: true,
      },
    });

    if (!lesson || lesson.courseId !== courseId) {
      notFound();
    }

    const targetPosition =
      direction === "up" ? lesson.position - 1 : lesson.position + 1;

    if (targetPosition < 1) {
      redirect(`/instructor/courses/${courseId}#lesson-management`);
    }

    const adjacentLesson = await prisma.lesson.findFirst({
      where: {
        courseId,
        position: targetPosition,
      },
      select: {
        id: true,
        position: true,
      },
    });

    if (!adjacentLesson) {
      redirect(`/instructor/courses/${courseId}#lesson-management`);
    }

    await prisma.$transaction([
      prisma.lesson.update({
        where: {
          id: lesson.id,
        },
        data: {
          position: adjacentLesson.position,
        },
      }),
      prisma.lesson.update({
        where: {
          id: adjacentLesson.id,
        },
        data: {
          position: lesson.position,
        },
      }),
    ]);

    redirect(`/instructor/courses/${courseId}#lesson-management`);
  }

  const titleValue = resolvedSearchParams.title ?? course.title;
  const slugValue = resolvedSearchParams.slug ?? course.slug;
  const descriptionValue = resolvedSearchParams.description ?? course.description;
  const levelValue = resolvedSearchParams.level ?? course.level;
  const statusValue = resolvedSearchParams.status ?? course.status;
  const errorMessage = resolvedSearchParams.error;
  const publishErrorMessage = resolvedSearchParams.publishError;
  const publishSuccessMessage = resolvedSearchParams.publishSuccess;
  const lessonErrorMessage = resolvedSearchParams.lessonError;
  const lessonTitleValue = resolvedSearchParams.lessonTitle ?? "";
  const lessonSlugValue = resolvedSearchParams.lessonSlug ?? "";
  const lessonSummaryValue = resolvedSearchParams.lessonSummary ?? "";
  const editingLessonId = resolvedSearchParams.editingLessonId;
  const firstName = user.name?.split(" ")[0] ?? "Instructor";
  const publishReadiness = getPublishReadiness({
    title: titleValue,
    slug: slugValue,
    description: descriptionValue,
    level: levelValue,
    lessonCount: course.courseLessons.length,
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    fontSize: 14,
    color: "var(--text)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted)",
    marginBottom: 7,
  };

  const statusColors: Record<string, string> = {
    published: "var(--green)",
    draft: "var(--yellow)",
    archived: "var(--subtle)",
  };
  const statusBgs: Record<string, string> = {
    published: "rgba(52,211,153,0.1)",
    draft: "rgba(251,191,36,0.1)",
    archived: "rgba(74,74,101,0.15)",
  };

  return (
    <div className="r-page" style={{ padding: "32px 32px 80px", maxWidth: 1000 }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 13, color: "var(--subtle)" }}>
        <Link href="/instructor" style={{ color: "var(--muted)" }}>Instructor</Link>
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span style={{ color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
          {course.title}
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hover)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Instructor Workspace
        </p>
        <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Manage course
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 16 }}>
          Editing as <strong style={{ color: "var(--text)", fontWeight: 600 }}>{firstName}</strong>
          {isAdminRole(user.role) ? " with admin oversight access." : "."}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/instructor" style={{
            padding: "9px 20px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10, fontSize: 13, fontWeight: 500,
            color: "var(--muted)",
          }}>
            ← Back to Workspace
          </Link>
          <Link href={`/courses/${course.slug}`} style={{
            padding: "9px 20px",
            background: "var(--accent)", color: "#fff",
            borderRadius: 10, fontSize: 13, fontWeight: 600,
            boxShadow: "0 2px 12px var(--accent-glow)",
          }}>
            View Public Page →
          </Link>
        </div>
      </div>

      {/* Snapshot stats */}
      <div className="r-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Status", value: course.status, color: statusColors[course.status] ?? "var(--text)" },
          { label: "Lessons", value: course.courseLessons.length, color: "var(--text)" },
          { label: "Enrolled", value: course.enrollments.length, color: "var(--text)" },
          {
            label: "Updated",
            value: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(course.updatedAt),
            color: "var(--muted)",
          },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: 12, color: "var(--subtle)", marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Course Settings ── */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hover)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Course Editor
        </p>
        <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 20 }}>
          Course settings
        </h2>

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

        <form action={updateCourse} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="r-form-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Course Title</label>
              <input name="title" type="text" defaultValue={titleValue} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Slug <span style={{ color: "var(--subtle)", fontWeight: 400 }}>(URL-safe)</span></label>
              <input name="slug" type="text" defaultValue={slugValue} required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea name="description" rows={4} defaultValue={descriptionValue} required style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
          </div>

          <div className="r-form-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Level</label>
              <select name="level" defaultValue={levelValue} style={inputStyle}>
                {COURSE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="status" defaultValue={statusValue} style={inputStyle}>
                {COURSE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s[0].toUpperCase()}{s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tips */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Keep the slug stable once learners start using the course.",
                "Use the description to clarify the learning outcome.",
                "Set the final status from the publishing controls below.",
              ].map((tip, i) => (
                <p key={i} style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>· {tip}</p>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={{
              padding: "11px 28px",
              background: "var(--accent)", color: "#fff",
              borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: "pointer", boxShadow: "0 2px 16px var(--accent-glow)",
            }}>
              Save Changes
            </button>
            <Link href="/instructor" style={{
              padding: "11px 22px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10, fontSize: 14, fontWeight: 500, color: "var(--muted)",
            }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* ── Lesson Management ── */}
      <div id="lesson-management" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hover)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Lesson Management
        </p>
        <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 20 }}>
          Build your lesson roadmap
        </h2>

        {lessonErrorMessage && (
          <div style={{
            padding: "12px 16px", marginBottom: 20,
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 10, fontSize: 13, color: "var(--red)",
          }}>
            {lessonErrorMessage}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0,1fr)", gap: 24, alignItems: "start" }} className="r-course-grid">

          {/* Add lesson form */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Add Lesson</p>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Give it a title and optional slug. Summary is for your internal notes.
            </p>
            <form action={addLesson} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Lesson Title</label>
                <input name="lessonTitle" type="text" defaultValue={lessonTitleValue} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Lesson Slug <span style={{ color: "var(--subtle)", fontWeight: 400 }}>(auto from title)</span></label>
                <input name="lessonSlug" type="text" defaultValue={lessonSlugValue} placeholder="auto-generated if blank" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Summary</label>
                <textarea name="lessonSummary" rows={3} defaultValue={lessonSummaryValue} placeholder="Short planning note for this lesson" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <button type="submit" style={{
                width: "100%", padding: "11px",
                background: "var(--accent)", color: "#fff",
                borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: "pointer", boxShadow: "0 2px 12px var(--accent-glow)",
              }}>
                Add Lesson
              </button>
            </form>
          </div>

          {/* Lesson list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {course.courseLessons.length === 0 ? (
              <div style={{
                padding: "40px 24px", textAlign: "center",
                background: "var(--surface)", border: "1px dashed var(--border)",
                borderRadius: 14,
              }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>No lessons yet</p>
                <p style={{ fontSize: 13, color: "var(--subtle)", lineHeight: 1.6 }}>
                  Add your first lesson from the panel on the left.
                </p>
              </div>
            ) : (
              course.courseLessons.map((lesson, index) => {
                const isEditing = editingLessonId === lesson.id;
                return (
                  <div key={lesson.id} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    overflow: "hidden",
                  }}>
                    {/* Lesson header row */}
                    <div style={{ padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                      {/* Position badge */}
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700,
                        background: "var(--accent-bg)", color: "var(--accent-hover)",
                        border: "1px solid var(--accent-border)",
                      }}>
                        {lesson.position}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lesson.title}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lesson.slug}
                        </p>
                        {lesson.summary && (
                          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
                            {lesson.summary}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <form action={moveLesson} style={{ display: "inline" }}>
                          <input type="hidden" name="lessonId" value={lesson.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button type="submit" disabled={index === 0} style={{
                            padding: "6px 12px", borderRadius: 8,
                            background: "var(--card)", border: "1px solid var(--border)",
                            fontSize: 12, fontWeight: 600, color: "var(--muted)",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            opacity: index === 0 ? 0.4 : 1,
                          }}>↑</button>
                        </form>
                        <form action={moveLesson} style={{ display: "inline" }}>
                          <input type="hidden" name="lessonId" value={lesson.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button type="submit" disabled={index === course.courseLessons.length - 1} style={{
                            padding: "6px 12px", borderRadius: 8,
                            background: "var(--card)", border: "1px solid var(--border)",
                            fontSize: 12, fontWeight: 600, color: "var(--muted)",
                            cursor: index === course.courseLessons.length - 1 ? "not-allowed" : "pointer",
                            opacity: index === course.courseLessons.length - 1 ? 0.4 : 1,
                          }}>↓</button>
                        </form>
                        <form action={deleteLesson} style={{ display: "inline" }}>
                          <input type="hidden" name="lessonId" value={lesson.id} />
                          <button type="submit" style={{
                            padding: "6px 12px", borderRadius: 8,
                            background: "rgba(248,113,113,0.08)",
                            border: "1px solid rgba(248,113,113,0.2)",
                            fontSize: 12, fontWeight: 600, color: "var(--red)",
                            cursor: "pointer",
                          }}>Delete</button>
                        </form>
                      </div>
                    </div>

                    {/* Edit expand */}
                    <details open={isEditing} style={{ borderTop: "1px solid var(--border)" }}>
                      <summary style={{
                        padding: "10px 18px", cursor: "pointer",
                        fontSize: 12, fontWeight: 600, color: "var(--accent-hover)",
                        listStyle: "none", userSelect: "none",
                      }}>
                        Edit lesson details
                      </summary>
                      <div style={{ padding: "16px 18px", background: "var(--card)" }}>
                        <form action={updateLesson} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <input type="hidden" name="lessonId" value={lesson.id} />
                          <div className="r-form-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            <div>
                              <label style={labelStyle}>Title</label>
                              <input name="title" type="text" required defaultValue={isEditing ? lessonTitleValue || lesson.title : lesson.title} style={inputStyle} />
                            </div>
                            <div>
                              <label style={labelStyle}>Slug</label>
                              <input name="slug" type="text" required defaultValue={isEditing ? lessonSlugValue || lesson.slug : lesson.slug} style={inputStyle} />
                            </div>
                          </div>
                          <div>
                            <label style={labelStyle}>Summary</label>
                            <textarea name="summary" rows={3} defaultValue={isEditing ? lessonSummaryValue || lesson.summary || "" : lesson.summary || ""} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                          </div>
                          <button type="submit" style={{
                            alignSelf: "flex-start",
                            padding: "9px 22px",
                            background: "var(--accent)", color: "#fff",
                            borderRadius: 9, fontSize: 13, fontWeight: 700,
                            cursor: "pointer", boxShadow: "0 2px 12px var(--accent-glow)",
                          }}>
                            Save Lesson
                          </button>
                        </form>
                      </div>
                    </details>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Publishing Workflow ── */}
      <div id="publishing-workflow" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hover)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Publishing Workflow
        </p>
        <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 20 }}>
          Course readiness
        </h2>

        {publishErrorMessage && (
          <div style={{
            padding: "12px 16px", marginBottom: 20,
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 10, fontSize: 13, color: "var(--red)",
          }}>
            {publishErrorMessage}
          </div>
        )}

        {publishSuccessMessage && (
          <div style={{
            padding: "12px 16px", marginBottom: 20,
            background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 10, fontSize: 13, color: "var(--green)",
          }}>
            {publishSuccessMessage}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: 24, alignItems: "start" }} className="r-course-grid">

          {/* Checklist */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Publish checklist</p>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99,
                background: publishReadiness.isReady ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
                color: publishReadiness.isReady ? "var(--green)" : "var(--yellow)",
                border: `1px solid ${publishReadiness.isReady ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}`,
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                {publishReadiness.isReady ? "Ready" : "Needs attention"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {publishReadiness.checks.map((check) => (
                <div key={check.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                      background: check.ready ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
                      color: check.ready ? "var(--green)" : "var(--yellow)",
                      border: `1px solid ${check.ready ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}`,
                    }}>
                      {check.ready ? "✓" : "!"}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>{check.label}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
                    color: check.ready ? "var(--green)" : "var(--yellow)",
                  }}>
                    {check.ready ? "Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Publish controls */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Status actions</p>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Use these controls once the course structure is ready.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {course.status !== "published" ? (
                <form action={publishCourse}>
                  <button type="submit" disabled={!publishReadiness.isReady} style={{
                    width: "100%", padding: "12px",
                    background: publishReadiness.isReady ? "var(--accent)" : "var(--surface)",
                    color: publishReadiness.isReady ? "#fff" : "var(--subtle)",
                    borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: publishReadiness.isReady ? "pointer" : "not-allowed",
                    border: "1px solid var(--border)",
                    boxShadow: publishReadiness.isReady ? "0 2px 16px var(--accent-glow)" : "none",
                  }}>
                    Publish Course
                  </button>
                </form>
              ) : (
                <form action={moveCourseToDraft}>
                  <button type="submit" style={{
                    width: "100%", padding: "12px",
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.2)",
                    color: "var(--yellow)",
                    borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: "pointer",
                  }}>
                    Move Back to Draft
                  </button>
                </form>
              )}

              <div style={{ padding: "10px 14px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: "var(--subtle)", marginBottom: 4 }}>Current status</p>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: statusColors[course.status] ?? "var(--text)",
                  background: statusBgs[course.status] ?? "transparent",
                  padding: "2px 10px", borderRadius: 99,
                  border: `1px solid ${statusColors[course.status] ?? "var(--border)"}33`,
                }}>
                  {course.status}
                </span>
              </div>

              <p style={{ fontSize: 12, color: "var(--subtle)", lineHeight: 1.6 }}>
                {publishReadiness.isReady
                  ? "This course meets all publishing requirements."
                  : "Complete the checklist items on the left before publishing."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
