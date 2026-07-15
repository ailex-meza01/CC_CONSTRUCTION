import type { RequestHandler } from "express";
import { addEmployee, listEmployees, removeEmployee } from "./employees.service.js";

export const getEmployees: RequestHandler = async (_request, response, next) => {
  try {
    response.json(await listEmployees());
  } catch (error) {
    next(error);
  }
};

export const postEmployee: RequestHandler = async (request, response, next) => {
  try {
    const { fullName, position, projectName, status } = request.body as Record<string, unknown>;
    if (!fullName || !position || !status) {
      response.status(400).json({ message: "Name, position and status are required." }); return;
    }
    response.status(201).json(await addEmployee({ fullName: String(fullName), position: String(position), projectName: projectName ? String(projectName) : null, status: String(status) }));
  } catch (error) { next(error); }
};

export const deleteEmployee: RequestHandler = async (request, response, next) => {
  try {
    const deleted = await removeEmployee(Number(request.params.id));

    if (!deleted) {
      response.status(404).json({ message: "Employee not found." });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
