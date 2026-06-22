import { getSqlPool } from "../../db/sqlServer.js";
import { sql } from "../../db/sqlServer.js";
import type { CreateIncidentInput, Incident } from "./incidents.types.js";

export const findIncidents = async (): Promise<Incident[]> => {
  const pool = await getSqlPool();
  const result = await pool.request().query<Incident>(`
    SELECT
      id,
      description,
      priority,
      project_name AS projectName,
      evidence_count AS evidenceCount
    FROM dbo.Incidents
    ORDER BY created_at DESC
  `);

  return result.recordset;
};

export const createIncident = async (input: CreateIncidentInput): Promise<Incident> => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("description", sql.NVarChar(300), input.description)
    .input("priority", sql.NVarChar(40), input.priority)
    .input("projectName", sql.NVarChar(160), input.projectName)
    .input("evidenceCount", sql.Int, input.evidenceCount)
    .query<Incident>(`
      INSERT INTO dbo.Incidents (description, priority, project_name, evidence_count)
      OUTPUT
        INSERTED.id,
        INSERTED.description,
        INSERTED.priority,
        INSERTED.project_name AS projectName,
        INSERTED.evidence_count AS evidenceCount
      VALUES (@description, @priority, @projectName, @evidenceCount)
    `);

  return result.recordset[0];
};

export const deleteIncidentById = async (id: number) => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM dbo.Incidents WHERE id = @id");

  return (result.rowsAffected[0] ?? 0) > 0;
};
