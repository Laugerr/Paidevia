# 🎓 Paidevia — Modern LMS Platform

Paidevia is a full-stack Learning Management System built on **Next.js 16 (App Router)**, **TypeScript**, **Prisma**, **PostgreSQL (Neon)**, and **NextAuth 5**. It supports three distinct roles — student, instructor, and admin — and delivers a structured, self-paced learning experience from course discovery through lesson completion.

> See [RELEASE_PLAN.md](./RELEASE_PLAN.md) for the full versioned roadmap.

---

## 🚀 Current Version: v1.3.0 — UI Redesign & UX Overhaul

---

## ✨ Features

### 🎒 Student Experience
- 🔍 Browse a public catalog of published courses
- 📖 View course details — description, lesson list, level
- ➕ One-click enrollment
- 🎬 Lesson player with per-lesson completion tracking
- ⏩ "Continue Learning" hero card — resumes from last in-progress lesson
- 📊 Dashboard with enrolled courses, completion percentage, and lesson stats
- 👤 Profile page with role badge, enrollment count, and account details

### 🧑‍🏫 Instructor Workspace
- 🛠️ Create and manage courses (title, slug, description, level)
- 📝 Add, order, and describe lessons within courses
- 🔄 Publishing workflow: `draft → published → archived`
- ✅ Publishing readiness checklist
- 📈 Instructor dashboard with course inventory, status breakdown, and enrollment metrics

### 🛡️ Admin Panel
- 📊 Platform-wide stats (users, courses, enrollments, completions)
- 👥 User management — view all users, change roles, self-protection guard
- 🗂️ Course moderation — view all courses, change status, control visibility

### 🔐 Authentication & Access
- 🔑 Google and GitHub OAuth login (conditional — only enabled when env vars are set)
- 💾 Database-persistent sessions via NextAuth 5 + Prisma adapter
- 🎭 Role-based access control: `student`, `instructor`, `admin`
- 🔒 Protected routes per role with server-side enforcement
- ↩️ Logged-in users are redirected from marketing pages to the dashboard automatically

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| 🖥️ Framework | Next.js 16 (App Router) |
| 🔷 Language | TypeScript |
| 🎨 Styling | Tailwind CSS + CSS custom properties |
| 🗄️ ORM | Prisma v6 |
| 🐘 Database | PostgreSQL (Neon) |
| 🔐 Auth | NextAuth 5 / Auth.js |
| 🚀 Deployment | Vercel |

---

## 🏗️ Architecture

The app uses two layout groups:

- `(marketing)` — Public-facing pages (home, login) with a sticky top nav
- `(app)` — Authenticated platform with a persistent sidebar

The sidebar shows role-based navigation sections: Platform (all users), Instructor (instructors + admins), Admin (admins only). Courses live in the `(app)` group so the sidebar persists while browsing.

---

## ⚙️ Local Development

### 1. 📥 Clone the repository

```bash
git clone <your-repository-url>
cd paidevia
```

### 2. 📦 Install dependencies

```bash
npm install
```

### 3. 🔧 Configure environment variables

Create `.env.local` with:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

> OAuth providers are optional — the app gracefully omits any provider whose env vars are missing.

### 4. 🗃️ Push the database schema

```bash
npx prisma db push
```

### 5. ▶️ Start the development server

```bash
npm run dev
```

> Uses `--webpack` flag locally (Turbopack is used on Vercel). Custom port: `npm run dev -- -p 3006`

---

## 📜 Scripts

```bash
npm run dev      # Development server (webpack mode)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🗺️ Roadmap

| Release | Focus | Status |
|---------|-------|--------|
| 🚀 v1.0.0 | Core LMS System | ✅ Shipped |
| 🧑‍🏫 v1.1.0 | Instructor Foundation | ✅ Shipped |
| 🗃️ v1.2.0 | Full Course Data Migration | ✅ Shipped |
| ✨ v1.3.0 | UI Redesign & UX Overhaul | ✅ Shipped |
| 🎬 v2.0 | Content Delivery (video, rich text) | 🔜 Next |
| 🔍 v3.0 | Discovery & Trust (search, reviews) | 📅 Planned |
| 🔥 v4.0 | Engagement & Achievement | 📅 Planned |
| 💰 v5.0 | Monetization | 📅 Planned |
| 🏢 v6.0 | Scale & Enterprise | 📅 Planned |

---

## ⚠️ Known Limitations

- 🎬 Lessons do not yet support video or rich text body content — coming in v2.0
- 🌱 Local development requires at least one published course and lesson in the database
- 🏗️ Platform is not yet publicly launchable — v2.0 is the target for public launch readiness
