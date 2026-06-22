import type { RequestHandler } from "express";
import { testSqlConnection } from "../../db/sqlServer.js";

export const getHealth: RequestHandler = async (_request, response) => {
  let database = "disconnected";

  try {
    database = (await testSqlConnection()) ? "connected" : "disconnected";
  } catch {
    database = "disconnected";
  }

  response.json({
    status: "ok",
    database,
    timestamp: new Date().toISOString(),
  });
};
