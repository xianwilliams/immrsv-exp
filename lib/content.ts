import { projectGalleries } from "./project-galleries";

export type Project = {
  id: string;
  client: string;
  title: string;
  category: string;
  image: string;
  roles: string[];
  description: string;
  credit?: string;
  link?: string;
};

// Complete owner-approved portfolio, November 19, 2026.
// Guru House employment projects are excluded, including from generated routes.
const approved: Omit<Project, "image">[] = [
  {
    id: "starry",
    client: "Starry",
    title: "NBA All-Star Branding & Operations",
    category: "Brand activation",
    roles: ["Branding", "Operations"],
    description:
      "A branded basketball experience at NBA All-Star, with a live court, spectator areas, and fans at the center of the action.",
  },
  {
    id: "crumbl",
    client: "Crumbl",
    title: "HQ Build Out & Branding",
    category: "Brand environment",
    roles: ["Build-out", "Branding"],
    description:
      "Crumbl’s familiar world, brought into its headquarters through oversized baking sculptures, dimensional displays, and branded spaces.",
  },
  {
    id: "pandora-las-vegas",
    client: "Pandora",
    title: "Las Vegas Launch",
    category: "Retail launch",
    roles: [],
    credit:
      "Agency: CNC (Coffee ’n Clothes). Photography from CNC’s project recap.",
    description:
      "The Lucky in Love experience for Pandora’s Las Vegas flagship opening, featuring a custom Jewel-ette wheel, playful displays, and a ribbon cutting.",
    link: "https://www.linkedin.com/posts/to-mark-the-grand-opening-of-pandoras-new-ugcPost-7337867945252937729-JCZe/",
  },
  {
    id: "foam-sculptures",
    client: "Foam Sculptures",
    title: "Foam Sculptures",
    category: "Custom fabrication",
    roles: ["Foam sculptures"],
    description:
      "A selection of sculptural work, from oversized props and playful characters to custom pieces for physical brand experiences.",
  },
  {
    id: "brandless-summit",
    client: "Brandless",
    title: "Consumer Summit",
    category: "Event environment",
    roles: [],
    description:
      "A collection of product displays and branded environments for the Brandless Consumer Summit.",
  },
  {
    id: "crumbl-conference",
    client: "Crumbl",
    title: "Manager’s Conference",
    category: "Conference experience",
    roles: [],
    description:
      "A Class of 2023 environment with personalized lockers, classroom sets, and larger-than-life cookie displays for Crumbl’s managers.",
  },
  {
    id: "crumbl-edmonton",
    client: "Crumbl",
    title: "Edmonton Launch",
    category: "Brand launch",
    roles: [],
    description:
      "Oversized cookie installations brought Crumbl into Edmonton’s streets and gathering places for its Canadian launch.",
  },
  {
    id: "comfort-cases",
    client: "Comfort Cases × Lisa Barlow",
    title: "Comfort Cases × Lisa Barlow",
    category: "Community event",
    roles: [],
    description:
      "A Salt Lake City event bringing Lisa Barlow, Comfort Cases, and guests together to pack backpacks with essentials.",
  },
  {
    id: "dreamy-draw",
    client: "Dreamy Draw",
    title: "Outdoor Installation",
    category: "Outdoor installation",
    roles: ["Installation"],
    description:
      "Selected views from the outdoor installation and the team behind it.",
  },
  {
    id: "maison-margiela",
    client: "Maison Margiela",
    title: "REPLICA Summer Experience",
    category: "Brand activation",
    roles: [],
    credit:
      "Agency: CNC (Coffee ’n Clothes). Photography from CNC’s project recap.",
    description:
      "A summer REPLICA fragrance experience combining citrus-inspired displays, popsicles, and branded keepsakes.",
    link: "https://www.instagram.com/p/DOOd0wnkkil/",
  },
];
export const allProjects: Project[] = approved.map((project) => ({
  ...project,
  image: projectGalleries[project.id][0].src,
}));
export const projects = allProjects;

export const services = [
  {
    title: "Project management",
    text: "Budgets, permits, vendors, and production schedules—with a dedicated lead keeping everything connected.",
  },
  {
    title: "Strategy + concepting",
    text: "Feasibility, early budgets, locations, and activation ideas. Support can start with a focused 10–20-hour proposal sprint.",
  },
  {
    title: "Design + build",
    text: "Concept drawings, 3D renderings, production artwork, and custom fabrication through specialist partners.",
  },
  {
    title: "Logistics + operations",
    text: "Transportation, equipment, venue coordination, storage, and the practical details of getting a project on site.",
  },
  {
    title: "Specialized staffing",
    text: "Producers, tour managers, installation crews, and brand ambassadors assembled around the project.",
  },
  {
    title: "And then some",
    text: "An unusual brief or a specific gap in your team? We can help find the right people and a practical way forward.",
  },
];
