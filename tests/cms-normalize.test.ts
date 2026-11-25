import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeContent, normalizeImage } from "../lib/cms/normalize.ts";

function photo(overrides: Record<string, unknown> = {}) {
  return {
    asset: {
      url: "https://cdn.sanity.io/images/mp1drxt3/production/example-1000x800.jpg",
      metadata: { dimensions: { width: 1000, height: 800 } },
    },
    alt: "A branded installation",
    caption: "An installation in its event setting.",
    ...overrides,
  };
}

function project(id: string, overrides: Record<string, unknown> = {}) {
  return {
    _id: `unrelated-document-id-${id}`,
    slug: { current: id },
    enabled: true,
    client: "Example client",
    title: `Project ${id}`,
    description: "The project overview.",
    category: "Event production",
    coverImage: photo(),
    gallery: [photo()],
    roles: ["Fabrication", "Event production"],
    ...overrides,
  };
}

function content(overrides: Record<string, unknown> = {}) {
  return {
    home: { _id: "homepage" },
    settings: { _id: "siteSettings" },
    projects: [],
    ...overrides,
  };
}

const ref = (id: string) => ({ slug: { current: id } });

test("editing a native hotspot overrides migrated framing and follows the cropped image", () => {
  const normalized = normalizeImage(
    photo({
      position: "30% 40%",
      crop: { left: 0.1, right: 0.1, top: 0.25, bottom: 0.25 },
      hotspot: { x: 0.75, y: 0.5 },
    }),
  );
  assert.ok(normalized);
  assert.equal(normalized.position, "81.25% 50%");
  assert.equal(
    new URL(normalized.src).searchParams.get("rect"),
    "100,200,800,400",
  );
  assert.equal(normalized.width, 800);
  assert.equal(normalized.height, 400);
  assert.equal(normalized.alt, "A branded installation");
  assert.equal(normalized.caption, "An installation in its event setting.");
});

test("migration framing is retained until a valid editor hotspot is supplied", () => {
  assert.equal(
    normalizeImage(photo({ position: "30% 40%" }))?.position,
    "30% 40%",
  );
  assert.equal(
    normalizeImage(photo({ position: "30% 40%", hotspot: { x: NaN, y: 0.5 } }))
      ?.position,
    "30% 40%",
  );
  assert.equal(
    normalizeImage(photo({ position: "30% 40%", hotspot: { x: 0.5, y: 0.5 } }))
      ?.position,
    "50% 50%",
  );
  assert.equal(
    normalizeImage(photo({ position: "999% 0%" }))?.position,
    "100% 0%",
  );
  assert.equal(
    normalizeImage(photo({ position: "not a position" }))?.position,
    "50% 50%",
  );
});

test("even extreme crops produce a positive integer rectangle inside the source image", () => {
  for (const width of [1, 2, 7, 50, 1000]) {
    for (const crop of [0, 0.01, 0.499, 0.5, 0.99, 1, 10, -1, NaN]) {
      const normalized = normalizeImage(
        photo({
          asset: {
            url: `https://cdn.sanity.io/images/mp1drxt3/production/example-${width}x7.jpg`,
            metadata: { dimensions: { width, height: 7 } },
          },
          crop: { left: crop, right: crop, top: crop, bottom: crop },
        }),
      );
      assert.ok(normalized);
      const rectangle = new URL(normalized.src).searchParams.get("rect");
      if (!rectangle) continue;
      const [x, y, w, h] = rectangle.split(",").map(Number);
      assert.ok([x, y, w, h].every(Number.isInteger));
      assert.ok(x >= 0 && y >= 0 && w >= 1 && h >= 1);
      assert.ok(x + w <= width && y + h <= 7, rectangle);
      assert.equal(normalized.width, w);
      assert.equal(normalized.height, h);
    }
  }
});

test("vector logos stay vector without unsupported transformations or false cropped dimensions", () => {
  const assetUrl =
    "https://cdn.sanity.io/images/mp1drxt3/production/brand-400x200.svg";
  const normalized = normalizeImage(
    photo({
      asset: {
        url: assetUrl,
        metadata: { dimensions: { width: 400, height: 200 } },
      },
      crop: { left: 0.25, right: 0.25, top: 0.25, bottom: 0.25 },
    }),
  );
  assert.ok(normalized);
  assert.equal(normalized.src, assetUrl);
  assert.equal(normalized.width, 400);
  assert.equal(normalized.height, 200);
});

test("images reject unsafe origins and never expose non-finite framing values", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://cdn.sanity.io/image.jpg",
    "https://cdn.sanity.io.evil.example/image.jpg",
    "https://elsewhere.example/image.jpg",
  ]) {
    assert.equal(normalizeImage(photo({ asset: { url } })), undefined);
  }
  const normalized = normalizeImage(
    photo({ previewScale: Infinity, hotspot: { x: Infinity, y: NaN } }),
  );
  assert.ok(normalized);
  assert.equal(normalized.previewScale, undefined);
  assert.equal(normalized.position, "50% 50%");
});

