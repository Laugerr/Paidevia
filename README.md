# 🎓 Paidevia — Modern LMS Platform

Paidevia is a full-stack Learning Management System built on **Next.js 16 (App Router)**, **TypeScript**, **TailwindCSS**, **Prisma**, **PostgreSQL**, and **NextAuth 5**. It supports three distinct roles — student, instructor, and admin — and delivers a structured, self-paced learning experience from course discovery through lesson completion.

---

## 🚀 Current Version: v1.2.0 — Full Course Data Migration

> See [RELEASE_PLAN.md](./RELEASE_PLAN.md) for the full roadmap.

---

## ✨ Features

### 🎒 Student Experience
- 🔍 Browse a public catalog of published courses
- 📖 View course details — description, lessons, level
- ➕ One-click enrollment
- 🎬 Lesson player with per-lesson completion tracking
- ⏩ "Continue learning" resume from last visited lesson
- 📊 Dashboard with enrolled courses, completion percentage, study time stats
- 🏆 Achievement and streak display
- 👤 Profile page (name, username, email, account ID, role)

### 🧑‍🏫 Instructor Workspace
- 🛠️ Create and manage courses (title, slug, description, level)
- 📝 Add, order, and describe lessons within courses
- 🔄 Publishing workflow: `draft → published → archived`
- ✅ Publishing readiness checklist
- 📈 Instructor dashboard with course stats and enrollment metrics

### 🛡️ Admin Panel
- 📊 Platform-wide stats (users, courses, enrollments, completions)
- 👥 User management — view all users, change roles, self-protection guard
- 🗂️ Course moderation — view all courses, change status, control visibility

### 🔐 Authentication & Access
- 🔑 Google and GitHub OAuth login
- 💾 Database-persistent sessions via NextAuth 5 + Prisma adapter
- 🎭 Role-based access control: `student`, `instructor`, `admin`
- 🔒 Protected routes per role with server-side enforcement

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| 🖥️ Framework | Next.js 16 (App Router) |
| 🔷 Language | TypeScript |
| 🎨 Styling | TailwindCSS |
| 🗄️ ORM | Prisma |
| 🐘 Database | PostgreSQL |
| 🔐 Auth | NextAuth 5 / Auth.js |

---

## ⚙️ Installation

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

```bash
cp .env.example .env.local
```

Required variables:

```env
DATABASE_URL=
AUTH_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

> The codebase uses `AUTH_*` variables via [`auth.ts`](./auth.ts). `NEXTAUTH_*` placeholders are included in `.env.example` for convenience.

### 4. ⚡ Generate Prisma client

```bash
npx prisma generate
```

### 5. 🗃️ Run database migrations

```bash
npx prisma migrate dev
```

### 6. 🌱 Seed the database *(optional but recommended)*

Ensure at least one published course and lesson exist — the public learning flow is fully database-backed.

### 7. ▶️ Start the development server

```bash
npm run dev
```

Custom port:

```bash
npm run dev -- -p 3006
```

---

## 📜 Scripts

```bash
npm run dev      # Start development server
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
| 🎬 v2.0 | Content Delivery (video, rich text) | 🔜 Next |
| 🔍 v3.0 | Discovery & Trust (search, reviews) | 📅 Planned |
| 🔥 v4.0 | Engagement & Achievement | 📅 Planned |
| 💰 v5.0 | Monetization | 📅 Planned |
| 🏢 v6.0 | Scale & Enterprise | 📅 Planned |

---

## ⚠️ Known Limitations

- 🎬 Lessons do not yet support video or rich text body content — coming in v2.0
- 🌱 Local development requires seeded or manually created published courses and lessons
- 🏗️ Platform is not yet publicly launchable — v2.0 is the target for public launch readiness
