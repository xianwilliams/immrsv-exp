import type { Metadata } from "next";
import { Studio } from "./studio";

export { viewport } from "next-sanity/studio";
export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Client login | IMMRSV Studio",
  robots: { index: false, follow: false, noarchive: true },
};

export default function StudioPage() {
  const projectId = process.env.SANITY_PROJECT_ID?.trim();
  const dataset = process.env.SANITY_DATASET?.trim();
  if (!projectId || !dataset) {
    return (
      <main style={{ padding: 32, fontFamily: "sans-serif" }}>
        <h1>IMMRSV Website Editor</h1>
        <p>
          The editor connection has not been configured for this environment.
        </p>
        <a
          href="https://immrsv-editor.sanity.studio/"
          style={{ color: "inherit" }}
        >
          Open the hosted editor
        </a>
      </main>
    );
  }
  // Only public project identifiers cross the boundary. Sanity handles login
  // and checks project membership; no API token is sent to the browser.
  return <Studio projectId={projectId} dataset={dataset} />;
}
