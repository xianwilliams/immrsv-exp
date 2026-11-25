import { createStudioConfig } from "./config";
import { dataset, projectId, previewUrl } from "./environment";

export default createStudioConfig({
  projectId: projectId!,
  dataset,
  previewUrl,
});
