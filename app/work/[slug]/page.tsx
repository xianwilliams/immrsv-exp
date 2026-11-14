import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allProjects } from "@/lib/content";
import { projectGalleries } from "@/lib/project-galleries";
import { projectStories } from "@/lib/project-stories";
import { CaseStudy } from "@/components/case-study";

export const dynamicParams = false;
export function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = allProjects.find((item) => item.id === slug);
  if (!project) return {};
  return {
    title: `${project.client} — ${project.title} | IMMRSV`,
    description: project.description,
    openGraph: {
      title: `${project.client} | IMMRSV`,
      description: project.description,
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
  const index = allProjects.findIndex((project) => project.id === slug);
  if (index < 0) notFound();
  return (
    <CaseStudy
      project={allProjects[index]}
      story={projectStories[slug]}
      images={projectGalleries[slug]}
      next={allProjects[(index + 1) % allProjects.length]}
    />
  );
}
