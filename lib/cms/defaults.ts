import { allProjects, services } from "../content";
import { projectGalleries } from "../project-galleries";
import { heroSlides } from "../hero-slides";
import type { ClientLogo, CmsProject, SiteContent } from "./types";

const projects: CmsProject[] = allProjects.map((project) => ({
  ...project,
  cover: projectGalleries[project.id][0],
  gallery: projectGalleries[project.id],
  popupGallery: projectGalleries[project.id].slice(0, 6),
  body: [],
}));

const logos: ClientLogo[] = [
  [
    "starry",
    "Starry",
    "starry.svg",
    "Starry NBA All-Star Branding & Operations",
  ],
  ["crumbl", "Crumbl", "crumbl.svg", "Crumbl HQ Build Out & Branding"],
  ["pandora-las-vegas", "Pandora", "pandora.svg", "Pandora Las Vegas Launch"],
  [
    "brandless-summit",
    "Brandless",
    "brandless.png",
    "Brandless Consumer Summit",
  ],
  [
    "maison-margiela",
    "Maison Margiela",
    "maison-margiela.svg",
    "Maison Margiela REPLICA Summer Experience",
  ],
  [
    "comfort-cases",
    "Comfort Cases",
    "comfort-cases.png",
    "Comfort Cases × Lisa Barlow",
  ],
].map(([projectId, name, file, previewTitle]) => ({
  id: projectId,
  name,
  logo: `/media/brands/${file}`,
  ...(projectId === "comfort-cases"
    ? { monochromeLogo: "/media/brands/comfort-cases-white.png" }
    : {}),
  projectId,
  previewTitle,
  previewImage: projectGalleries[projectId][0],
}));

// The existing approved site is both the local fallback and initial CMS content.
export const defaultContent: SiteContent = {
  source: "local",
  projects,
  settings: {
    contactEmail: "nick@immrsv-exp.com",
    instagramUrl: "https://www.instagram.com/immrsv_exp",
    linkedinUrl: "https://www.linkedin.com/company/immrsv/",
    footerDescription:
      "IMMRSV is an independent experiential production partner based in Salt Lake City and working around the world.\nLet’s bring the right support to your next experience.",
    footerLocation: "SALT LAKE CITY, UT & BEYOND",
    seoTitle: "IMMRSV | Experiences, brought to life.",
    seoDescription:
      "Independent experiential production for agencies, internal brand teams, and creative partners. From a short planning sprint to a full production team.",
    contactButton: "WORK WITH US",
    navigation: [
      { label: "ABOUT", section: "about" },
      { label: "SERVICES", section: "services" },
      { label: "CLIENTS", section: "clients" },
      { label: "WORK", section: "work" },
    ],
    banner: {
      eyebrow: "YOUR TEAM, EXTENDED.",
      title: "YOUR NEXT IDEA.",
      emphasis: "OUT IN THE WORLD.",
      description:
        "A few days of support or the whole production.\nBring us in wherever your team needs us.",
    },
  },
  home: {
    sections: [
      { section: "about", enabled: true },
      { section: "services", enabled: true },
      { section: "clients", enabled: true },
      { section: "work", enabled: true },
      { section: "contact", enabled: true },
    ],
    heroProjects: heroSlides.map(({ project }) => project.id),
    about: {
      title: "YOUR PROJECT.",
      emphasis: "THE RIGHT SUPPORT.",
      paragraphs: [
        "IMMRSV is an independent experiential production partner based in Salt Lake City and working around the world. One production lead, a short planning sprint, or a full team—we fit around your project.",
        "Led by Nick Wirsching, we work alongside agencies, brand teams, and creative partners, bringing the people and resources needed for one part of a project or the whole production.",
      ],
      photos: [
        {
          src: "/media/people/installation.jpg",
          alt: "The team at an outdoor mirrored installation",
          caption: "The team at an outdoor mirrored installation",
          width: 1094,
          height: 1375,
        },
        {
          src: "/media/people/prop-build.png",
          alt: "Oversized sculptural props taking shape in the workshop",
          caption: "Oversized sculptural props taking shape in the workshop",
          width: 1218,
          height: 1180,
        },
        {
          src: "/media/people/workshop.png",
          alt: "The team beside a colorful octopus sculpture during fabrication",
          caption:
            "The team beside a colorful octopus sculpture during fabrication",
          width: 1206,
          height: 1108,
        },
      ],
      caption: "BIG IDEAS. REAL-WORLD EXPERIENCES.",
    },
    services: {
      eyebrow: "HOW WE CAN HELP",
      title: "BUILT AROUND\nWHAT YOUR",
      emphasis: "PROJECT NEEDS.",
      items: services.map((service, index) => ({
        ...service,
        icon: [0, 2, 4, 1, 3, 5][index],
      })),
    },
    clients: {
      title: "WHO WE’VE",
      emphasis: "WORKED WITH.",
      logos,
    },
    work: {
      title: "CASE",
      emphasis: "STUDIES",
      eyebrow: "SELECTED EXPERIENCES",
      featuredProjects: projects.map(({ id }) => id),
    },
    contact: {
      eyebrow: "WORK WITH US",
      title: "What are you\nthinking?",
      description: "A first idea. A full brief. An extra set of hands.",
      successTitle: "Thanks for reaching out.",
      successMessage: "Your message has been sent. We’ll be in touch.",
    },
  },
};
