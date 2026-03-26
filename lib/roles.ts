export const USER_ROLES = ["student", "instructor", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = "student";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  instructor: "Instructor",
  admin: "Admin",
};

export function isUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

export function isAdminRole(role: string | null | undefined): role is "admin" {
  return role === "admin";
}

export function isInstructorRole(
  role: string | null | undefined
): role is "instructor" {
  return role === "instructor";
}

export function canAccessInstructorArea(
  role: string | null | undefined
): role is "instructor" | "admin" {
  return isInstructorRole(role) || isAdminRole(role);
}
