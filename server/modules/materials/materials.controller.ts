import type { RequestHandler } from "express";
import { addMaterial, listMaterials, removeMaterial } from "./materials.service.js";

export const getMaterials: RequestHandler = async (_request, response, next) => {
  try {
    response.json(await listMaterials());
  } catch (error) {
    next(error);
  }
};

export const postMaterial: RequestHandler = async (request, response, next) => {
  try {
    const { name, movementType, quantity, destination, image } = request.body as Record<string, unknown>;

    if (!name || !movementType || !quantity || !destination) {
      response.status(400).json({ message: "Name, movement type, quantity and destination are required." });
      return;
    }

    const material = await addMaterial({
      name: String(name),
      movementType: String(movementType),
      quantity: String(quantity),
      destination: String(destination),
      image: image && typeof image === "object"
        ? image as { fileName: string; mimeType: string; data: string }
        : null,
    });

    response.status(201).json(material);
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial: RequestHandler = async (request, response, next) => {
  try {
    const deleted = await removeMaterial(Number(request.params.id));

    if (!deleted) {
      response.status(404).json({ message: "Material not found." });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
