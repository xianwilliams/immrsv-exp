export function PublishedPreview({
  document,
  previewUrl,
}: {
  document: { displayed: { slug?: { current?: string } } };
  previewUrl: string;
}) {
  const slug = document.displayed.slug?.current;
  const href =
    slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
      ? `${previewUrl.replace(/\/$/, "")}/work/${encodeURIComponent(slug)}`
      : undefined;
  return (
    <div style={{ padding: 32, maxWidth: 660, lineHeight: 1.65 }}>
      <h2>Published project preview</h2>
      <p>
        Publish this project, then open the connected website to check its full
        page. Draft edits are not shown on the public website.
      </p>
      {href ? (
        <p>
          <a href={href} target="_blank" rel="noopener noreferrer">
            Open this project ↗
          </a>
        </p>
      ) : (
        <p>Add a page address in Project details first.</p>
      )}
      <p>
        To display its thumbnail and popup on the homepage, also add this
        project under Home → Case studies.
      </p>
    </div>
  );
}
