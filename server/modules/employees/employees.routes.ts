import { Router } from "express";
import { deleteEmployee, getEmployees, postEmployee } from "./employees.controller.js";

export const employeesRouter = Router();

employeesRouter.get("/", getEmployees);
employeesRouter.post("/", postEmployee);
employeesRouter.delete("/:id", deleteEmployee);
