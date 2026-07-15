import type { RequestHandler } from "express";
import { createProgress, createReport, deleteProgress, deleteReport, findProgress, findReports } from "./operations.repository.js";
export const getProgress:RequestHandler=async(_q,r,n)=>{try{r.json(await findProgress())}catch(e){n(e)}};
export const postProgress:RequestHandler=async(q,r,n)=>{try{const x=q.body;if(!x.projectName||!x.phase||!x.notes||!x.reportedOn){r.status(400).json({message:"All progress fields are required."});return}r.status(201).json(await createProgress({...x,percentComplete:Number(x.percentComplete)}))}catch(e){n(e)}};
export const removeProgress:RequestHandler=async(q,r,n)=>{try{(await deleteProgress(Number(q.params.id)))?r.status(204).send():r.status(404).json({message:"Not found"})}catch(e){n(e)}};
export const getReports:RequestHandler=async(_q,r,n)=>{try{r.json(await findReports())}catch(e){n(e)}};
export const postReport:RequestHandler=async(q,r,n)=>{try{const x=q.body;if(!x.title||!x.reportType||!x.periodLabel||!x.metricUnit||!x.status){r.status(400).json({message:"All report fields are required."});return}r.status(201).json(await createReport({...x,metricValue:Number(x.metricValue)}))}catch(e){n(e)}};
export const removeReport:RequestHandler=async(q,r,n)=>{try{(await deleteReport(Number(q.params.id)))?r.status(204).send():r.status(404).json({message:"Not found"})}catch(e){n(e)}};
