export type Incident = {
  id: number;
  description: string;
  priority: string;
  projectName: string;
  evidenceCount: number;
};

export type CreateIncidentInput = Omit<Incident, "id">;
