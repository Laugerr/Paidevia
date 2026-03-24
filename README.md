# Paidevia - Modern LMS Platform

Paidevia is a modern Learning Management System built with Next.js, TypeScript, TailwindCSS, Prisma, PostgreSQL, and NextAuth. It provides a clean learning experience for students, an admin surface for platform management, and a strong foundation for future instructor workflows.

## Overview

Paidevia helps students browse courses, complete lessons, track progress, and continue learning from a dedicated dashboard. It also includes an admin area for managing users, roles, and course status.

## Features

- Authentication with Google and GitHub
- Persistent user records stored in PostgreSQL
- Course listing and course detail pages
- Lesson player experience
- Progress tracking backed by the database
- Student dashboard
- Profile page
- Admin dashboard
- User management with role updates
- Course management with status control
- Role system for `student`, `admin`, and instructor groundwork

## Tech Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- Prisma
- PostgreSQL
- NextAuth / Auth.js

## Installation

### 1. Clone the project

```bash
git clone <your-repository-url>
cd paidevia
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file from the example:

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

- The project currently reads Auth.js provider credentials from `AUTH_*` variables in `auth.ts`.
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are included in `.env.example` as compatibility placeholders for developers who still use the older naming style.

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

## Project Surface

### Authentication

- Google login
- GitHub login
- Database-backed sessions

### Core LMS

- Course browsing
- Lesson pages
- Database progress tracking
- Continue learning flow
- Student dashboard

### Admin

- Protected admin dashboard
- User role management
- Course status management

## Known Limitations

- Public course pages still read from `lib/courses.ts`
- Admin course management already uses database data
- Instructor system is not implemented yet
- UI is still under refinement

## Roadmap

### v1.1

- UI improvements and consistency polish

### v1.2

- Instructor system
- Instructor dashboard
- Course creation workflow

### v2.0

- Full course and lesson migration to database-backed public pages

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Release Status

This repository is being prepared for:

**v1.0.0 - Core LMS System**
