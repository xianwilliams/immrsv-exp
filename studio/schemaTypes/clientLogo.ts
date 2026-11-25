import { defineField, defineType } from "sanity";
import UsersIcon from "@sanity/icons/Users";

export const clientLogo = defineType({
  name: "clientLogo",
  title: "Client logo",
  type: "document",
  icon: UsersIcon,
  initialValue: { enabled: true },
  fields: [
    defineField({
      name: "name",
      title: "Client name",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "enabled",
      title: "Available on the website",
      type: "boolean",
      description:
        "Turn off and publish to hide this logo. The display order is managed under Home → Client lineup.",
    }),
    defineField({
      name: "logo",
      title: "Brand logo",
      type: "editorialImage",
      description:
        "Use a transparent PNG, WebP, or SVG. This is shown in its original colors on hover.",
      validation: (rule) => rule.required().assetRequired(),
    }),
    defineField({
      name: "monochromeLogo",
      title: "White logo for the dark background",
      type: "editorialImage",
      description:
        "Optional white version. If omitted, the website converts the brand logo to white. Transparent backgrounds work best.",
    }),
    defineField({
      name: "project",
      title: "Linked case study",
      type: "reference",
      to: [{ type: "project" }],
      options: { filter: "enabled != false" },
      description:
        "Optional. Clicking the logo opens this project. The hover preview uses its thumbnail unless overridden below.",
    }),
    defineField({
      name: "previewTitle",
      title: "Hover preview title",
      type: "string",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "previewImage",
      title: "Hover preview image",
      type: "editorialImage",
    }),
  ],
  preview: {
    select: { title: "name", enabled: "enabled", media: "logo" },
    prepare: ({ title, enabled, media }) => ({
      title,
      subtitle: enabled === false ? "Hidden" : "Add to Home → Client lineup",
      media,
    }),
  },
});
