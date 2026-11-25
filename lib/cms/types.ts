import type { Project } from "../content";
import type { ProjectImage } from "../project-galleries";

export type SectionId = "about" | "services" | "clients" | "work" | "contact";
export type CmsProject = Project & {
  cover: ProjectImage;
  gallery: ProjectImage[];
  popupGallery: ProjectImage[];
  body: string[];
  seoTitle?: string;
  seoDescription?: string;
};
export type ClientLogo = {
  id: string;
  name: string;
  logo: string;
  monochromeLogo?: string;
  projectId?: string;
  previewTitle: string;
  previewImage?: ProjectImage;
};
export type FeaturedSlide = { project: CmsProject; image: ProjectImage };
export type SiteSettings = {
  contactEmail: string;
  instagramUrl: string;
  linkedinUrl: string;
  footerDescription: string;
  footerLocation: string;
  seoTitle: string;
  seoDescription: string;
  contactButton: string;
  navigation: { label: string; section: SectionId }[];
  banner: {
    eyebrow: string;
    title: string;
    emphasis: string;
    description: string;
  };
};
export type Homepage = {
  sections: { section: SectionId; enabled: boolean }[];
  heroProjects: string[];
  about: {
    title: string;
    emphasis: string;
    paragraphs: string[];
    photos: ProjectImage[];
    caption: string;
  };
  services: {
    eyebrow: string;
    title: string;
    emphasis: string;
    items: { title: string; text: string; icon: number }[];
  };
  clients: { title: string; emphasis: string; logos: ClientLogo[] };
  work: {
    title: string;
    emphasis: string;
    eyebrow: string;
    featuredProjects: string[];
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    successTitle: string;
    successMessage: string;
  };
};
export type SiteContent = {
  settings: SiteSettings;
  home: Homepage;
  projects: CmsProject[];
  source: "local" | "sanity";
};

export function featuredSlides(content: SiteContent): FeaturedSlide[] {
  return content.home.heroProjects.flatMap((id) => {
    const project = content.projects.find((entry) => entry.id === id);
    return project ? [{ project, image: project.cover }] : [];
  });
}
