import { defineArrayMember, defineField, defineType } from "sanity";
import CogIcon from "@sanity/icons/Cog";
import { httpUrl, sectionOptions } from "./shared";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "global", title: "Navigation & contact", default: true },
    { name: "footer", title: "Footer" },
    { name: "banner", title: "Project-page banner" },
    { name: "seo", title: "Search & sharing" },
  ],
  fields: [
    defineField({
      name: "contactEmail",
      title: "Public contact email",
      type: "string",
      group: "global",
      description:
        "Changes email links on the website. This does not change the form’s delivery inbox, which is configured separately in Web3Forms.",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "contactButton",
      title: "Contact button label",
      type: "string",
      group: "global",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "navigation",
      title: "Navigation links",
      type: "array",
      group: "global",
      description:
        "Drag to reorder. Links to hidden homepage sections are omitted from the website automatically.",
      of: [
        defineArrayMember({
          name: "navigationLink",
          title: "Navigation link",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "section",
              title: "Homepage section",
              type: "string",
              options: { list: sectionOptions },
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "section" } },
        }),
      ],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      group: "global",
      validation: (rule) => rule.custom(httpUrl),
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
      group: "global",
      validation: (rule) => rule.custom(httpUrl),
    }),
    defineField({
      name: "footerDescription",
      title: "Footer description",
      type: "text",
      rows: 4,
      group: "footer",
      description: "A new line creates a paragraph break. Keep this brief.",
      validation: (rule) => rule.required().max(600),
    }),
    defineField({
      name: "footerLocation",
      title: "Location line",
      type: "string",
      group: "footer",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "banner",
      title: "Project-page contact banner",
      type: "object",
      group: "banner",
      options: { collapsible: false },
      description:
        "Displayed below each project gallery. The background cycles through the homepage hero projects.",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Small label",
          type: "string",
          validation: (rule) => rule.max(80),
        }),
        defineField({
          name: "title",
          title: "Heading — main line",
          type: "text",
          rows: 2,
          validation: (rule) => rule.required().max(100),
        }),
        defineField({
          name: "emphasis",
          title: "Heading — light-weight line",
          type: "text",
          rows: 2,
          validation: (rule) => rule.max(100),
        }),
        defineField({
          name: "description",
          title: "Supporting text",
          type: "text",
          rows: 3,
          validation: (rule) => rule.max(500),
        }),
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "Site search title",
      type: "string",
      group: "seo",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "seoDescription",
      title: "Site search description",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.required().max(300),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Site settings",
      subtitle: "Shared copy, links, and search descriptions",
    }),
  },
});
