import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/cms/server";
export const revalidate = 30;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.SITE_INDEXABLE !== "true") return [];
  const base = process.env.SITE_URL || "https://www.immrsv-exp.com";
  const content = await getSiteContent();
  return [
    { url: base },
    ...content.projects.map((p) => ({ url: base + "/work/" + p.id })),
  ];
}
