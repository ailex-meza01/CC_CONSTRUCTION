import { Router } from "express";
import { deleteIncident, getIncidents, postIncident } from "./incidents.controller.js";

export const incidentsRouter = Router();

incidentsRouter.get("/", getIncidents);
incidentsRouter.post("/", postIncident);
incidentsRouter.delete("/:id", deleteIncident);
