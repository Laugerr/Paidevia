# 🎓 Paidevia — Release Plan

> A living document tracking what has shipped and where the platform is headed.
> Updated: 2026-04-14

---

## 🧭 Platform Overview

**Paidevia** is a modern Learning Management System (LMS) built on Next.js 16 (App Router), PostgreSQL via Prisma ORM, and NextAuth 5 for authentication. The platform supports three roles — student, instructor, and admin — and delivers a structured, self-paced learning experience.

**Current Status:** v1.2.0 shipped — full course data migrated to database, instructor foundation live. Lessons lack deliverable content (video, text body). Platform is not yet publicly launchable.

---

## ✅ Shipped Releases

---

### 🚀 v1.0.0 — Core LMS System

**Goal: Stand up the foundational LMS platform with authentication, student learning flow, and admin controls.**

#### 🔐 Authentication & Roles
- Google and GitHub OAuth login
- Database-persistent sessions via NextAuth 5 + Prisma adapter
- Role-based access control: `student`, `instructor`, `admin`
- Protected routes per role with server-side enforcement

#### 🎒 Student Learning Flow
- Public course catalog with published courses
- Course detail pages (description, lessons, level)
- One-click enrollment system
- Lesson player with per-lesson completion tracking
- Student dashboard:
  - Enrolled courses and "continue learning" resume point
  - Completion percentage, lesson count, and study time stats
  - Recommended courses feed
  - Achievement and streak display (UI)
- User profile page (name, username, email, account ID, role)

#### 🛡️ Admin Panel
- Platform-wide stats (total users, courses, enrollments, lesson completions)
- User management: view all users, change roles, with self-protection guard
- Course moderation: view all courses, change status, control visibility

#### 🗄️ Data & Architecture
- PostgreSQL schema: User, Course, Lesson, Enrollment, LessonProgress, Account, Session
- Composite unique constraints for enrollment and progress integrity
- Server components for data fetching, client components for interactivity

---

### 🧑‍🏫 v1.1.0 — Instructor Foundation

**Goal: Give instructors the tools to build and publish courses end-to-end.**

- Course creation with title, slug, description, and level
- Lesson management: add, order, and describe lessons within courses
- Publishing workflow: `draft → published → archived`
- Publishing readiness checklist (required fields + minimum one lesson)
- Instructor dashboard with owned courses, status counts, and enrollment metrics
- Hardened public access and learning flow integrity

---

### 🗃️ v1.2.0 — Full Course Data Migration *(Latest)*

**Goal: Eliminate all static course data — every course and lesson served from the database.**

- All course content migrated from static files to database-backed storage
- Home page course data migrated to database
- Polished learner progress feedback across the full LMS flow
- Improved empty state handling for students across the learning flow
- Static course data files removed post-migration

---

## 🚀 Upcoming Releases

---

## v2.0 — 🎬 Content Comes Alive

**Goal: Make lessons real. A student enrolls, watches or reads actual content, and finishes a course. This is the first version worthy of a public launch.**

### ✨ Features
- 📹 **Video Hosting Integration** — Embed and stream lesson videos via a provider (Mux, Cloudinary Video, or YouTube embed as a fast path). Lesson model gains a `videoUrl` field and the lesson player renders the video.
- ✍️ **Rich Lesson Content Editor** — Instructors get a WYSIWYG / markdown editor (Tiptap or Markdoc) with heading, list, code block, image upload, and callout support. Lesson body stored as structured JSON or markdown in the database.
- 📎 **File & Asset Uploads** — Instructors can attach supplementary materials (PDFs, slides) to lessons. Storage via S3-compatible bucket (Cloudflare R2 or AWS S3).
- 🖼️ **Course Thumbnail Images** — Courses have cover images uploaded by instructors. Displayed on catalog cards and course detail pages.
- 🏁 **True Course Completion** — Auto-detect when a student has completed all lessons in an enrolled course, mark it as completed, and display the completion state in the dashboard.
- ⬅️➡️ **Lesson Navigation UX** — Previous / Next lesson buttons inside the player, sidebar showing lesson list with completion checkmarks, and keyboard shortcut support.
- ⚡ **Database Indexes** — Add indexes on `userId`, `courseId`, `status`, and `lessonSlug` for query performance at scale.

