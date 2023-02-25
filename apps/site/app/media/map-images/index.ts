import { mapImages } from "./map-images";

export const getMapImage = async (id: string): Promise<string> => {
  const image = await mapImages[id]?.()?.then((image) => image.default);

  if (!image) {
    throw new Error(`Map image with id ${id} not found`);
  }

  return image;
};

export const getMapImageResolver = (baseUrl: string) => (id: string) =>
  getMapImage(id)?.then((image) => new URL(image, baseUrl).toString());
