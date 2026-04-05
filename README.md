# 🎓 Paidevia - Modern LMS Platform

Paidevia is a modern Learning Management System built with Next.js, TypeScript, TailwindCSS, Prisma, PostgreSQL, and NextAuth. It is designed to deliver a clean student learning experience, a structured admin workflow, and a strong foundation for future platform growth.

## ✨ Overview

Paidevia helps learners browse courses, follow lessons, track progress, and continue learning from a dedicated dashboard. It also includes a protected admin area for managing users and course status.

## 🚀 Core Features

- 🔐 Google and GitHub authentication
- 🗄️ Persistent users stored in PostgreSQL
- 📚 Course listing page
- 📖 Course details page
- 🎬 Lesson player
- 📈 Progress tracking backed by the database
- 🧭 Student dashboard
- 👤 Profile page
- 🛡️ Protected admin dashboard
- 👥 User management
- 🧩 Course management
- 🏷️ Role system foundation

## 🛠️ Tech Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- Prisma
- PostgreSQL
- NextAuth / Auth.js

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd paidevia
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env.local
```

Required variables:

- `DATABASE_URL`
- `AUTH_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`

Notes:

- The current codebase uses `AUTH_*` environment variables in [`auth.ts`](./auth.ts).
- `NEXTAUTH_*` and provider compatibility placeholders are also included in `.env.example` for convenience.

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run dev
```

If you prefer a custom port:

```bash
npm run dev -- -p 3006
```

## 📜 Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 🧱 Project Surface

### 🔐 Authentication

- Google login
- GitHub login
- Database-backed sessions

### 🎓 LMS Core

- Course browsing
- Course details
- Lesson pages
- Continue learning flow
- Student dashboard
- Progress persistence

### 🛡️ Admin

- Protected admin dashboard
- User role management
- Course status management

## ⚠️ Known Limitations

- Some UI refinement is still ongoing
- Public learning flows now use database-backed content, so local development requires seeded or manually created published courses and lessons
- Some older project artifacts may still remain in the repository while the migration cleanup is completed

## 🚀 Release

Current release target:

**v1.2.0 - Full Course Data Migration**

This release focuses on making the public LMS experience fully database-backed, so instructor-created published courses and lessons can power the student-facing platform end to end.
