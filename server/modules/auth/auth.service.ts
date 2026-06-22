import { createHash, timingSafeEqual } from "node:crypto";
import { findUserByEmail } from "./auth.repository.js";
import type { SafeUser } from "./auth.types.js";

const hashPassword = (password: string) =>
  createHash("sha256").update(password, "utf8").digest("hex").toUpperCase();

const hashesMatch = (actual: string, expected: string) => {
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
};

export const loginUser = async (email: string, password: string): Promise<SafeUser | null> => {
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user) return null;

  if (!hashesMatch(hashPassword(password), user.passwordHash)) return null;

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};
