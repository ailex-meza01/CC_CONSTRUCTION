import { Router } from "express";
import { deleteEmployee, getEmployees } from "./employees.controller.js";

export const employeesRouter = Router();

employeesRouter.get("/", getEmployees);
employeesRouter.delete("/:id", deleteEmployee);
