import type { RequestHandler } from "express";
import { addIncident, listIncidents, removeIncident } from "./incidents.service.js";

export const getIncidents: RequestHandler = async (_request, response, next) => {
  try {
    response.json(await listIncidents());
  } catch (error) {
    next(error);
  }
};

export const postIncident: RequestHandler = async (request, response, next) => {
  try {
    const { description, priority, projectName, evidenceCount } = request.body as Record<string, unknown>;

    if (!description || !priority || !projectName) {
      response.status(400).json({ message: "Description, priority and project are required." });
      return;
    }

    const incident = await addIncident({
      description: String(description),
      priority: String(priority),
      projectName: String(projectName),
      evidenceCount: Number(evidenceCount ?? 0),
    });

    response.status(201).json(incident);
  } catch (error) {
    next(error);
  }
};

export const deleteIncident: RequestHandler = async (request, response, next) => {
  try {
    const deleted = await removeIncident(Number(request.params.id));

    if (!deleted) {
      response.status(404).json({ message: "Incident not found." });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
