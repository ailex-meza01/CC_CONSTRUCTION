export type ProgressUpdate = { id:number; projectName:string; phase:string; percentComplete:number; notes:string; reportedOn:string };
export type Report = { id:number; title:string; reportType:string; periodLabel:string; metricValue:number; metricUnit:string; status:string };
export type CreateProgressInput = Omit<ProgressUpdate,"id">;
export type CreateReportInput = Omit<Report,"id">;
