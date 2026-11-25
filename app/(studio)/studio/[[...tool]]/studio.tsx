"use client";

import { useMemo } from "react";
import { NextStudio } from "next-sanity/studio";
import { createStudioConfig } from "@/studio/config";

export function Studio({
  projectId,
  dataset,
}: {
  projectId: string;
  dataset: string;
}) {
  const config = useMemo(
    () =>
      createStudioConfig({
        projectId,
        dataset,
        basePath: "/studio",
        previewUrl: "/",
      }),
    [projectId, dataset],
  );
  return <NextStudio config={config} />;
}