### 🏆 Definition of Done
A student can log in, find a published course, enroll, watch videos, read lesson content, and mark the course as complete — entirely through the platform.

---

## v3.0 — 🔍 Discovery & Trust

**Goal: Help learners find the right courses and decide with confidence. Turn the catalog from a list into a discovery engine.**

### ✨ Features
- 🏷️ **Course Categories & Tags** — Structured taxonomy (e.g., Programming, Design, Business). Courses tagged by instructors, category pages surfaced publicly. Home page categories link to live filtered results.
- 🔎 **Full-Text Search** — Search bar on the catalog with PostgreSQL full-text search across course titles, descriptions, and tags. Instant results with keyboard navigation.
- ⭐ **Ratings & Reviews** — Students who complete a course can leave a star rating and written review. Courses display average rating and review count on catalog cards and detail pages.
- 👤 **Instructor Public Profiles** — Each instructor gets a public profile page showing their bio, photo, and all published courses. Linked from every course detail page.
- 🔗 **Course Prerequisites** — Instructors can mark prerequisite courses. Students see what they should complete first. Advisory only for v2.0, enforceable in v3.0.
- 📄 **Pagination & Sorting** — Catalog and admin list pages paginate at 20 items. Sort by newest, rating, enrollment count, or alphabetical.
- 🌐 **SEO & Open Graph** — Dynamic `<title>`, `description`, and Open Graph meta tags for course and instructor pages. Proper canonical URLs.

### 🏆 Definition of Done
A first-time visitor can discover a course through category browsing or search, read reviews and instructor bio, and make an informed decision to enroll — without needing a direct link.

---

## v4.0 — 🔥 Engagement & Achievement

**Goal: Give learners reasons to come back. Build the mechanics that turn one-time visitors into active, returning students.**

### ✨ Features
- 🎓 **Certificates of Completion** — Auto-generated PDF certificate when a course is completed. Unique verification URL per certificate. Downloadable and shareable. Instructors can customize certificate template (course name, their logo).
- 🏅 **Badge & Achievement System** — Persistent badges earned for milestones: First Enrollment, First Completion, 7-Day Streak, 5 Courses Completed, etc. Displayed on profile and dashboard.
- 🔥 **Streak & Learning Goals** — Daily learning streak tracked server-side (not just UI). Weekly goal setting (e.g., complete 3 lessons this week). Progress ring on dashboard.
- 📬 **Email Notifications** — Transactional email via Resend or Postmark: enrollment confirmation, weekly learning recap, course update alerts for enrolled students, certificate delivery.
- 💬 **Lesson Q&A / Comments** — Per-lesson threaded discussion where students ask questions and instructors answer. Instructors can pin top answers. Lightweight, not a full forum.
- 📢 **Course Announcements** — Instructors broadcast announcements to enrolled students (stored + email delivery).
- 📊 **Instructor Analytics** — Instructors see per-course analytics: enrollment over time, average completion rate, lesson drop-off points, rating breakdown.

### 🏆 Definition of Done
A student has visible reasons to return daily (streaks, goals), feels recognized for their progress (badges, certificates), and can get their questions answered without leaving the platform.

---

## v5.0 — 💰 Monetization

**Goal: Make Paidevia financially self-sustaining by enabling instructors to sell courses and the platform to take a revenue share.**

