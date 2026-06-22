import { createIncident, deleteIncidentById, findIncidents } from "./incidents.repository.js";
import type { CreateIncidentInput } from "./incidents.types.js";

export const listIncidents = async () => findIncidents();

export const addIncident = async (input: CreateIncidentInput) => createIncident(input);

export const removeIncident = async (id: number) => deleteIncidentById(id);
