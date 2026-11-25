import { previewUrl } from "../environment";

const panel = {
  maxWidth: 780,
  margin: "0 auto",
  padding: "40px 28px",
  lineHeight: 1.65,
};

export function EditorGuide() {
  return (
    <div style={{ overflow: "auto", height: "100%" }}>
      <article style={panel}>
        <p style={{ letterSpacing: ".12em", fontSize: 12, opacity: 0.65 }}>
          IMMRSV / WEBSITE EDITOR
        </p>
        <h1 style={{ lineHeight: 1.15, fontSize: 32 }}>
          Keep the work up to date.
        </h1>
        <p>
          Change your content here while the website keeps its existing design.
          Edits save as drafts. Click <strong>Publish</strong> when a change is
          ready to appear on the connected website.
        </p>
        <p>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            Open the connected website ↗
          </a>
        </p>
        <h2>Add a case study</h2>
        <ol>
          <li>
            Open <strong>Projects</strong> and create a new project.
          </li>
          <li>
            Add its client, title, page address, overview, and confirmed
            responsibilities.
          </li>
          <li>
            Under <strong>Photos &amp; galleries</strong>, upload a thumbnail
            and full-gallery photos. Drag photos into order. The first
            full-gallery photo is the lead image.
          </li>
          <li>
            Optionally choose separate popup accordion photos. If left empty,
            the first six gallery photos are used.
          </li>
          <li>
            Publish the project. Then open <strong>Home → Case studies</strong>,
            add it to Homepage case studies, and publish Home.
          </li>
        </ol>
        <h2>Choose what visitors see</h2>
        <p>
          <strong>Homepage only:</strong> Add, remove, or reorder references in
          Home → Case studies. Removing a reference leaves the full project page
          available.
        </p>
        <p>
          <strong>Hide a project everywhere:</strong> Turn off “Visible on the
          website” in its project record, then publish. Its page and all related
          previews will be hidden.
        </p>
        <p>
          <strong>Homepage order:</strong> In Home → Section order, drag a
          section’s handle above or below another section. The opening slideshow
          and footer stay at the top and bottom.
        </p>
        <h2>Update logos and photos</h2>
        <p>
          Create or edit a record under <strong>Client logos</strong>. Upload a
          transparent brand logo and optionally a white version, then select its
          related project. Add it to <strong>Home → Client lineup</strong> and
          publish Home. You can reorder or remove logos there.
        </p>
        <p>
          Use each photo’s crop and hotspot controls to keep the subject in
          frame. Add a short image description for accessibility. A caption is
          optional.
        </p>
        <h2>Copy and shared settings</h2>
        <p>
          The Home tabs contain section headings and copy.{" "}
          <strong>Site settings</strong> contains navigation labels, social
          links, the footer, the project-page banner, and search descriptions.
        </p>
        <p>
          Changing the public contact email changes the website’s email links.
          It does not change form delivery; the receiving inbox is set
          separately in Web3Forms.
        </p>
        <h2>Review before publishing</h2>
        <p>
          Publishing updates the connected website after its cache refresh.
          Refresh the preview to check the result. Drafts do not appear on the
          public website. The Published preview tab shows the published page,
          not an unpublished draft.
        </p>
        <p>
          Custom layouts, new features, new section types, and integrations
          remain development work. Contact Fruitstand for those changes.
        </p>
      </article>
    </div>
  );
}