### ✨ Features
- 💵 **Paid Course Pricing** — Instructors set a price on courses (USD, fixed). Free and paid courses coexist. Price displayed on catalog and enforced at enrollment.
- 💳 **Stripe Checkout Integration** — One-time payment flow via Stripe. Checkout hosted by Stripe, redirect back to Paidevia on success. Payment receipt emailed automatically.
- 🏦 **Instructor Payout System** — Platform keeps a configurable revenue share (e.g., 20%). Remaining balance tracked per instructor and paid out via Stripe Connect on a monthly schedule.
- 🎟️ **Coupon & Discount Codes** — Instructors create coupon codes (percentage or fixed discount, usage limits, expiry). Applied at checkout.
- 👑 **Subscription Tier (Paidevia Pro)** — Optional platform-level subscription giving access to all courses for a monthly fee. Managed via Stripe Subscriptions. Instructors opted into the subscription pool get a share of pool revenue proportional to minutes watched.
- 🧾 **Invoice & Billing History** — Students see past purchases in their profile. Instructors see their earnings history and payout schedule.
- 🔄 **Refund Policy Enforcement** — Configurable refund window (e.g., 30-day no-questions-asked). Admin refund interface connected to Stripe.

### 🏆 Definition of Done
An instructor can publish a paid course, a student can purchase it with a credit card, and the instructor receives a payout — with the platform taking its cut automatically.

---

## v6.0 — 🏢 Scale & Enterprise

**Goal: Open Paidevia to organizations. Enable teams, companies, and institutions to run the platform as their own internal or branded learning hub.**

### ✨ Features
- 🏗️ **Organizations / Workspaces** — A company or institution creates an organization. Admins invite members via email. Members get auto-enrolled in designated courses. Usage isolated per organization.
- 🎨 **White-Label / Custom Branding** — Organizations configure custom logo, primary color, and domain. The platform renders under their brand (e.g., `learn.acme.com`).
- 🔑 **SSO Integration** — SAML 2.0 / OIDC support so enterprise users log in with their company identity provider (Okta, Azure AD, Google Workspace).
- 📈 **Team Analytics & Reporting** — Organization admins see team-level dashboards: who completed what, time spent, compliance training status. Exportable to CSV.
- 👥 **Bulk Enrollment & Assignments** — Admins assign courses to groups or all members at once. Deadline-based assignments with completion tracking.
- 🔌 **API Platform** — Public REST API with API key auth so organizations can integrate Paidevia data into their own dashboards, HR systems, or Slack bots. Rate-limited and documented.
- 🗂️ **Audit Logs** — Full activity log for admin and instructor actions within an organization. Filterable by user, action type, and date range.
- ⚙️ **SLA & Uptime Guarantees** — Infrastructure hardening: Redis caching layer, read replicas for analytics queries, CDN for static assets, monitoring dashboards.

### 🏆 Definition of Done
A 500-person company onboards their team, assigns mandatory compliance courses, tracks completion rates for their HR department, and has their employees experience Paidevia under the company's own brand and domain.

---

## 📅 Release Timeline (Targets)

| Release | Focus                        | Status         | Target Quarter |
|---------|------------------------------|----------------|---------------|
| v1.0.0  | 🚀 Core LMS System            | ✅ Shipped      | Q1 2026       |
| v1.1.0  | 🧑‍🏫 Instructor Foundation     | ✅ Shipped      | Q1 2026       |
| v1.2.0  | 🗃️ Full Course Data Migration  | ✅ Shipped      | Q1 2026       |
| v2.0    | 🎬 Content Delivery           | 🔜 Next        | Q2 2026       |
| v3.0    | 🔍 Discovery & Trust          | 📅 Planned     | Q3 2026       |
| v4.0    | 🔥 Engagement & Achievement   | 📅 Planned     | Q4 2026       |
| v5.0    | 💰 Monetization               | 📅 Planned     | Q1 2027       |
| v6.0    | 🏢 Scale & Enterprise         | 📅 Planned     | Q3 2027       |

---

## 🧱 Guiding Principles

1. 🔄 **Finish the loop before expanding it.** Each release should close one complete user journey before adding new ones.
2. 🗄️ **Database-first.** Every feature is data-backed from day one — no static files, no hardcoded content.
3. 👥 **Roles are first-class citizens.** Every feature is built with student, instructor, and admin perspectives explicitly designed.
4. 🚢 **Ship working software.** A feature is done when a real user can complete the full flow end-to-end, not when the UI exists.
