import CogIcon from "@sanity/icons/Cog";
import DocumentTextIcon from "@sanity/icons/DocumentText";
import HomeIcon from "@sanity/icons/Home";
import ImageIcon from "@sanity/icons/Image";
import UsersIcon from "@sanity/icons/Users";
import type {
  DefaultDocumentNodeResolver,
  StructureResolver,
} from "sanity/structure";
import { EditorGuide } from "./components/EditorGuide";
import { PublishedPreview } from "./components/PublishedPreview";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("IMMRSV website")
    .items([
      S.listItem()
        .id("editor-guide")
        .title("Start here")
        .icon(DocumentTextIcon)
        .child(
          S.component(EditorGuide).id("editor-guide").title("Editor guide"),
        ),
      S.divider(),
      S.listItem()
        .title("Home")
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType("homepage")
            .documentId("homepage")
            .title("Home"),
        ),
      S.documentTypeListItem("project").title("Projects").icon(ImageIcon),
      S.documentTypeListItem("clientLogo")
        .title("Client logos")
        .icon(UsersIcon),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site settings"),
        ),
    ]);

export const defaultDocumentNode: DefaultDocumentNodeResolver = (
  S,
  { schemaType },
) =>
  S.document().views(
    schemaType === "project"
      ? [
          S.view.form(),
          S.view.component(PublishedPreview).title("Published preview"),
        ]
      : [S.view.form()],
  );
