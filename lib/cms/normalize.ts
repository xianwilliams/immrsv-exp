import type { ProjectImage } from "../project-galleries";
import type { ClientLogo, CmsProject, SectionId, SiteContent } from "./types";

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : {};
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";
const strings = (value: unknown) => list(value).map(text).filter(Boolean);
const number = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));
const sections = new Set<SectionId>([
  "about",
  "services",
  "clients",
  "work",
  "contact",
]);
const publishedDocument = (value: RecordValue): boolean => {
  const id = text(value._id);
  return (
    Boolean(id) && !id.startsWith("drafts.") && !id.startsWith("versions.")
  );
};
const slug = (value: unknown): string => {
  const candidate = text(record(record(value).slug).current);
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate) ? candidate : "";
};
function link(value: unknown) {
  try {
    const url = new URL(text(value));
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

/** Apply the editor's crop and hotspot to every use of an uploaded photograph. */
export function normalizeImage(value: unknown): ProjectImage | undefined {
  const image = record(value);
  const asset = record(image.asset);
  const urlString = link(asset.url);
  if (!urlString) return;
  const url = new URL(urlString);
  if (url.protocol !== "https:" || url.hostname !== "cdn.sanity.io") return;
  const dimensions = record(record(asset.metadata).dimensions);
  const width = Math.max(1, Math.round(number(dimensions.width, 1200)));
  const height = Math.max(1, Math.round(number(dimensions.height, 800)));
  // Sanity does not transform SVGs or other unsupported formats. Their dimensions
  // must remain unchanged as well, rather than pretending a crop was applied.
  const canTransform = /\.(?:jpe?g|png|webp|pjpg|tiff?|avif|gif)$/i.test(
    url.pathname,
  );
  const crop = canTransform ? record(image.crop) : {};
  const cropAxis = (size: number, start: unknown, end: unknown) => {
    const offset = clamp(
      Math.round(size * clamp(number(start, 0), 0, 1)),
      0,
      size - 1,
    );
    const edge = clamp(
      Math.round(size * (1 - clamp(number(end, 0), 0, 1))),
      offset + 1,
      size,
    );
    return { offset, size: edge - offset };
  };
  const horizontal = cropAxis(width, crop.left, crop.right);
  const vertical = cropAxis(height, crop.top, crop.bottom);
  const outputWidth = horizontal.size;
  const outputHeight = vertical.size;
  if (canTransform) {
    if (
      horizontal.offset ||
      vertical.offset ||
      outputWidth < width ||
      outputHeight < height
    ) {
      url.searchParams.set(
        "rect",
        `${horizontal.offset},${vertical.offset},${outputWidth},${outputHeight}`,
      );
    }
    url.searchParams.set("w", String(Math.min(2400, outputWidth)));
    url.searchParams.set("fit", "max");
    url.searchParams.set("auto", "format");
  }
  const hotspot = record(image.hotspot);
  const hasHotspot =
    typeof hotspot.x === "number" &&
    Number.isFinite(hotspot.x) &&
    typeof hotspot.y === "number" &&
    Number.isFinite(hotspot.y);
  const x =
    clamp(
      (number(hotspot.x, 0.5) * width - horizontal.offset) / outputWidth,
      0,
      1,
    ) * 100;
  const y =
    clamp(
      (number(hotspot.y, 0.5) * height - vertical.offset) / outputHeight,
      0,
      1,
    ) * 100;
  const legacyPosition = text(image.position).match(
    /^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/,
  );
  // Seeded photos retain their existing framing until Nick sets a native hotspot.
  // Once he does, the editor's selection must take precedence over migration data.
  const position =
    !hasHotspot && legacyPosition
      ? `${clamp(Number(legacyPosition[1]), 0, 100)}% ${clamp(Number(legacyPosition[2]), 0, 100)}%`
      : `${x}% ${y}%`;
  return {
    src: url.href,
    alt: text(image.alt),
    caption: text(image.caption),
    width: outputWidth,
    height: outputHeight,
    position,
    ...(typeof image.previewScale === "number" &&
    Number.isFinite(image.previewScale)
      ? { previewScale: clamp(image.previewScale, 1, 2) }
      : {}),
  };
}
const images = (value: unknown) =>
  list(value).flatMap((image) => {
    const normalized = normalizeImage(image);
    return normalized ? [normalized] : [];
  });

/** No static fallback here: deleting or hiding CMS content must remain intentional. */
export function normalizeContent(value: unknown): SiteContent {
  const raw = record(value);
  const home = record(raw.home);
  const settings = record(raw.settings);
  if (home._id !== "homepage" || settings._id !== "siteSettings") {
    throw new Error(
      "Publish the Homepage and Site settings documents in Sanity first.",
    );
  }
  const projects: CmsProject[] = list(raw.projects).flatMap((value) => {
    const project = record(value);
    const id = slug(project);
    if (project.enabled === false || !id || !publishedDocument(project))
      return [];
    const gallery = images(project.gallery);
    const cover = normalizeImage(project.coverImage) || gallery[0];
    if (!cover || gallery.length === 0 || !text(project.title)) return [];
    const popup = images(project.popupGallery);
    return [
      {
        id,
        title: text(project.title),
        client: text(project.client),
        category: text(project.category),
        description: text(project.description),
        image: cover.src,
        cover,
        gallery,
        popupGallery: popup.length ? popup : gallery.slice(0, 6),
        roles: strings(project.roles),
        body: strings(project.body),
        credit: text(project.credit),
        link: link(project.link),
        seoTitle: text(project.seoTitle),
        seoDescription: text(project.seoDescription),
      },
    ];
  });
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const projectIds = (value: unknown) => [
    ...new Set(
      list(value)
        .map(slug)
        .filter((id) => projectById.has(id)),
    ),
  ];
  const about = record(home.about);
  const service = record(home.services);
  const clients = record(home.clients);
  const work = record(home.work);
  const contact = record(home.contact);
  const banner = record(settings.banner);
  const seen = new Set<string>();
  const orderedSections = list(home.sections).flatMap((value) => {
    const entry = record(value);
    const section = text(entry.section) as SectionId;
    if (!sections.has(section) || seen.has(section)) return [];
    seen.add(section);
    return [{ section, enabled: entry.enabled !== false }];
  });
  const logos: ClientLogo[] = list(clients.logos).flatMap((value) => {
    const logo = record(value);
    if (logo.enabled === false || !publishedDocument(logo)) return [];
    const image = normalizeImage(logo.logo);
    if (!image || !text(logo.name)) return [];
    const project = projectById.get(slug(logo.project));
    return [
      {
        id: text(logo._id),
        name: text(logo.name),
        logo: image.src,
        monochromeLogo: normalizeImage(logo.monochromeLogo)?.src,
        projectId: project?.id,
        previewTitle:
          text(logo.previewTitle) || project?.title || text(logo.name),
        previewImage: normalizeImage(logo.previewImage) || project?.cover,
      },
    ];
  });
  return {
    source: "sanity",
    projects,
    settings: {
      contactEmail: text(settings.contactEmail),
      instagramUrl: link(settings.instagramUrl),
      linkedinUrl: link(settings.linkedinUrl),
      footerDescription: text(settings.footerDescription),
      footerLocation: text(settings.footerLocation),
      seoTitle: text(settings.seoTitle),
      seoDescription: text(settings.seoDescription),
      contactButton: text(settings.contactButton),
      navigation: list(settings.navigation).flatMap((value) => {
        const item = record(value);
        const section = text(item.section) as SectionId;
        return sections.has(section) && text(item.label)
          ? [{ label: text(item.label), section }]
          : [];
      }),
      banner: {
        eyebrow: text(banner.eyebrow),
        title: text(banner.title),
        emphasis: text(banner.emphasis),
        description: text(banner.description),
      },
    },
    home: {
      sections: orderedSections,
      heroProjects: projectIds(home.heroProjects),
      about: {
        title: text(about.title),
        emphasis: text(about.emphasis),
        paragraphs: strings(about.paragraphs),
        photos: images(about.photos),
        caption: text(about.caption),
      },
      services: {
        eyebrow: text(service.eyebrow),
        title: text(service.title),
        emphasis: text(service.emphasis),
        items: list(service.items).map((value) => {
          const item = record(value);
          return {
            title: text(item.title),
            text: text(item.text),
            icon: Math.round(clamp(number(item.icon, 0), 0, 5)),
          };
        }),
      },
      clients: {
        title: text(clients.title),
        emphasis: text(clients.emphasis),
        logos,
      },
      work: {
        title: text(work.title),
        emphasis: text(work.emphasis),
        eyebrow: text(work.eyebrow),
        featuredProjects: projectIds(work.featuredProjects),
      },
      contact: {
        eyebrow: text(contact.eyebrow),
        title: text(contact.title),
        description: text(contact.description),
        successTitle: text(contact.successTitle),
        successMessage: text(contact.successMessage),
      },
    },
  };
}
