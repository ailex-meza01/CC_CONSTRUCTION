export type UserRole = "Administrator" | "Project Manager" | "Field Crew";

export type DbUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
};

export type SafeUser = Omit<DbUser, "passwordHash">;
