import type { RequestHandler } from "express";
import { listEmployees, removeEmployee } from "./employees.service.js";

export const getEmployees: RequestHandler = async (_request, response, next) => {
  try {
    response.json(await listEmployees());
  } catch (error) {
    next(error);
  }
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
