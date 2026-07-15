import { Router } from "express";
import { getProgress, getReports, postProgress, postReport, removeProgress, removeReport } from "./operations.controller.js";
export const progressRouter=Router(); progressRouter.get("/",getProgress); progressRouter.post("/",postProgress); progressRouter.delete("/:id",removeProgress);
export const reportsRouter=Router(); reportsRouter.get("/",getReports); reportsRouter.post("/",postReport); reportsRouter.delete("/:id",removeReport);
