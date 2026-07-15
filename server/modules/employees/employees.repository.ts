import { getSqlPool } from "../../db/sqlServer.js";
import { sql } from "../../db/sqlServer.js";
import type { CreateEmployeeInput, Employee } from "./employees.types.js";

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

export const createEmployee = async (input: CreateEmployeeInput): Promise<Employee> => {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input("fullName", sql.NVarChar(140), input.fullName)
    .input("position", sql.NVarChar(100), input.position)
    .input("projectName", sql.NVarChar(160), input.projectName)
    .input("status", sql.NVarChar(40), input.status)
    .query<Employee>(`INSERT dbo.Employees (full_name, position, project_name, status)
      OUTPUT INSERTED.id, INSERTED.full_name AS fullName, INSERTED.position,
      INSERTED.project_name AS projectName, INSERTED.status
      VALUES (@fullName, @position, @projectName, @status)`);
  return result.recordset[0];
};

export const deleteEmployeeById = async (id: number) => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM dbo.Employees WHERE id = @id");

  return (result.rowsAffected[0] ?? 0) > 0;
};
