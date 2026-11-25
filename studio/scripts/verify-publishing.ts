import assert from "node:assert/strict";
import { getCliClient } from "sanity/cli";

// Explicitly gated, local-only acceptance check. Restores the homepage and removes
// only the two disposable records this run creates. Never touches existing projects.
const client = getCliClient({ apiVersion: "2026-11-01" }).withConfig({
  useCdn: false,
  perspective: "raw",
});
const config = client.config();
if (
  process.env.SANITY_VERIFY_PROJECT_ID !== config.projectId ||
  !config.token ||
  config.dataset !== "production"
) {
  throw new Error(
    "Set SANITY_VERIFY_PROJECT_ID to the intended test project and run with --with-user-token.",
  );
}
const base = new URL(process.env.SANITY_VERIFY_SITE || "http://127.0.0.1:3100");
assert(
  ["127.0.0.1", "localhost"].includes(base.hostname),
  "This check only runs against a local website.",
);
const suffix = Date.now().toString(36);
const id = `qa-project-${suffix}`;
const logoId = `qa-logo-${suffix}`;
const title = `CMS acceptance ${suffix}`;
const slug = `cms-acceptance-${suffix}`;
const home = await client.getDocument("homepage");
assert(home && Array.isArray(home.sections) && home.clients && home.work);
const project = await client.fetch(
  '*[_type == "project" && enabled != false][0]',
);
const logo = await client.fetch(
  '*[_type == "clientLogo" && enabled != false][0]',
);
assert(project?.coverImage && project.gallery?.length && logo?.logo);
const ref = (_ref: string) => ({ _type: "reference", _ref, _key: _ref });
const route = `/work/${slug}`;
let homeRevision: string | undefined;
let created = false;
async function eventually(
  label: string,
  path: string,
  check: (status: number, html: string) => boolean,
) {
  const deadline = Date.now() + 105_000;
  while (Date.now() < deadline) {
    const response = await fetch(new URL(path, base));
    const html = await response.text();
    if (check(response.status, html)) {
      console.info(`PASS: ${label}`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
  throw new Error(`Timed out: ${label}`);
}
try {
  await client.create({
    _id: `drafts.${id}`,
    _type: "project",
    enabled: true,
    client: "Local CMS test",
    title,
    slug: { _type: "slug", current: slug },
    category: "Verification only",
    description: "Temporary local CMS verification record.",
    coverImage: project.coverImage,
    gallery: project.gallery.slice(0, 3),
    popupGallery: project.gallery.slice(0, 2),
    body: ["A project added without rebuilding the website."],
    roles: [],
  });
  created = true;
  await eventually(
    "draft stays off public project routes",
    route,
    (status) => status === 404,
  );
  const draft = await client.getDocument(`drafts.${id}`);
  assert(draft);
  const { _rev, _createdAt, _updatedAt, ...fields } = draft;
  await client
    .transaction()
    .create({ ...fields, _id: id })
    .delete(`drafts.${id}`)
    .create({
      _id: logoId,
      _type: "clientLogo",
      name: `QA client ${suffix}`,
      enabled: true,
      logo: logo.logo,
      project: ref(id),
      previewTitle: title,
    })
    .commit();
  const changed = await client
    .patch("homepage")
    .ifRevisionId(home._rev)
    .set({
      sections: [...home.sections].sort((a, b) =>
        a.section === "clients" ? -1 : b.section === "clients" ? 1 : 0,
      ),
      "clients.logos": [...home.clients.logos, ref(logoId)],
      "work.featuredProjects": [ref(id), ...home.work.featuredProjects],
    })
    .commit();
  homeRevision = changed._rev;
  await eventually(
    "new published page works without rebuild",
    route,
    (status, html) =>
      status === 200 &&
      html.includes(title) &&
      html.includes("A project added without rebuilding"),
  );
  await eventually(
    "homepage project, logo, and reordered sections publish",
    "/",
    (status, html) =>
      status === 200 &&
      html.includes(title) &&
      html.includes(`QA client ${suffix}`) &&
      html.indexOf('id="clients"') < html.indexOf('id="about"'),
  );
  const updated = await client
    .patch(id)
    .set({
      title: `${title} updated`,
      "coverImage.hotspot": {
        _type: "sanity.imageHotspot",
        x: 0.3,
        y: 0.4,
        width: 0.2,
        height: 0.2,
      },
    })
    .commit();
  assert(updated._id === id);
  await eventually(
    "published copy and image framing update",
    route,
    (status, html) => status === 200 && html.includes(`${title} updated`),
  );
  const restored = await client
    .patch("homepage")
    .ifRevisionId(homeRevision)
    .set({ sections: home.sections, clients: home.clients, work: home.work })
    .commit();
  homeRevision = undefined;
  assert(restored._id === "homepage");
  await eventually(
    "unfeatured project stays accessible",
    route,
    (status) => status === 200,
  );
  await client.patch(id).set({ enabled: false }).commit();
  await eventually(
    "disabled project is unavailable",
    route,
    (status) => status === 404,
  );
  await eventually(
    "homepage restored",
    "/",
    (status, html) =>
      status === 200 &&
      !html.includes(title) &&
      !html.includes(`QA client ${suffix}`) &&
      html.indexOf('id="about"') < html.indexOf('id="clients"'),
  );
} finally {
  if (homeRevision)
    await client
      .patch("homepage")
      .ifRevisionId(homeRevision)
      .set({ sections: home.sections, clients: home.clients, work: home.work })
      .commit();
  if (created)
    await client
      .transaction()
      .delete(logoId)
      .delete(id)
      .delete(`drafts.${id}`)
      .commit();
  console.info(
    "Temporary test records removed; original homepage selections restored.",
  );
}
