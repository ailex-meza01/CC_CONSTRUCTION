import { deleteEmployeeById, findEmployees } from "./employees.repository.js";

export const listEmployees = async () => findEmployees();

export const removeEmployee = async (id: number) => deleteEmployeeById(id);
