import approvedImages from "./approved-images.json";

export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  position?: string;
  previewScale?: number;
};

export const projectGalleries: Record<string, ProjectImage[]> = approvedImages;
export const projectCoverPositions: Record<string, string> = Object.fromEntries(
  Object.entries(projectGalleries).map(([id, images]) => [
    id,
    images[0].position || "50% 50%",
  ]),
);
