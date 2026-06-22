import { getSqlPool } from "../../db/sqlServer.js";
import { sql } from "../../db/sqlServer.js";
import type { CreateMaterialInput, Material } from "./materials.types.js";

export const findMaterials = async (): Promise<Material[]> => {
  const pool = await getSqlPool();
  const result = await pool.request().query<Material>(`
    SELECT
      id,
      name,
      movement_type AS movementType,
      quantity,
      destination
    FROM dbo.Materials
    ORDER BY created_at DESC
  `);

  return result.recordset;
};

export const createMaterial = async (input: Omit<CreateMaterialInput, "image">): Promise<Material> => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("name", sql.NVarChar(160), input.name)
    .input("movementType", sql.NVarChar(40), input.movementType)
    .input("quantity", sql.NVarChar(80), input.quantity)
    .input("destination", sql.NVarChar(160), input.destination)
    .query<Material>(`
      INSERT INTO dbo.Materials (name, movement_type, quantity, destination)
      OUTPUT
        INSERTED.id,
        INSERTED.name,
        INSERTED.movement_type AS movementType,
        INSERTED.quantity,
        INSERTED.destination
      VALUES (@name, @movementType, @quantity, @destination)
    `);

  return result.recordset[0];
};

export const deleteMaterialById = async (id: number) => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM dbo.Materials WHERE id = @id");

  return (result.rowsAffected[0] ?? 0) > 0;
};
