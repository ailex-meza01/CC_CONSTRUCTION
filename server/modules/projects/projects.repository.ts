import { getSqlPool } from "../../db/sqlServer.js";
import { sql } from "../../db/sqlServer.js";
import type { CreateProjectInput, Project } from "./projects.types.js";

export const findProjects = async (): Promise<Project[]> => {
  const pool = await getSqlPool();
  const result = await pool.request().query<Project>(`
    SELECT
      id,
      name,
      location,
      manager,
      status,
      progress,
      budget,
      CONVERT(varchar(10), deadline, 23) AS deadline
    FROM dbo.Projects
    ORDER BY created_at DESC
  `);

  return result.recordset;
};

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("name", sql.NVarChar(160), input.name)
    .input("location", sql.NVarChar(160), input.location)
    .input("manager", sql.NVarChar(120), input.manager)
    .input("status", sql.NVarChar(40), input.status)
    .input("progress", sql.Int, input.progress)
    .input("budget", sql.Decimal(18, 2), input.budget)
    .input("deadline", sql.Date, input.deadline)
    .query<Project>(`
      INSERT INTO dbo.Projects (name, location, manager, status, progress, budget, deadline)
      OUTPUT
        INSERTED.id,
        INSERTED.name,
        INSERTED.location,
        INSERTED.manager,
        INSERTED.status,
        INSERTED.progress,
        INSERTED.budget,
        CONVERT(varchar(10), INSERTED.deadline, 23) AS deadline
      VALUES (@name, @location, @manager, @status, @progress, @budget, @deadline)
    `);

  return result.recordset[0];
};

export const deleteProjectById = async (id: number) => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM dbo.Projects WHERE id = @id");

  return (result.rowsAffected[0] ?? 0) > 0;
};
