import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { employeesRouter } from "../modules/employees/employees.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { incidentsRouter } from "../modules/incidents/incidents.routes.js";
import { materialsRouter } from "../modules/materials/materials.routes.js";
import { projectsRouter } from "../modules/projects/projects.routes.js";
import { progressRouter, reportsRouter } from "../modules/operations/operations.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/health", healthRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/employees", employeesRouter);
apiRouter.use("/materials", materialsRouter);
apiRouter.use("/incidents", incidentsRouter);
apiRouter.use("/progress", progressRouter);
apiRouter.use("/reports", reportsRouter);
