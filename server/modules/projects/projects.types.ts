export type Project = {
  id: number;
  name: string;
  location: string;
  manager: string;
  status: string;
  progress: number;
  budget: number;
  deadline: string | null;
};

export type CreateProjectInput = Omit<Project, "id">;
