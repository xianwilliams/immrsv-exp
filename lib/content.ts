import { projectCovers } from "./project-galleries";

export type Project = {
  id: string;
  client: string;
  title: string;
  category: string;
  image?: string;
  roles: string[];
  description: string;
  link?: string;
};

export const services = [
  {
    title: "Project management",
    text: "Budgets, timelines, permits, vendors, and the people who make it happen. A steady production lead who keeps your project moving and your team in the loop.",
    image: "/media/conference.webp",
    width: 1920,
    height: 1281,
    when: "You need a production lead who can take ownership and keep the whole team moving.",
    includes: [
      "Budgets + timelines",
      "Vendor coordination",
      "Production leadership",
    ],
    alt: "A Crumbl event environment with custom sets and branded installations",
  },
  {
    title: "Logistics + operations",
    text: "Transportation, shipping, equipment, venue coordination, storage, and the plan behind it all. We handle the moving parts so you can focus on the experience.",
    image: "/media/galleries/recommendations-04.webp",
    width: 2000,
    height: 1333,
    when: "Your idea needs to move: between vendors, venues, cities, or festival stops.",
    includes: ["Transport + shipping", "Venues + equipment", "Tour operations"],
    alt: "Visitors exploring a busy exhibition floor",
  },
  {
    title: "Strategy + concepting",
    text: "Feasibility, preliminary budgets, location recommendations, KPI strategies, and activation ideas. A focused 10–20-hour sprint can turn an early brainstorm into a proposal ready to pitch.",
    image: "/media/galleries/recommendations-02.webp",
    width: 2000,
    height: 1334,
    when: "The idea is taking shape, and you need to know what is possible before you pitch it.",
    includes: [
      "Feasibility + budgets",
      "Locations + activation ideas",
      "10\u201320-hour proposal sprints",
    ],
    alt: "A pink classroom environment framed by custom lockers",
  },
  {
    title: "Specialized staffing",
    text: "Tour managers, experienced producers, install crews, and brand ambassadors. We bring together the people your project needs, exactly when it needs them.",
    image: "/media/galleries/service-people.webp",
    width: 2000,
    height: 1333,
    when: "You have the plan. Now you need the right people on the ground.",
    includes: [
      "Producers + tour managers",
      "Installation crews",
      "Brand ambassadors",
    ],
    alt: "Participants packing essentials at the Comfort Cases community event",
  },
  {
    title: "Design + build",
    text: "Concept drawings, 3D design, production artwork, and custom fabrication. We connect the right creative and build partners to bring your vision into the real world.",
    image: "/media/galleries/stones-display-14.webp",
    width: 900,
    height: 600,
    when: "You need a physical environment that brings the brand and the idea to life.",
    includes: [
      "Concepts + 3D design",
      "Production artwork",
      "Fabrication partners",
    ],
    alt: "A custom NASCAR show car under fabrication",
  },
  {
    title: "And then some",
    text: "That’s our kind of conversation. If your project doesn’t fit a neat category, let’s talk. There’s a good chance we’ve done it, or know just the people who can.",
    image: "/media/outdoor.webp",
    width: 1190,
    height: 1024,
    when: "The brief is unusual, the ask is specific, or you are not sure where to start.",
    includes: [
      "A practical first conversation",
      "Specialist connections",
      "Support built around the brief",
    ],
    alt: "A sculptural outdoor installation in a courtyard",
  },
];

