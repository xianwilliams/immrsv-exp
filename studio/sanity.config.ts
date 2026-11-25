import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./environment";
import { schemaTypes } from "./schemaTypes";
import { defaultDocumentNode, structure } from "./structure";

const singletons = new Set(["homepage", "siteSettings"]);
const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "immrsv",
  title: "IMMRSV — Website Editor",
  projectId: projectId!,
  dataset,
  plugins: [structureTool({ structure, defaultDocumentNode })],
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
        ? actions.filter(({ action }) => action && singletonActions.has(action))
        : actions,
  },
});
