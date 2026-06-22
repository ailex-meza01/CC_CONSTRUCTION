import { createServer } from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { closeSqlPool, testSqlConnection } from "./db/sqlServer.js";

const server = createServer(app);

const logDatabaseStatus = async () => {
  const target = `${env.sqlServer.host}:${env.sqlServer.port}/${env.sqlServer.database}`;

  try {
    const connected = await testSqlConnection();

    if (connected) {
      console.log(`SQL Server connected: ${target} as ${env.sqlServer.user}`);
      return;
    }

    console.warn(`SQL Server check failed: ${target}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`SQL Server disconnected: ${target}`);
    console.warn(`Reason: ${message}`);
  }
};

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${env.port} is already in use.`);
    console.error("Close the previous API process or set a different PORT in .env.");
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});

server.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
  void logDatabaseStatus();
});

const shutdown = async () => {
  console.log("Shutting down API...");
  server.close(async () => {
    await closeSqlPool();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
