import { getSqlPool, sql } from "../../db/sqlServer.js";
import type { CreateProgressInput, CreateReportInput, ProgressUpdate, Report } from "./operations.types.js";

export const findProgress = async () => (await (await getSqlPool()).request().query<ProgressUpdate>(`
 SELECT id, project_name AS projectName, phase, percent_complete AS percentComplete, notes,
 CONVERT(varchar(10), reported_on, 23) AS reportedOn FROM dbo.ProgressUpdates ORDER BY reported_on DESC, id DESC`)).recordset;
export const createProgress = async (x:CreateProgressInput) => (await (await getSqlPool()).request()
 .input("projectName",sql.NVarChar(160),x.projectName).input("phase",sql.NVarChar(120),x.phase)
 .input("percent",sql.Int,x.percentComplete).input("notes",sql.NVarChar(400),x.notes).input("date",sql.Date,x.reportedOn)
 .query<ProgressUpdate>(`INSERT dbo.ProgressUpdates(project_name,phase,percent_complete,notes,reported_on)
 OUTPUT INSERTED.id,INSERTED.project_name AS projectName,INSERTED.phase,INSERTED.percent_complete AS percentComplete,INSERTED.notes,CONVERT(varchar(10),INSERTED.reported_on,23) AS reportedOn
 VALUES(@projectName,@phase,@percent,@notes,@date)`)).recordset[0];
export const deleteProgress = async(id:number) => ((await (await getSqlPool()).request().input("id",sql.Int,id).query(`DELETE dbo.ProgressUpdates WHERE id=@id`)).rowsAffected[0]??0)>0;

export const findReports = async () => (await (await getSqlPool()).request().query<Report>(`
 SELECT id,title,report_type AS reportType,period_label AS periodLabel,metric_value AS metricValue,metric_unit AS metricUnit,status FROM dbo.Reports ORDER BY created_at DESC`)).recordset;
export const createReport = async (x:CreateReportInput) => (await (await getSqlPool()).request()
 .input("title",sql.NVarChar(180),x.title).input("type",sql.NVarChar(80),x.reportType).input("period",sql.NVarChar(80),x.periodLabel)
 .input("value",sql.Decimal(18,2),x.metricValue).input("unit",sql.NVarChar(40),x.metricUnit).input("status",sql.NVarChar(40),x.status)
 .query<Report>(`INSERT dbo.Reports(title,report_type,period_label,metric_value,metric_unit,status)
 OUTPUT INSERTED.id,INSERTED.title,INSERTED.report_type AS reportType,INSERTED.period_label AS periodLabel,INSERTED.metric_value AS metricValue,INSERTED.metric_unit AS metricUnit,INSERTED.status
 VALUES(@title,@type,@period,@value,@unit,@status)`)).recordset[0];
export const deleteReport = async(id:number) => ((await (await getSqlPool()).request().input("id",sql.Int,id).query(`DELETE dbo.Reports WHERE id=@id`)).rowsAffected[0]??0)>0;
