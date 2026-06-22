import { getSqlPool } from "../../db/sqlServer.js";
import { sql } from "../../db/sqlServer.js";
import type { Employee } from "./employees.types.js";

export const findEmployees = async (): Promise<Employee[]> => {
  const pool = await getSqlPool();
  const result = await pool.request().query<Employee>(`
    SELECT
      id,
      full_name AS fullName,
      position,
      project_name AS projectName,
      status
    FROM dbo.Employees
    ORDER BY created_at DESC
  `);

  return result.recordset;
};

export const deleteEmployeeById = async (id: number) => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM dbo.Employees WHERE id = @id");

  return (result.rowsAffected[0] ?? 0) > 0;
};
