import assert from "node:assert/strict";
import { getCliClient } from "sanity/cli";

// User-requested live demonstration. Run only after the CMS-connected site is
// deployed, to demonstrate that a new case-study page needs no code rebuild.
const client = getCliClient({ apiVersion: "2026-11-01" }).withConfig({
  useCdn: false,
  perspective: "raw",
});
const config = client.config();
assert(
  config.projectId === process.env.SANITY_DEMO_PROJECT_ID &&
    config.dataset === "production" &&
    config.token,
  "Set SANITY_DEMO_PROJECT_ID to the intended project and run with --with-user-token.",
);
const id = "project-cms-test";
const source = await client.getDocument("project-starry");
const home = await client.getDocument("homepage");
assert(source && source.gallery?.length >= 3 && source.coverImage && home?.work);
await client.createIfNotExists({
  _id: id,
  _type: "project",
  enabled: true,
  client: "IMMRSV CMS TEST",
  title: "CMS test project",
  slug: { _type: "slug", current: "cms-test" },
  category: "Temporary website test",
  description:
    "This is a temporary test case study created in Sanity to demonstrate adding a new page, a homepage card, and a popup gallery. The images are from the existing approved Starry project; this is not a separate client project.",
  body: [
    "This page was published after the CMS-connected website was deployed. Its title, text, cover image, popup photos, and full gallery can all be updated in the website editor without writing code.",
    "Once the publishing workflow has been reviewed, this test case study can be removed. The original Starry case study remains unchanged.",
  ],
  coverImage: source.coverImage,
  popupGallery: source.gallery.slice(0, 3),
  gallery: source.gallery.slice(0, 4),
  roles: [],
  seoTitle: "CMS test project | IMMRSV",
  seoDescription:
    "Temporary demonstration of creating and publishing a case study through the IMMRSV content editor.",
});
const current = home.work.featuredProjects || [];
if (!current.some((reference: { _ref: string }) => reference._ref === id)) {
  await client
    .patch("homepage")
    .ifRevisionId(home._rev)
    .set({
      "work.featuredProjects": [
        { _type: "reference", _key: "cms-test", _ref: id },
        ...current,
      ],
    })
    .commit();
}
console.info(
  "Published /work/cms-test and featured it first on Home. No website build was triggered.",
);