export const projects: Project[] = [
  {
    id: "wcdonalds",
    client: "McDonald’s",
    title: "Welcome to WcDonald’s.",
    category: "Immersive dining",
    image: projectCovers.wcdonalds,
    roles: [
      "Fabrication oversight",
      "Install + dismantle management",
      "Staffing",
    ],
    description:
      "Bringing an immersive dining experience into the real world. Fabrication oversight, installation and dismantle management, and on-site staffing support.",
    link: "https://wearesocial.com/us/case-study/wcdonalds-immersive-dining-experience/",
  },
  {
    id: "starry",
    client: "Starry",
    title: "A whole different court.",
    category: "Brand activation",
    image: projectCovers.starry,
    roles: ["Experiential production"],
    description:
      "A basketball experience that brings the brand into the middle of the action. Selected work from the IMMRSV project archive.",
  },
  {
    id: "crumbl",
    client: "Crumbl",
    title: "Step inside the brand.",
    category: "Brand environments",
    image: projectCovers.crumbl,
    roles: ["Custom environments"],
    description:
      "An immersive headquarters environment, full of larger-than-life moments. Selected work from the IMMRSV project archive.",
  },
  {
    id: "sundance",
    client: "Sundance Film Festival",
    title: "Sundance Film Festival 2024–2026",
    category: "Festival production",
    image: projectCovers.sundance,
    roles: ["Fabrication management", "Event production", "Specialty staffing"],
    description:
      "Production support across the 2024–2026 Sundance Film Festival seasons. Pictured: the 2026 World of Hyatt activation, produced by Guru House.",
    link: "https://lnkd.in/p/gFMXmsqD",
  },
  {
    id: "nascar-billboard",
    client: "NASCAR",
    title: "The world’s loudest billboard.",
    category: "Times Square activation",
    image: projectCovers["nascar-billboard"],
    roles: ["Fabrication management", "Specialty staffing", "Logistics"],
    description:
      "Fabrication management, specialty staffing, and logistics support for NASCAR’s Times Square activation. From the build to the finished installation: a billboard made to be heard as well as seen.",
    link: "https://lnkd.in/p/g_N_8yXf",
  },
  {
    id: "stones",
    client: "NASCAR × The Rolling Stones",
    title: "Where racing meets rock ’n’ roll.",
    category: "Brand collaboration",
    image: projectCovers.stones,
    roles: [
      "Fabrication management",
      "Event production",
      "Logistics",
      "Staffing",
    ],
    description:
      "Bringing together the production teams, logistics, and on-site support for an unexpected brand collaboration. Pictured: the Racing Record Player, fabricated by Display Group.",
    link: "https://lnkd.in/p/gbyaWvQ8",
  },
];

export const recentProjects: Project[] = [
  projects[3],
  projects[0],
  projects[4],
  {
    id: "tictac",
    image: projectCovers.tictac,
    client: "Tic Tac × Dr Pepper",
    title: "The Vibe Refresh Squad.",
    category: "On the road",
    roles: [
      "Remote tour production",
      "Staffing",
      "Routing",
      "Site negotiation",
    ],
    description:
      "Keeping a multi-stop brand experience moving, with remote production, staffing, routing, and site negotiation.",
    link: "https://lnkd.in/p/gMKNy4r4",
  },
  {
    id: "fourloko",
    image: projectCovers.fourloko,
    client: "Four Loko",
    title: "The Party Store.",
    category: "Live Nation festival circuit",
    roles: ["Fabrication management", "Event production", "Logistics"],
    description:
      "Fabrication management, event production, and logistics for the Four Loko Party Store across the Live Nation festival circuit.",
    link: "https://lnkd.in/p/gxfa4Ywb",
  },
  projects[5],
  {
    id: "keebler",
    image: projectCovers.keebler,
    client: "Keebler",
    title: "A little Butterbeer magic.",
    category: "Pop-up experience",
    roles: ["Fabrication management", "Event production", "Site negotiation"],
    description:
      "Fabrication management, event production, and site negotiation for the Keebler Butterbeer pop-up.",
    link: "https://lnkd.in/p/gymb7R7a",
  },
];

export const allProjects = [
  ...projects,
  ...recentProjects.filter(
    (project) => !projects.some((item) => item.id === project.id),
  ),
];

export const reviews = [
  {
    name: "Daniel Gibbons",
    date: "November 7, 2023",
    quote:
      "IMMRSV is a great company! Imaginative, engaging, and reliable. You can count on them to get your ideas created.",
    image: "/media/galleries/recommendations-05.webp",
    position: "50% 72%",
    project: "Outdoor installations",
  },
  {
    name: "Shane Peet",
    date: "November 10, 2023",
    quote:
      "Great customer to work with. Very talented and unique project. We love when we get the opportunity to work for IMMRSV.",
    image: "/media/galleries/stones-display-16.webp",
    position: "50% 48%",
    project: "Behind the build",
  },
  {
    name: "Haley",
    date: "October 19, 2023",
    quote:
      "IMMRSV was EXCEPTIONAL to work with. I would highly recommend and look forward to working with them for future projects.",
    image: "/media/review-event.webp",
    position: "50% 35%",
    project: "Crumbl event experience",
  },
  {
    name: "GR3NGASHO",
    date: "October 17, 2023",
    quote: "Hard working, fast to respond, and responsable! BEST IN TOWN",
    image: "/media/galleries/review-live-experience.webp",
    position: "50% 45%",
    project: "Live brand experiences",
  },
  {
    name: "Ty Shane",
    date: "September 20, 2023",
    quote:
      "IMMRSV team is exceptional. As always, there's a bit of hesitancy when working with someone new for marketing. However, their professionalism and communication transcend any previous experiences of ours. Thanks Nick & team, y'all were exceptional.",
    image: "/media/review-crumbl.webp",
    position: "50% 35%",
    project: "Crumbl conference",
  },
];
