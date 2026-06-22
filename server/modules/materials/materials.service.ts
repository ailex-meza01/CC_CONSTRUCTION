import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createMaterial, deleteMaterialById, findMaterials } from "./materials.repository.js";
import type { CreateMaterialInput, MaterialImageInput } from "./materials.types.js";

export const listMaterials = async () => {
  const materials = await findMaterials();

  return Promise.all(
    materials.map(async (material) => {
      const directory = path.join(process.cwd(), "assets", "img", String(material.id));

      try {
        const files = await readdir(directory);
        const image = files.find((file) => /\.(gif|jpe?g|png|webp)$/i.test(file));
        return image ? { ...material, imageUrl: `/assets/img/${material.id}/${image}` } : material;
      } catch {
        return material;
      }
    }),
  );
};

const extensionByMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9.-]/g, "_");

const saveMaterialImage = async (materialId: number, image: MaterialImageInput) => {
  const extension = extensionByMime[image.mimeType] ?? "jpg";
  const baseName = sanitizeName(path.parse(image.fileName).name || "material");
  const fileName = `${baseName}-${Date.now()}.${extension}`;
  const directory = path.join(process.cwd(), "assets", "img", String(materialId));
  const filePath = path.join(directory, fileName);

  await mkdir(directory, { recursive: true });
  await writeFile(filePath, Buffer.from(image.data, "base64"));

  return `/assets/img/${materialId}/${fileName}`;
};

export const addMaterial = async (input: CreateMaterialInput) => {
  const material = await createMaterial({
    name: input.name,
    movementType: input.movementType,
    quantity: input.quantity,
    destination: input.destination,
  });

  if (!input.image) return material;

  const imageUrl = await saveMaterialImage(material.id, input.image);
  return { ...material, imageUrl };
};

export const removeMaterial = async (id: number) => {
  const deleted = await deleteMaterialById(id);
  if (!deleted) return false;

  const directory = path.join(process.cwd(), "assets", "img", String(id));
  await rm(directory, { recursive: true, force: true });

  return true;
};
