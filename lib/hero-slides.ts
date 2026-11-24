import { allProjects } from "./content";
import { projectGalleries } from "./project-galleries";

// The hero and contact panel share the same approved images and sequence.
export const heroSlides = [
  "starry",
  "crumbl",
  "pandora-las-vegas",
  "brandless-summit",
  "crumbl-edmonton",
  "comfort-cases",
  "dreamy-draw",
  "crumbl-conference",
].map((id) => ({
  project: allProjects.find((project) => project.id === id)!,
  image: projectGalleries[id][0],
}));
