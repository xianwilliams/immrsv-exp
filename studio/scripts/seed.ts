import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCliClient } from "sanity/cli";
import { defaultContent } from "../../lib/cms/defaults";
import type { ProjectImage } from "../../lib/project-galleries";

// Run from studio with an authenticated CLI session. This never replaces a document.
// SANITY_SEED_PROJECT_ID=<intended-project> npx sanity exec scripts/seed.ts --with-user-token
const client = getCliClient({ apiVersion: "2026-11-01" }).withConfig({
  useCdn: false,
  perspective: "raw",
});
const { projectId, dataset, token } = client.config();
const expectedProject = process.env.SANITY_SEED_PROJECT_ID;
if (
  !expectedProject ||
  expectedProject !== projectId ||
  dataset !== "production"
) {
  throw new Error(
    "Seed stopped: set SANITY_SEED_PROJECT_ID to the intended project and select its production dataset. The value must match the CLI project.",
  );
}
if (!token)
  throw new Error("Run with --with-user-token after signing in to Sanity CLI.");

const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));
const content = defaultContent;
const projectIdFor = (slug: string) => `project-${slug}`;
const logoIdFor = (id: string) => `clientLogo-${id}`;
const reference = (id: string, key: string) => ({
  _type: "reference",
  _ref: id,
  _key: key,
});
const ids = [
  ...content.projects.map((project) => projectIdFor(project.id)),
  ...content.home.clients.logos.map((logo) => logoIdFor(logo.id)),
  "siteSettings",
  "homepage",
];
const existing = await client.fetch<{ _id: string }[]>(
  "*[_id in $ids][0...100]{_id}",
  { ids: [...ids, ...ids.map((id) => `drafts.${id}`)] },
);
if (existing.some(({ _id }) => _id.startsWith("drafts."))) {
  throw new Error(
    "Seed stopped because these initial records have draft edits. Publish or discard those edits before rerunning the initial import.",
  );
}
const existingIds = new Set(existing.map(({ _id }) => _id));
const missingIds = ids.filter((id) => !existingIds.has(id));
console.info(
  `Initial content import: ${projectId}/${dataset}; ${missingIds.length} missing records, ${existingIds.size} preserved.`,
);
if (!missingIds.length) {
  console.info("Nothing to import. Existing content was left unchanged.");
  process.exit(0);
}

const files = new Set<string>();
for (const project of content.projects) {
  if (existingIds.has(projectIdFor(project.id))) continue;
  for (const image of [
    project.cover,
    ...project.popupGallery,
    ...project.gallery,
  ])
    files.add(image.src);
}
for (const logo of content.home.clients.logos) {
  if (existingIds.has(logoIdFor(logo.id))) continue;
  files.add(logo.logo);
  if (logo.monochromeLogo) files.add(logo.monochromeLogo);
  if (logo.previewImage) files.add(logo.previewImage.src);
}
if (!existingIds.has("homepage")) {
  for (const image of content.home.about.photos) files.add(image.src);
}

function localPath(src: string) {
  if (!src.startsWith("/media/"))
    throw new Error(
      "The initial import only accepts local public/media files.",
    );
  const resolved = path.resolve(publicRoot, `.${src}`);
  if (!resolved.startsWith(`${publicRoot}${path.sep}`.replace(/\/+$/, "/"))) {
    throw new Error("Image path must stay inside public/.");
  }
  return resolved;
}

let totalBytes = 0;
for (const src of files) {
  const filename = localPath(src);
  await access(filename);
  totalBytes += (await stat(filename)).size;
}
console.info(
  `${files.size} approved image files, ${(totalBytes / 1024 / 1024).toFixed(1)} MB.`,
);
if (process.argv.includes("--dry-run")) {
  console.info(
    "Dry run complete. No assets uploaded and no documents written.",
  );
  process.exit(0);
}

const assets = new Map<string, string>();
const pending = [...files];
let cursor = 0;
await Promise.all(
  Array.from({ length: Math.min(4, pending.length) }, async () => {
    while (cursor < pending.length) {
      const src = pending[cursor++];
      const asset = await client.assets.upload(
        "image",
        createReadStream(localPath(src)),
        {
          filename: path.basename(src),
        },
      );
      assets.set(src, asset._id);
      console.info(`Uploaded image ${assets.size}/${pending.length}`);
    }
  }),
);

