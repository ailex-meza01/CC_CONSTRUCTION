export type Material = {
  id: number;
  name: string;
  movementType: string;
  quantity: string;
  destination: string;
  imageUrl?: string;
};

export type MaterialImageInput = {
  fileName: string;
  mimeType: string;
  data: string;
};

export type CreateMaterialInput = Omit<Material, "id" | "imageUrl"> & {
  image?: MaterialImageInput | null;
};
