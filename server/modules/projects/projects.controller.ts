import type { RequestHandler } from "express";
import { addProject, listProjects, removeProject } from "./projects.service.js";

export const getProjects: RequestHandler = async (_request, response, next) => {
  try {
    response.json(await listProjects());
  } catch (error) {
    next(error);
  }
};

export const postProject: RequestHandler = async (request, response, next) => {
  try {
    const { name, location, manager, status, progress, budget, deadline } = request.body as Record<string, unknown>;

    if (!name || !location || !manager || !status) {
      response.status(400).json({ message: "Name, location, manager and status are required." });
      return;
    }

    const project = await addProject({
      name: String(name),
      location: String(location),
      manager: String(manager),
      status: String(status),
      progress: Number(progress ?? 0),
      budget: Number(budget ?? 0),
      deadline: deadline ? String(deadline) : null,
    });

    response.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject: RequestHandler = async (request, response, next) => {
  try {
    const deleted = await removeProject(Number(request.params.id));

    if (!deleted) {
      response.status(404).json({ message: "Project not found." });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
