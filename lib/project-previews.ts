import { projectGalleries } from "./project-galleries";

export const projectPreviews = Object.fromEntries(
  Object.entries(projectGalleries).map(([id, images]) => [
    id,
    images.slice(0, 6),
  ]),
);

// One approved project per image, shared by the existing case-study banners.
export const projectBannerImages = [
  "starry",
  "crumbl",
  "pandora-las-vegas",
  "brandless-summit",
  "comfort-cases",
  "maison-margiela",
].map((id) => ({
  project: id,
  image: projectGalleries[id][0],
  position: projectGalleries[id][0].position,
}));
