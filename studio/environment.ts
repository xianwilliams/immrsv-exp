export const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
export const dataset = process.env.SANITY_STUDIO_DATASET || "production";
export const previewUrl =
  process.env.SANITY_STUDIO_PREVIEW_URL || "http://127.0.0.1:3000";

if (!projectId || !/^[a-z0-9]+$/.test(projectId)) {
  throw new Error(
    "Set SANITY_STUDIO_PROJECT_ID in studio/.env.local before starting the editor.",
  );
}
if (!/^[a-zA-Z0-9_-]+$/.test(dataset)) {
  throw new Error("SANITY_STUDIO_DATASET must be a valid Sanity dataset name.");
}
