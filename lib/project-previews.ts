import { projectGalleries, type ProjectImage } from "./project-galleries";

// A focused edit for the opening accordion. The full case studies retain every
// photograph, including production details and behind-the-scenes footage.
const selections: Record<string, [number, string?][]> = {
  wcdonalds: [[1], [6, "50% 35%"], [2], [3], [0, "50% 42%"], [7]],
  starry: [[3], [0], [1], [2], [4]],
  crumbl: [[0], [1], [4], [6], [3, "50% 38%"], [2, "50% 40%"]],
  sundance: [
    [0, "50% 35%"],
    [1, "50% 64%"],
    [2, "50% 53%"],
    [8, "50% 40%"],
    [6, "50% 37%"],
  ],
  "nascar-billboard": [[0], [2], [1], [3]],
  stones: [[0], [7], [2], [8], [9], [4]],
  tictac: [[0], [1], [6], [4, "50% 38%"], [3, "50% 34%"]],
  fourloko: [[0], [1], [2], [3]],
  keebler: [[0, "50% 28%"], [5, "50% 35%"], [2], [3], [7], [1]],
};

export const projectPreviews: Record<string, ProjectImage[]> =
  Object.fromEntries(
    Object.entries(selections).map(([project, photos]) => [
      project,
      photos.map(([index, position]) => ({
        ...projectGalleries[project][index],
        position: position ?? "50% 50%",
        previewScale: project === "fourloko" ? 1.2 : undefined,
      })),
    ]),
  );

// One distinct project per full-width frame, with each brand kept in view.
export const projectBannerImages = [
  {
    project: "wcdonalds",
    image: projectGalleries.wcdonalds[1],
    position: "50% 45%",
  },
  { project: "crumbl", image: projectGalleries.crumbl[0], position: "43% 50%" },
  {
    project: "nascar-billboard",
    image: projectGalleries["nascar-billboard"][0],
    position: "50% 55%",
  },
  {
    project: "keebler",
    image: projectGalleries.keebler[0],
    position: "50% 35%",
  },
  { project: "starry", image: projectGalleries.starry[0], position: "50% 55%" },
  { project: "stones", image: projectGalleries.stones[0], position: "50% 60%" },
  { project: "tictac", image: projectGalleries.tictac[0], position: "50% 55%" },
];
