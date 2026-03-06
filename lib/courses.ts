export type Course = {
  id: number;
  slug: string;
  title: string;
  description: string;
  lessons: number;
  level: string;
  lessonList: string[];
};

export const courses: Course[] = [
  {
    id: 1,
    slug: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    description:
      "Learn the foundations of cybersecurity, threats, and defense concepts.",
    lessons: 12,
    level: "Beginner",
    lessonList: [
      "Introduction to Cybersecurity",
      "CIA Triad",
      "Common Threats",
      "Basic Defense Practices",
    ],
  },
  {
    id: 2,
    slug: "introduction-to-web-development",
    title: "Introduction to Web Development",
    description:
      "Understand HTML, CSS, JavaScript, and modern frontend basics.",
    lessons: 18,
    level: "Beginner",
    lessonList: [
      "HTML Basics",
      "CSS Fundamentals",
      "JavaScript Introduction",
      "Responsive Design",
    ],
  },
  {
    id: 3,
    slug: "python-for-beginners",
    title: "Python for Beginners",
    description:
      "Start coding with Python and build confidence through practice.",
    lessons: 15,
    level: "Beginner",
    lessonList: [
      "Python Syntax",
      "Variables and Data Types",
      "Conditions and Loops",
      "Functions",
    ],
  },
];