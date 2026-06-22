import { Router } from "express";
import { deleteMaterial, getMaterials, postMaterial } from "./materials.controller.js";

export const materialsRouter = Router();

materialsRouter.get("/", getMaterials);
materialsRouter.post("/", postMaterial);
materialsRouter.delete("/:id", deleteMaterial);
