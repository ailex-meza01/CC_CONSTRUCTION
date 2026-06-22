import { Router } from "express";
import { deleteProject, getProjects, postProject } from "./projects.controller.js";

export const projectsRouter = Router();

projectsRouter.get("/", getProjects);
projectsRouter.post("/", postProject);
projectsRouter.delete("/:id", deleteProject);
