export const USER_ROLES = ["student", "instructor", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}
