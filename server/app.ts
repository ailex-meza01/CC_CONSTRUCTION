import cors from "cors";
import express from "express";
import path from "node:path";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { apiRouter } from "./routes/api.routes.js";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "12mb" }));
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
