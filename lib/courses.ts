export type Lesson = {
  title: string;
  slug: string;
};

export type Course = {
  id: number;
  slug: string;
  title: string;
  description: string;
  lessons: number;
  level: string;
  lessonList: Lesson[];
};

export const courses: Course[] = [
  {
    id: 1,
    slug: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    description:
      "Learn the foundations of cybersecurity, threats, and defense concepts.",
    lessons: 4,
    level: "Beginner",
    lessonList: [
      {
        title: "Introduction to Cybersecurity",
        slug: "introduction-to-cybersecurity",
      },
      {
        title: "CIA Triad",
        slug: "cia-triad",
      },
      {
        title: "Common Threats",
        slug: "common-threats",
      },
      {
        title: "Basic Defense Practices",
        slug: "basic-defense-practices",
      },
    ],
  },
  {
    id: 2,
    slug: "introduction-to-web-development",
    title: "Introduction to Web Development",
    description:
      "Understand HTML, CSS, JavaScript, and modern frontend basics.",
    lessons: 4,
    level: "Beginner",
    lessonList: [
      {
        title: "HTML Basics",
        slug: "html-basics",
      },
      {
        title: "CSS Fundamentals",
        slug: "css-fundamentals",
      },
      {
        title: "JavaScript Introduction",
        slug: "javascript-introduction",
      },
      {
        title: "Responsive Design",
        slug: "responsive-design",
      },
    ],
  },
  {
    id: 3,
    slug: "python-for-beginners",
    title: "Python for Beginners",
    description:
      "Start coding with Python and build confidence through practice.",
    lessons: 4,
    level: "Beginner",
    lessonList: [
      {
        title: "Python Syntax",
        slug: "python-syntax",
      },
      {
        title: "Variables and Data Types",
        slug: "variables-and-data-types",
      },
      {
        title: "Conditions and Loops",
        slug: "conditions-and-loops",
      },
      {
        title: "Functions",
        slug: "functions",
      },
    ],
  },
];