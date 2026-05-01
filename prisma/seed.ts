import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courses = [
  {
    slug: "intro-to-programming",
    title: "Intro to Programming",
    description:
      "Learn the fundamentals of programming from scratch. No prior experience needed — we'll cover variables, loops, functions, and problem-solving step by step.",
    level: "Beginner",
    lessons: [
      { slug: "what-is-programming", title: "What is Programming?", summary: "A high-level look at what programming means, how computers execute instructions, and what you'll be building by the end of this course." },
      { slug: "variables-and-data-types", title: "Variables & Data Types", summary: "Learn how to store and work with data. We cover strings, numbers, booleans, and how to name things clearly." },
      { slug: "conditionals", title: "Conditionals", summary: "Control the flow of your program with if/else logic. You'll write your first decision-making code." },
      { slug: "loops", title: "Loops", summary: "Automate repetitive tasks using for and while loops. We'll iterate over lists and build simple patterns." },
      { slug: "functions", title: "Functions", summary: "Bundle logic into reusable blocks. Learn how to define, call, and return values from functions." },
      { slug: "intro-project", title: "Mini Project: Number Guessing Game", summary: "Put everything together in a small project that uses variables, loops, conditionals, and functions." },
    ],
  },
  {
    slug: "web-development-foundations",
    title: "Web Development Foundations",
    description:
      "Build your first websites using HTML, CSS, and JavaScript. Understand how the browser works and ship something you can share with the world.",
    level: "Beginner",
    lessons: [
      { slug: "how-the-web-works", title: "How the Web Works", summary: "Clients, servers, HTTP requests — understand the big picture before writing a single line of code." },
      { slug: "html-structure", title: "HTML Structure", summary: "Learn the building blocks of every webpage: elements, tags, attributes, and semantic markup." },
      { slug: "styling-with-css", title: "Styling with CSS", summary: "Add colour, typography, and layout to your pages using selectors, the box model, and flexbox." },
      { slug: "javascript-in-the-browser", title: "JavaScript in the Browser", summary: "Make pages interactive — handle events, update the DOM, and respond to user input." },
      { slug: "responsive-design", title: "Responsive Design", summary: "Make your site look great on any screen size using media queries and mobile-first principles." },
      { slug: "deploy-your-site", title: "Deploy Your Site", summary: "Publish your project to the internet for free using GitHub Pages or Vercel." },
    ],
  },
  {
    slug: "react-for-beginners",
    title: "React for Beginners",
    description:
      "Go from zero to building real React applications. Learn components, state, props, hooks, and how to fetch data from an API.",
    level: "Intermediate",
    lessons: [
      { slug: "why-react", title: "Why React?", summary: "Understand the problem React solves and how its component model differs from plain HTML and JS." },
      { slug: "jsx-and-components", title: "JSX & Components", summary: "Write your first components using JSX syntax. Learn how to break a UI into composable pieces." },
      { slug: "props-and-state", title: "Props & State", summary: "Pass data between components with props and manage local state with useState." },
      { slug: "useeffect-and-data-fetching", title: "useEffect & Data Fetching", summary: "Run side effects and fetch data from an API using the useEffect hook." },
      { slug: "forms-and-controlled-inputs", title: "Forms & Controlled Inputs", summary: "Handle user input properly with controlled components and form submission patterns." },
      { slug: "react-router", title: "Routing with React Router", summary: "Add multiple pages to your app and navigate between them without a full page reload." },
      { slug: "react-capstone", title: "Capstone: Build a Movie Browser", summary: "Combine everything — components, hooks, routing, and API data — into a complete mini-app." },
    ],
  },
  {
    slug: "typescript-essentials",
    title: "TypeScript Essentials",
    description:
      "Add type safety to your JavaScript projects. Learn TypeScript from the basics through generics, utility types, and real-world patterns used in production codebases.",
    level: "Intermediate",
    lessons: [
      { slug: "why-typescript", title: "Why TypeScript?", summary: "Understand the benefits of static typing and how TypeScript catches bugs before your code runs." },
      { slug: "basic-types", title: "Basic Types", summary: "string, number, boolean, arrays, tuples, and the any/unknown escape hatches." },
      { slug: "interfaces-and-types", title: "Interfaces & Type Aliases", summary: "Define the shape of your data with interfaces and type aliases. Know when to use each." },
      { slug: "functions-in-ts", title: "Typing Functions", summary: "Add types to function parameters, return values, and callbacks. Understand void vs never." },
      { slug: "generics", title: "Generics", summary: "Write reusable, type-safe code with generic functions and interfaces." },
      { slug: "utility-types", title: "Utility Types", summary: "Leverage built-in helpers like Partial, Required, Pick, Omit, and Record." },
      { slug: "ts-in-react", title: "TypeScript in React", summary: "Type your components, props, hooks, and event handlers in a real React project." },
    ],
  },
  {
    slug: "backend-with-nodejs",
    title: "Backend Development with Node.js",
    description:
      "Build server-side applications with Node.js and Express. Cover REST APIs, databases, authentication, and deploy a production-ready backend.",
    level: "Advanced",
    lessons: [
      { slug: "node-fundamentals", title: "Node.js Fundamentals", summary: "Understand the event loop, modules, and the Node runtime. Write your first server-side script." },
      { slug: "express-basics", title: "Express Basics", summary: "Set up an Express app, define routes, and handle HTTP methods." },
      { slug: "middleware", title: "Middleware", summary: "Learn how middleware chains work. Add logging, parsing, and error handling to your API." },
      { slug: "database-with-prisma", title: "Database with Prisma", summary: "Connect to PostgreSQL, define a schema, run migrations, and query data with Prisma ORM." },
      { slug: "rest-api-design", title: "REST API Design", summary: "Design clean, consistent endpoints following REST conventions. Handle errors gracefully." },
      { slug: "auth-with-jwt", title: "Authentication with JWT", summary: "Implement token-based authentication. Protect routes and manage refresh tokens." },
      { slug: "testing-apis", title: "Testing APIs", summary: "Write integration tests for your endpoints using Vitest and Supertest." },
      { slug: "deploy-backend", title: "Deploy to Production", summary: "Ship your backend to Railway or Render with environment variables and a CI pipeline." },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const course of courses) {
    const { lessons, ...courseData } = course;

    const upsertedCourse = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        lessons: lessons.length,
        status: "published",
      },
      create: {
        slug: courseData.slug,
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        lessons: lessons.length,
        status: "published",
      },
    });

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      await prisma.lesson.upsert({
        where: {
          courseId_slug: {
            courseId: upsertedCourse.id,
            slug: lesson.slug,
          },
        },
        update: {
          title: lesson.title,
          summary: lesson.summary,
          position: i + 1,
        },
        create: {
          courseId: upsertedCourse.id,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          position: i + 1,
        },
      });
    }

    console.log(`  ✓ ${courseData.title} (${lessons.length} lessons)`);
  }

  console.log("\nDone. Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
