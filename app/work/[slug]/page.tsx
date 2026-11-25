import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/cms/server";
import { featuredSlides } from "@/lib/cms/types";
import { CaseStudy } from "@/components/case-study";

export const dynamicParams = true;
export const revalidate = 30;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = content.projects.find((item) => item.id === slug);
  if (!project) return {};
  return {
    title: project.seoTitle || `${project.client} — ${project.title} | IMMRSV`,
    description: project.seoDescription || project.description,
    openGraph: {
      title: `${project.client} | IMMRSV`,
      description: project.seoDescription || project.description,
      images: [project.image!],
    },
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getSiteContent();
  const index = content.projects.findIndex((project) => project.id === slug);
  if (index < 0) notFound();
  return (
    <CaseStudy
      project={content.projects[index]}
      images={content.projects[index].gallery}
      next={
        content.projects.length > 1
          ? content.projects[(index + 1) % content.projects.length]
          : null
      }
      settings={content.settings}
      bannerSlides={featuredSlides(content)}
      contactAvailable={content.home.sections.some(
        (section) => section.section === "contact" && section.enabled,
      )}
      workAvailable={content.home.sections.some(
        (section) => section.section === "work" && section.enabled,
      )}
    />
  );
}