test("new projects use their editable slug in homepage, hero and client-logo references", () => {
  const normalized = normalizeContent(
    content({
      projects: [project("first-event"), project("brand-new-installation")],
      home: {
        _id: "homepage",
        heroProjects: [ref("brand-new-installation"), ref("first-event")],
        work: {
          featuredProjects: [
            ref("brand-new-installation"),
            ref("first-event"),
            ref("brand-new-installation"),
          ],
        },
        clients: {
          logos: [
            {
              _id: "logo-independent-id",
              name: "New brand",
              logo: photo(),
              project: ref("brand-new-installation"),
            },
          ],
        },
      },
    }),
  );
  assert.deepEqual(normalized.home.heroProjects, [
    "brand-new-installation",
    "first-event",
  ]);
  assert.deepEqual(normalized.home.work.featuredProjects, [
    "brand-new-installation",
    "first-event",
  ]);
  assert.equal(
    normalized.home.clients.logos[0].projectId,
    "brand-new-installation",
  );
  assert.equal(
    normalized.home.clients.logos[0].previewTitle,
    "Project brand-new-installation",
  );
  assert.equal(
    normalized.home.clients.logos[0].previewImage?.src,
    normalized.projects[1].cover.src,
  );
});

test("unpublished, disabled and incomplete projects cannot appear in galleries or selected references", () => {
  const projects = [
    project("visible"),
    project("draft", { _id: "drafts.project-draft" }),
    project("future", { _id: "versions.release.project-future" }),
    project("disabled", { enabled: false }),
    project("missing-gallery", { gallery: [] }),
    project("invalid slug"),
  ];
  const refs = [
    "visible",
    "draft",
    "future",
    "disabled",
    "missing-gallery",
    "invalid slug",
    "deleted",
  ].map(ref);
  const normalized = normalizeContent(
    content({
      projects,
      home: {
        _id: "homepage",
        heroProjects: refs,
        work: { featuredProjects: refs },
      },
    }),
  );
  assert.deepEqual(
    normalized.projects.map(({ id }) => id),
    ["visible"],
  );
  assert.deepEqual(normalized.home.heroProjects, ["visible"]);
  assert.deepEqual(normalized.home.work.featuredProjects, ["visible"]);
});

test("client lineup excludes draft, future and disabled logos and removes dead project links", () => {
  const logo = { name: "Client", logo: photo() };
  const normalized = normalizeContent(
    content({
      projects: [project("hidden", { enabled: false })],
      home: {
        _id: "homepage",
        clients: {
          logos: [
            { ...logo, _id: "logo-visible", project: ref("hidden") },
            { ...logo, _id: "drafts.logo-draft" },
            { ...logo, _id: "versions.release.logo-future" },
            { ...logo, _id: "logo-disabled", enabled: false },
          ],
        },
      },
    }),
  );
  assert.deepEqual(
    normalized.home.clients.logos.map(({ id }) => id),
    ["logo-visible"],
  );
  assert.equal(normalized.home.clients.logos[0].projectId, undefined);
});

test("section drag order and visibility are preserved, while duplicates and unknown sections are removed", () => {
  const normalized = normalizeContent(
    content({
      home: {
        _id: "homepage",
        sections: [
          { section: "clients", enabled: true },
          { section: "about", enabled: false },
          { section: "clients", enabled: false },
          { section: "unknown", enabled: true },
          { section: "services", enabled: true },
        ],
      },
    }),
  );
  assert.deepEqual(normalized.home.sections, [
    { section: "clients", enabled: true },
    { section: "about", enabled: false },
    { section: "services", enabled: true },
  ]);
});

test("intentionally empty selections stay empty instead of resurrecting static website content", () => {
  const normalized = normalizeContent(
    content({
      projects: [project("published-but-unfeatured")],
      home: {
        _id: "homepage",
        sections: [],
        heroProjects: [],
        about: { paragraphs: [], photos: [] },
        services: { items: [] },
        clients: { logos: [] },
        work: { featuredProjects: [] },
      },
      settings: { _id: "siteSettings", navigation: [] },
    }),
  );
  assert.deepEqual(normalized.home.sections, []);
  assert.deepEqual(normalized.home.heroProjects, []);
  assert.deepEqual(normalized.home.about.paragraphs, []);
  assert.deepEqual(normalized.home.about.photos, []);
  assert.deepEqual(normalized.home.services.items, []);
  assert.deepEqual(normalized.home.clients.logos, []);
  assert.deepEqual(normalized.home.work.featuredProjects, []);
  assert.deepEqual(normalized.settings.navigation, []);
  assert.equal(normalized.projects.length, 1);
  assert.deepEqual(normalizeContent(content()).projects, []);
});

test("popup galleries inherit the first six photos only when no custom popup selection exists", () => {
  const gallery = Array.from({ length: 8 }, (_, i) =>
    photo({ caption: `Full gallery ${i + 1}` }),
  );
  const normalized = normalizeContent(
    content({
      projects: [
        project("inherited", { gallery, popupGallery: [] }),
        project("custom", {
          gallery,
          popupGallery: [photo({ caption: "Custom popup choice" })],
        }),
      ],
    }),
  );
  assert.deepEqual(
    normalized.projects[0].popupGallery.map(({ caption }) => caption),
    [
      "Full gallery 1",
      "Full gallery 2",
      "Full gallery 3",
      "Full gallery 4",
      "Full gallery 5",
      "Full gallery 6",
    ],
  );
  assert.deepEqual(
    normalized.projects[1].popupGallery.map(({ caption }) => caption),
    ["Custom popup choice"],
  );
  assert.equal(normalized.projects[1].gallery.length, 8);
});

test("unpublished or missing singleton documents fail explicitly instead of showing drafts or defaults", () => {
  for (const bad of [
    { home: null },
    { settings: null },
    { home: { _id: "drafts.homepage" } },
    { settings: { _id: "versions.release.siteSettings" } },
  ]) {
    assert.throws(
      () => normalizeContent(content(bad)),
      /Publish the Homepage and Site settings/,
    );
  }
});
