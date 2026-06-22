import { getSqlPool, sql } from "../../db/sqlServer.js";
import type { DbUser } from "./auth.types.js";

export const findUserByEmail = async (email: string): Promise<DbUser | null> => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("email", sql.NVarChar(180), email)
    .query<DbUser>(`
      SELECT
        id,
        full_name AS name,
        email,
        role,
        password_hash AS passwordHash
      FROM dbo.Users
      WHERE email = @email
        AND is_active = 1
    `);

  return result.recordset[0] ?? null;
};
