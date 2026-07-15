import { createEmployee, deleteEmployeeById, findEmployees } from "./employees.repository.js";
import type { CreateEmployeeInput } from "./employees.types.js";

export const listEmployees = async () => findEmployees();
export const addEmployee = async (input: CreateEmployeeInput) => createEmployee(input);

export const removeEmployee = async (id: number) => deleteEmployeeById(id);
