import sql from "mssql";
import { env } from "../config/env.js";

let pool: sql.ConnectionPool | null = null;

const sqlConfig: sql.config = {
  server: env.sqlServer.host,
  database: env.sqlServer.database,
  user: env.sqlServer.user,
  password: env.sqlServer.password,
  options: {
    encrypt: env.sqlServer.encrypt,
    trustServerCertificate: env.sqlServer.trustServerCertificate,
    ...(env.sqlServer.instance
      ? { instanceName: env.sqlServer.instance }
      : {}),
  },
  pool: {
    min: 0,
    max: 10,
    idleTimeoutMillis: 30000,
  },
};

if (!env.sqlServer.instance) {
  sqlConfig.port = env.sqlServer.port;
}

export const getSqlPool = async () => {
  if (pool?.connected) return pool;

  pool = await new sql.ConnectionPool(sqlConfig).connect();
  return pool;
};

export const testSqlConnection = async () => {
  const activePool = await getSqlPool();
  const result = await activePool.request().query("SELECT 1 AS ok");
  return result.recordset[0]?.ok === 1;
};

export const closeSqlPool = async () => {
  if (!pool) return;
  await pool.close();
  pool = null;
};

export { sql };
