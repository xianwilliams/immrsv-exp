import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { createDefaultDocumentNode, createStructure } from "./structure";

const singletons = new Set(["homepage", "siteSettings"]);
const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export function createStudioConfig({
  projectId,
  dataset,
  previewUrl,
  basePath = "/",
}: {
  projectId: string;
  dataset: string;
  previewUrl: string;
  basePath?: string;
}) {
  return defineConfig({
    name: "immrsv",
    title: "IMMRSV — Website Editor",
    projectId,
    dataset,
    basePath,
    plugins: [
      structureTool({
        structure: createStructure(previewUrl),
        defaultDocumentNode: createDefaultDocumentNode(previewUrl),
      }),
    ],
    // The editor deliberately uses only Free-plan content editing features.
    // Keep trial-only workflows out of the interface even during a trial.
    tasks: { enabled: false },
    releases: { enabled: false },
    scheduledDrafts: { enabled: false },
    scheduledPublishing: { enabled: false },
    mediaLibrary: { enabled: false },
    schema: {
      types: schemaTypes,
      templates: (templates) =>
        templates.filter(({ schemaType }) => !singletons.has(schemaType)),
    },
    document: {
      comments: { enabled: false },
      actions: (actions, context) =>
        singletons.has(context.schemaType)
          ? actions.filter(
              ({ action }) => action && singletonActions.has(action),
            )
          : actions,
    },
  });
}
