import "dotenv/config";

const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

export const env = {
  port: toNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  sqlServer: {
    host: process.env.SQL_SERVER_HOST ?? "localhost",
    port: toNumber(process.env.SQL_SERVER_PORT, 1433),
    instance: process.env.SQL_SERVER_INSTANCE,
    database: process.env.SQL_SERVER_DATABASE ?? "cc_construction",
    user: process.env.SQL_SERVER_USER ?? "sa",
    password: process.env.SQL_SERVER_PASSWORD ?? "",
    encrypt: toBoolean(process.env.SQL_SERVER_ENCRYPT, false),
    trustServerCertificate: toBoolean(
      process.env.SQL_SERVER_TRUST_SERVER_CERTIFICATE,
      true,
    ),
  },
};
