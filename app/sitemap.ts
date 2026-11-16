import type { MetadataRoute } from "next";
import { allProjects } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SITE_INDEXABLE !== "true") return [];
  const base = process.env.SITE_URL || "https://www.immrsv-exp.com";
  return [
    { url: base },
    ...allProjects.map((p) => ({ url: base + "/work/" + p.id })),
  ];
}
