import { cache } from "react";
import { defaultContent } from "./defaults";
import { normalizeContent } from "./normalize";
import type { SiteContent } from "./types";

const image = `{...,asset->{_id,url,metadata{dimensions}}}`;
const query = `{
  "settings": *[_id == "siteSettings"][0],
  "home": *[_id == "homepage"][0]{...,
    heroProjects[]->{slug},
    about{...,photos[]${image}},
    clients{...,logos[]->{...,logo${image},monochromeLogo${image},previewImage${image},project->{slug}}},
    work{...,featuredProjects[]->{slug}}
  },
  "projects": *[_type == "project" && enabled != false && defined(slug.current)] | order(_createdAt asc)[0...500]{...,
    coverImage${image},popupGallery[]${image},gallery[]${image}
  }
}`;

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const project = process.env.SANITY_PROJECT_ID?.trim();
  const dataset = process.env.SANITY_DATASET?.trim();
  if (!project && !dataset) return defaultContent;
  if (
    !project ||
    !dataset ||
    !/^[a-z0-9]+$/.test(project) ||
    !/^[a-z0-9_-]+$/.test(dataset)
  ) {
    throw new Error(
      "Set both SANITY_PROJECT_ID and SANITY_DATASET to valid values.",
    );
  }
  const url = new URL(
    `https://${project}.api.sanity.io/v2026-11-24/data/query/${dataset}`,
  );
  url.searchParams.set("query", query);
  url.searchParams.set("perspective", "published");
  // Free-plan public read: no account credentials or write tokens reach the website.
  // Next caches this shared query for 30 seconds. Read the origin API so a second
  // CDN cache cannot refill Next's cache with older content after publishing.
  const response = await fetch(url, {
    next: { revalidate: 30 },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error(
      `Published website content is unavailable (${response.status}).`,
    );
  const result = await response.json();
  return normalizeContent(result.result);
});
