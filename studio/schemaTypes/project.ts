import { defineArrayMember, defineField, defineType } from "sanity";
import ImageIcon from "@sanity/icons/Image";
import { httpUrl, paragraphs } from "./shared";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: ImageIcon,
  description:
    "One record powers the project’s homepage card, popup, and full case-study page.",
  groups: [
    { name: "story", title: "Project details", default: true },
    { name: "images", title: "Photos & galleries" },
    { name: "seo", title: "Search & sharing" },
  ],
  initialValue: { enabled: true, roles: [], body: [], popupGallery: [] },
  fields: [
    defineField({
      name: "enabled",
      title: "Visible on the website",
      type: "boolean",
      group: "story",
      description:
        "Turn off and publish to hide this project everywhere, including its direct page. To remove only its homepage card, edit Home → Case studies instead.",
    }),
    defineField({
      name: "client",
      title: "Client / brand",
      type: "string",
      group: "story",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "title",
      title: "Project title",
      type: "string",
      group: "story",
      validation: (rule) => rule.required().max(150),
    }),
    defineField({
      name: "slug",
      title: "Page address",
      type: "slug",
      group: "story",
      options: {
        source: (doc) => `${doc.client || ""} ${doc.title || ""}`,
        maxLength: 96,
      },
      description:
        "Click Generate when creating a project. Avoid changing this after sharing the page: changing it changes the URL.",
      validation: (rule) =>
        rule
          .required()
          .custom(
            (value) =>
              !value?.current ||
              /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) ||
              "Use lowercase letters, numbers, and single hyphens only.",
          ),
    }),
    defineField({
      name: "category",
      title: "Type of work",
      type: "string",
      group: "story",
      description:
        "For example: Brand activation, Custom fabrication, or Event environment.",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "description",
      title: "Short overview",
      type: "text",
      rows: 4,
      group: "story",
      description:
        "Shown in the popup and on the case-study page. Describe the work without overclaiming.",
      validation: (rule) => rule.required().max(1200),
    }),
    { ...paragraphs("body", "Additional project story", 10), group: "story" },
    defineField({
      name: "roles",
      title: "IMMRSV’s involvement",
      type: "array",
      group: "story",
      of: [
        defineArrayMember({
          type: "string",
          validation: (rule) => rule.required().max(100),
        }),
      ],
      description:
        "Only list work IMMRSV actually provided. Leave empty when credits are not confirmed.",
      validation: (rule) => rule.max(15).unique(),
    }),
    defineField({
      name: "credit",
      title: "Partner / agency credits",
      type: "text",
      rows: 2,
      group: "story",
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: "link",
      title: "Project source link",
      type: "url",
      group: "story",
      validation: (rule) => rule.custom(httpUrl),
    }),
    defineField({
      name: "coverImage",
      title: "Homepage thumbnail",
      type: "editorialImage",
      group: "images",
      description:
        "This is also used when the project is selected for the hero or background slideshow. Use a strong installation or environment photograph.",
      validation: (rule) => rule.required().assetRequired(),
    }),
    defineField({
      name: "popupGallery",
      title: "Popup accordion photos",
      type: "array",
      group: "images",
      of: [
        defineArrayMember({
          type: "editorialImage",
          validation: (rule) => rule.assetRequired(),
        }),
      ],
      description:
        "Optional. Leave empty to use the first six full-gallery photos. Otherwise upload and arrange the photos to show in the project popup.",
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: "gallery",
      title: "Full case-study gallery",
      type: "array",
      group: "images",
      of: [
        defineArrayMember({
          type: "editorialImage",
          validation: (rule) => rule.required().assetRequired(),
        }),
      ],
      description:
        "Drag to reorder. The first photo becomes the large lead image on the case-study page. All photos can be enlarged by visitors.",
      validation: (rule) => rule.required().min(1).max(60),
    }),
    defineField({
      name: "seoTitle",
      title: "Search title",
      type: "string",
      group: "seo",
      description: "Optional. Defaults to the client and project title.",
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: "seoDescription",
      title: "Search description",
      type: "text",
      rows: 3,
      group: "seo",
      description: "Optional. Defaults to the short overview.",
      validation: (rule) => rule.max(300),
    }),
  ],
  orderings: [
    {
      title: "Recently updated",
      name: "updated",
      by: [{ field: "_updatedAt", direction: "desc" }],
    },
    {
      title: "Client A–Z",
      name: "client",
      by: [
        { field: "client", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      client: "client",
      enabled: "enabled",
      media: "coverImage",
    },
    prepare: ({ title, client, enabled, media }) => ({
      title,
      subtitle: `${client || "Client not set"}${enabled === false ? " · Hidden" : ""}`,
      media,
    }),
  },
});
