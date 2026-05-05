import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

/* ── SVG chart helpers ─────────────────────────────── */

function LineChart({
  data, color = "#6d5cf7", id,
}: { data: number[]; color?: string; id: string }) {
  const w = 500; const h = 80;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = data.length < 2 ? w / 2 : (i / (data.length - 1)) * w;
    const y = h - Math.max((v / max) * h, 1);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = `M ${pts.join(" L ")}`;
  const fillPath = `${linePath} L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${id})`} />
      <path d={linePath} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  const gapRatio = 0.35;
  const totalW = 400;
  const barW = (totalW / data.length) * (1 - gapRatio);
  const gap = (totalW / data.length) * gapRatio;
  const chartH = 80;
  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + 16}`} width="100%" height={chartH + 16} preserveAspectRatio="xMidYMid meet">
      {data.map((v, i) => {
        const h = Math.max((v / max) * chartH, 3);
        const x = i * (barW + gap);
        const isLast = i === data.length - 1;
        return (
          <g key={i}>
            <rect x={x} y={chartH - h} width={barW} height={h} rx={3}
              fill={isLast ? "#6d5cf7" : "var(--border)"} opacity={isLast ? 1 : 0.7} />
            <text x={x + barW / 2} y={chartH + 13} textAnchor="middle" fontSize={9} fill="var(--subtle)">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RoleDonut({ a, b, c, total }: { a: number; b: number; c: number; total: number }) {
  const r = 40; const cx = 50; const cy = 50;
  const circ = 2 * Math.PI * r;
  const safe = total || 1;
  const aDash = (a / safe) * circ;
  const bDash = (b / safe) * circ;
  const cDash = (c / safe) * circ;
  return (
    <svg viewBox="0 0 100 100" width={100} height={100}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={11} />
      {cDash > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--subtle)" strokeWidth={11}
        strokeDasharray={`${cDash} ${circ}`} strokeDashoffset={-(aDash + bDash)}
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />}
      {bDash > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fbbf24" strokeWidth={11}
        strokeDasharray={`${bDash} ${circ}`} strokeDashoffset={-aDash}
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />}
      {aDash > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#8b7cf7" strokeWidth={11}
        strokeDasharray={`${aDash} ${circ}`} strokeDashoffset={0}
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={16} fontWeight={800} fill="var(--text)">{total}</text>
    </svg>
  );
}

function GaugeChart({ pct }: { pct: number }) {
  const r = 44; const cx = 56; const cy = 56;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#f87171";
  return (
    <svg viewBox="0 0 112 112" width={112} height={112}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={12} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={18} fontWeight={800} fill="var(--text)">{pct}%</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize={9} fill="var(--subtle)">completion</text>
    </svg>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Page ──────────────────────────────────────────── */

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !isAdminRole(user.role)) redirect("/dashboard");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalUsers, totalCourses, publishedCourses,
    totalEnrollments, totalCompleted,
    adminCount, instructorCount, studentCount,
    recentEnrollmentRows, recentUserRows,
    topCourses, recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { status: "published" } }),
    prisma.enrollment.count(),
    prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { role: "instructor" } }),
    prisma.user.count({ where: { role: "student" } }),
    prisma.enrollment.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.course.findMany({
      take: 4,
      where: { status: "published" },
      orderBy: { enrollments: { _count: "desc" } },
      select: {
        title: true, slug: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.enrollment.findMany({
      take: 6, orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  /* ── Bucket enrollments by day (last 7) ── */
  const days: { label: string; date: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), date: d });
  }
  const enrollmentsByDay = days.map(({ label, date }) => {
    const next = new Date(date.getTime() + 86400000);
    return { label, value: recentEnrollmentRows.filter(e => new Date(e.createdAt) >= date && new Date(e.createdAt) < next).length };
  });

  /* ── Bucket users by month (last 6) ── */
  const months: { label: string; year: number; month: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    months.push({ label: d.toLocaleDateString("en-US", { month: "short" }), year: d.getFullYear(), month: d.getMonth() });
  }
  const usersByMonth = months.map(({ label, year, month }) => ({
    label,
    value: recentUserRows.filter(u => {
      const d = new Date(u.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length,
  }));

  /* ── Completion rate ── */
  const totalLessonAttempts = await prisma.lessonProgress.count();
  const completionRate = totalLessonAttempts > 0 ? Math.round((totalCompleted / totalLessonAttempts) * 100) : 0;

  /* ── Max enrollment for top courses bar ── */
  const maxEnroll = Math.max(...topCourses.map(c => c._count.enrollments), 1);

  /* ── Date range label ── */
  const dateLabel = `${sevenDaysAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const weekEnrollments = recentEnrollmentRows.length;

  return (
    <div className="r-page" style={{ padding: "28px 28px 80px" }}>
    <div className="r-panel-grid" style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>

      {/* ── Main ── */}
      <div style={{ minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--red)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
              Admin Panel · Analytics
            </p>
            <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Platform Analytics
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              Track platform performance, user engagement, and learning outcomes.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 12px", borderRadius: 9,
              background: "var(--card)", border: "1px solid var(--border)",
            }}>
              <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--subtle)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{dateLabel}</span>
            </div>
            <a href="/api/admin/export" download style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600,
              color: "#fff", background: "var(--accent)", textDecoration: "none",
              boxShadow: "0 2px 10px var(--accent-glow)",
            }}>
              <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Report
            </a>
          </div>
        </div>

        {/* Top stats */}
        <div className="r-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Total Users", value: totalUsers, color: "var(--accent)", pct: "+20%" },
            { label: "Courses Created", value: totalCourses, color: "var(--green)", pct: "+8%" },
            { label: "Lessons Completed", value: totalCompleted, color: "var(--yellow)", pct: "+15%" },
            { label: "Enrollment Rate", value: `${completionRate}%`, color: "var(--blue)", pct: "+12%" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "18px 18px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--subtle)" }}>{s.label}</p>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "var(--green)",
                  background: "rgba(52,211,153,0.1)", padding: "2px 6px", borderRadius: 99,
                }}>↑ {s.pct}</span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 4 }}>vs last week</p>
            </div>
          ))}
        </div>

        {/* Enrollments over time + new enrollments */}
        <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, marginBottom: 14 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Enrollments Over Time</p>
                <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 2 }}>New enrollments per day — last 7 days</p>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 2, borderRadius: 99, background: "#6d5cf7" }} />
                  <span style={{ fontSize: 10, color: "var(--subtle)" }}>This Period</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 2, borderRadius: 99, background: "var(--border)" }} />
                  <span style={{ fontSize: 10, color: "var(--subtle)" }}>Previous Period</span>
                </div>
              </div>
            </div>
            <LineChart data={enrollmentsByDay.map(d => d.value)} id="enrollGrad" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {enrollmentsByDay.map(d => (
                <span key={d.label} style={{ fontSize: 10, color: "var(--subtle)", flex: 1, textAlign: "center" }}>{d.label}</span>
              ))}
            </div>
          </div>

          {/* New enrollments mini card */}
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "20px 22px",
            display: "flex", flexDirection: "column", justifyContent: "center",
            minWidth: 160,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--subtle)", marginBottom: 8 }}>New Enrollments</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>
              {weekEnrollments}
            </p>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 12 }}>
              +{totalEnrollments} total overall
            </p>
            <LineChart data={enrollmentsByDay.map(d => d.value)} color="#34d399" id="miniGrad" />
          </div>
        </div>

        {/* User Growth + Users by Role + Completion Rate */}
        <div className="r-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>

          {/* User Growth bar chart */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 18px 14px" }}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>User Growth</p>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 2 }}>New users per month</p>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{totalUsers}</p>
              <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>↑ total</span>
            </div>
            <BarChart data={usersByMonth.map(m => m.value)} labels={usersByMonth.map(m => m.label)} />
          </div>

          {/* Users by role donut */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 18px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Users by Role</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <RoleDonut a={studentCount} b={instructorCount} c={adminCount} total={totalUsers} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Students", value: studentCount, dot: "#8b7cf7" },
                { label: "Instructors", value: instructorCount, dot: "#fbbf24" },
                { label: "Admins", value: adminCount, dot: "var(--subtle)" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.dot }} />
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Rate gauge */}
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 18px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14, alignSelf: "flex-start" }}>Completion Rate</p>
            <GaugeChart pct={completionRate} />
            <p style={{ fontSize: 11, color: "var(--subtle)", textAlign: "center", marginTop: 10 }}>
              {totalCompleted} of {totalLessonAttempts} lesson attempts completed
            </p>
          </div>
        </div>

        {/* Platform Engagement */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Platform Engagement</p>
            <span style={{ fontSize: 11, color: "var(--subtle)" }}>This week</span>
          </div>
          <div className="r-grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0 }}>
            {[
              { label: "Avg Topics / Session", value: (totalCourses / Math.max(totalUsers, 1)).toFixed(1), color: "var(--accent)" },
              { label: "Avg Session Time", value: "34m", color: "var(--blue)" },
              { label: "Lessons / Session", value: (totalCompleted / Math.max(totalEnrollments, 1)).toFixed(1), color: "var(--yellow)" },
              { label: "Completion Rate", value: `${completionRate}%`, color: "var(--green)" },
              { label: "Total Enrollments", value: String(totalEnrollments), color: "var(--accent)" },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                padding: "0 20px",
                borderRight: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: item.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{item.value}</p>
                <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 5, lineHeight: 1.4 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Live Activity */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Live Activity</p>
            <Link href="/admin/users" style={{ fontSize: 11, color: "var(--accent-hover)", fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ padding: "6px 0" }}>
            {recentActivity.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--subtle)", padding: "16px", textAlign: "center" }}>No recent activity</p>
            ) : recentActivity.map((a, i) => {
              const name = a.user.name ?? (a.user.email ?? "Unknown").split("@")[0];
              const initial = name[0].toUpperCase();
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 9,
                  padding: "9px 16px",
                  borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "#fff",
                  }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Enrolled in {a.course.title}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--subtle)", flexShrink: 0, marginTop: 1 }}>
                    {timeAgo(new Date(a.createdAt))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Courses */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Top Courses</p>
            <Link href="/admin/courses" style={{ fontSize: 11, color: "var(--accent-hover)", fontWeight: 600 }}>Manage →</Link>
          </div>
          <div style={{ padding: "8px 16px 12px" }}>
            {topCourses.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--subtle)", textAlign: "center", padding: "12px 0" }}>No published courses yet</p>
            ) : topCourses.map((c, i) => (
              <div key={c.slug} style={{ marginBottom: i < topCourses.length - 1 ? 12 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <p style={{
                    fontSize: 12, fontWeight: 600, color: "var(--text)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, paddingRight: 8,
                  }}>
                    {c.title}
                  </p>
                  <span style={{ fontSize: 11, color: "var(--subtle)", flexShrink: 0 }}>{c._count.enrollments}</span>
                </div>
                <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${Math.round((c._count.enrollments / maxEnroll) * 100)}%`,
                    background: i === 0 ? "var(--accent)" : i === 1 ? "#34d399" : i === 2 ? "#fbbf24" : "var(--subtle)",
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Insights</p>
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7, marginBottom: 12 }}>
            Completion rate is at <strong style={{ color: "var(--text)" }}>{completionRate}%</strong> this period.
            {publishedCourses > 0
              ? ` ${publishedCourses} course${publishedCourses > 1 ? "s" : ""} are live and accepting enrollments.`
              : " No courses are published yet."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {[
              { label: "Published courses", value: publishedCourses, color: "var(--green)" },
              { label: "Total enrollments", value: totalEnrollments, color: "var(--accent-hover)" },
              { label: "Completed lessons", value: totalCompleted, color: "var(--yellow)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
          <Link href="/admin" style={{
            fontSize: 12, fontWeight: 600, color: "var(--accent-hover)",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            View full report
            <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
    </div>
  );
}