function image(value: ProjectImage | string, key: string, alt?: string) {
  const source =
    typeof value === "string"
      ? { src: value, alt: alt || "Logo", caption: "" }
      : value;
  const asset = assets.get(source.src);
  if (!asset) throw new Error("Missing uploaded asset for an initial image.");
  return {
    _type: "editorialImage",
    _key: key,
    asset: { _type: "reference", _ref: asset },
    alt: source.alt,
    caption: source.caption,
    ...(typeof value !== "string" && value.position
      ? { position: value.position }
      : {}),
    ...(typeof value !== "string" && value.previewScale
      ? { previewScale: value.previewScale }
      : {}),
  };
}

let transaction = client.transaction();
for (const project of content.projects) {
  const _id = projectIdFor(project.id);
  if (existingIds.has(_id)) continue;
  transaction = transaction.createIfNotExists({
    _id,
    _type: "project",
    enabled: true,
    title: project.title,
    client: project.client,
    slug: { _type: "slug", current: project.id },
    category: project.category,
    description: project.description,
    roles: project.roles,
    body: project.body,
    ...(project.credit ? { credit: project.credit } : {}),
    ...(project.link ? { link: project.link } : {}),
    ...(project.seoTitle ? { seoTitle: project.seoTitle } : {}),
    ...(project.seoDescription
      ? { seoDescription: project.seoDescription }
      : {}),
    coverImage: image(project.cover, "cover"),
    popupGallery: project.popupGallery.map((item, i) =>
      image(item, `popup-${i + 1}`),
    ),
    gallery: project.gallery.map((item, i) => image(item, `gallery-${i + 1}`)),
  });
}
for (const logo of content.home.clients.logos) {
  const _id = logoIdFor(logo.id);
  if (existingIds.has(_id)) continue;
  transaction = transaction.createIfNotExists({
    _id,
    _type: "clientLogo",
    enabled: true,
    name: logo.name,
    logo: image(logo.logo, "logo", logo.name),
    ...(logo.monochromeLogo
      ? { monochromeLogo: image(logo.monochromeLogo, "monochrome", logo.name) }
      : {}),
    ...(logo.projectId
      ? { project: reference(projectIdFor(logo.projectId), "project") }
      : {}),
    previewTitle: logo.previewTitle,
    ...(logo.previewImage
      ? { previewImage: image(logo.previewImage, "preview") }
      : {}),
  });
}
if (!existingIds.has("siteSettings")) {
  transaction = transaction.createIfNotExists({
    _id: "siteSettings",
    _type: "siteSettings",
    ...content.settings,
    navigation: content.settings.navigation.map((item, index) => ({
      ...item,
      _type: "navigationLink",
      _key: `nav-${index + 1}`,
    })),
  });
}
if (!existingIds.has("homepage")) {
  transaction = transaction.createIfNotExists({
    _id: "homepage",
    _type: "homepage",
    ...content.home,
    sections: content.home.sections.map((section) => ({
      ...section,
      _type: "homeSection",
      _key: section.section,
    })),
    heroProjects: content.home.heroProjects.map((id) =>
      reference(projectIdFor(id), id),
    ),
    about: {
      ...content.home.about,
      photos: content.home.about.photos.map((item, i) =>
        image(item, `about-${i + 1}`),
      ),
    },
    services: {
      ...content.home.services,
      items: content.home.services.items.map((item, index) => ({
        ...item,
        _type: "service",
        _key: `service-${index + 1}`,
      })),
    },
    clients: {
      ...content.home.clients,
      logos: content.home.clients.logos.map(({ id }) =>
        reference(logoIdFor(id), id),
      ),
    },
    work: {
      ...content.home.work,
      featuredProjects: content.home.work.featuredProjects.map((id) =>
        reference(projectIdFor(id), id),
      ),
    },
  });
}
await transaction.commit();
console.info(
  `Imported ${missingIds.length} initial records. Existing documents were not overwritten.`,
);
