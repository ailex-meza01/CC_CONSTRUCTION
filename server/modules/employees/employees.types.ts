export type Employee = {
  id: number;
  fullName: string;
  position: string;
  projectName: string | null;
  status: string;
};

export type CreateEmployeeInput = Omit<Employee, "id">;
