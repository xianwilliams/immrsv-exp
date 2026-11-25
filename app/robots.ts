import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const live = process.env.SITE_INDEXABLE === "true";
  return {
    rules: live
      ? { userAgent: "*", allow: "/", disallow: ["/api/", "/studio"] }
      : { userAgent: "*", disallow: "/" },
    ...(live
      ? {
          sitemap:
            (process.env.SITE_URL || "https://www.immrsv-exp.com") +
            "/sitemap.xml",
        }
      : {}),
  };
}
