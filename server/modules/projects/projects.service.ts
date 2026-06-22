import { createProject, deleteProjectById, findProjects } from "./projects.repository.js";
import type { CreateProjectInput } from "./projects.types.js";

export const listProjects = async () => findProjects();

export const addProject = async (input: CreateProjectInput) => createProject(input);

export const removeProject = async (id: number) => deleteProjectById(id);
