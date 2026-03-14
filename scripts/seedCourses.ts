import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { courses } from "../lib/courses";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        description: course.description,
        level: course.level,
        lessons: course.lessons,
      },
      create: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        lessons: course.lessons,
      },
    });
  }

  console.log("✅ Courses seeded successfully");
}

main()
  .catch((error) => {
    console.error("❌ Failed to seed courses:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });