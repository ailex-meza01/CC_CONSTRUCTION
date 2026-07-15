import { readFile } from "node:fs/promises";
import path from "node:path";
import { closeSqlPool, getSqlPool } from "../server/db/sqlServer.js";

const run = async () => {
  const sqlText = await readFile(path.join(process.cwd(), "scripts", "initialize-database.sql"), "utf8");
  const batches = sqlText.split(/^\s*GO\s*$/gim).map((batch) => batch.trim()).filter(Boolean);
  const pool = await getSqlPool();
  for (const batch of batches) await pool.request().batch(batch);
  console.log(`Database initialized (${batches.length} batches).`);
};

run()
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(closeSqlPool);
