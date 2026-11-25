import { defineArrayMember, defineField, defineType } from "sanity";
import HomeIcon from "@sanity/icons/Home";
import { paragraphs, projectReferences, sectionOptions } from "./shared";

const headingFields = () => [
  defineField({
    name: "title",
    title: "Heading — main line",
    type: "text",
    rows: 2,
    description: "Use a new line for an intentional line break.",
    validation: (rule) => rule.required().max(120),
  }),
  defineField({
    name: "emphasis",
    title: "Heading — light-weight line",
    type: "text",
    rows: 2,
    validation: (rule) => rule.max(120),
  }),
];

export const homepage = defineType({
  name: "homepage",
  title: "Home",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "layout", title: "Section order", default: true },
    { name: "hero", title: "Hero slideshow" },
    { name: "about", title: "About" },
    { name: "services", title: "Services" },
    { name: "clients", title: "Client lineup" },
    { name: "work", title: "Case studies" },
    { name: "contact", title: "Contact" },
  ],
  initialValue: {
    sections: sectionOptions.map(({ value }) => ({
      _key: value,
      _type: "homeSection",
      section: value,
      enabled: true,
    })),
  },
  fields: [
    defineField({
      name: "sections",
      title: "Homepage section order",
      type: "array",
      group: "layout",
      description:
        "Drag the handles to move sections. Turn a section off to hide it without losing its content. The opening slideshow and footer stay at the top and bottom.",
      of: [
        defineArrayMember({
          name: "homeSection",
          title: "Homepage section",
          type: "object",
          fields: [
            defineField({
              name: "section",
              title: "Section",
              type: "string",
              options: { list: sectionOptions },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "enabled",
              title: "Show this section",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: { section: "section", enabled: "enabled" },
            prepare: ({ section, enabled }) => ({
              title:
                sectionOptions.find((item) => item.value === section)?.title ||
                "Choose a section",
              subtitle: enabled === false ? "Hidden" : "Visible",
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .max(5)
          .custom((items) => {
            const sections = (items || [])
              .map((item) => (item as { section?: string }).section)
              .filter(Boolean);
            return (
              new Set(sections).size === sections.length ||
              "Each section can appear only once."
            );
          }),
    }),
    {
      ...projectReferences(
        "heroProjects",
        "Hero slideshow projects",
        "Choose and drag projects into the order you want. Each slide uses one project’s homepage thumbnail. The contact panel uses the same slideshow.",
        20,
      ),
      group: "hero",
      validation: (rule) => rule.required().min(1).max(20).unique(),
    },
    defineField({
      name: "about",
      title: "About",
      type: "object",
      group: "about",
      options: { collapsible: false },
      fields: [
        ...headingFields(),
        paragraphs("paragraphs", "About paragraphs", 6),
        defineField({
          name: "photos",
          title: "Team / workshop photos",
          type: "array",
          of: [
            defineArrayMember({
              type: "editorialImage",
              validation: (rule) => rule.assetRequired(),
            }),
          ],
          description:
            "Up to three equal-sized images, shown side by side on desktop. Drag to reorder.",
          validation: (rule) => rule.max(3),
        }),
        defineField({
          name: "caption",
          title: "Photo caption",
          type: "string",
          validation: (rule) => rule.max(160),
        }),
      ],
    }),
    defineField({
      name: "services",
      title: "Services",
      type: "object",
      group: "services",
      options: { collapsible: false },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Small label",
          type: "string",
          validation: (rule) => rule.max(80),
        }),
        ...headingFields(),
        defineField({
          name: "items",
          title: "Services",
          type: "array",
          description:
            "Drag to change the order. Keep each description focused and concise.",
          of: [
            defineArrayMember({
              name: "service",
              type: "object",
              title: "Service",
              fields: [
                defineField({
                  name: "title",
                  title: "Service name",
                  type: "string",
                  validation: (rule) => rule.required().max(100),
                }),
                defineField({
                  name: "text",
                  title: "Description",
                  type: "text",
                  rows: 3,
                  validation: (rule) => rule.required().max(700),
                }),
                defineField({
                  name: "icon",
                  title: "Service icon",
                  type: "number",
                  initialValue: 0,
                  options: {
                    list: [
                      { title: "Clipboard — Project management", value: 0 },
                      { title: "Truck — Logistics", value: 1 },
                      { title: "Lightbulb — Strategy", value: 2 },
                      { title: "People — Staffing", value: 3 },
                      { title: "Tools — Design and build", value: 4 },
                      { title: "Spark — Other support", value: 5 },
                    ],
                  },
                  validation: (rule) => rule.required().integer().min(0).max(5),
                }),
              ],
              preview: { select: { title: "title", subtitle: "text" } },
            }),
          ],
          validation: (rule) => rule.max(12),
        }),
      ],
    }),
    defineField({
      name: "clients",
      title: "Client lineup",
      type: "object",
      group: "clients",
      options: { collapsible: false },
      fields: [
        ...headingFields(),
        defineField({
          name: "logos",
          title: "Logos to display",
          type: "array",
          description:
            "Publish a logo under Client logos, select it here, then publish Home. Drag to change the order. Up to 60 logos wrap into centered rows: three across on desktop and two on mobile. Removing a selection keeps its logo record for later.",
          of: [
            defineArrayMember({
              type: "reference",
              to: [{ type: "clientLogo" }],
              options: { filter: "enabled != false" },
            }),
          ],
          validation: (rule) => rule.max(60).unique(),
        }),
      ],
    }),
    defineField({
      name: "work",
      title: "Case studies",
      type: "object",
      group: "work",
      options: { collapsible: false },
      fields: [
        ...headingFields(),
        defineField({
          name: "eyebrow",
          title: "Right-hand label",
          type: "string",
          validation: (rule) => rule.max(80),
        }),
        projectReferences(
          "featuredProjects",
          "Homepage case studies",
          "Choose which projects appear on the homepage and drag to reorder. Removing a project here does not remove its full page.",
          60,
        ),
      ],
    }),
    defineField({
      name: "contact",
      title: "Contact form",
      type: "object",
      group: "contact",
      options: { collapsible: false },
      description:
        "These fields change the wording. Form delivery settings remain outside the content editor.",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Small label",
          type: "string",
          validation: (rule) => rule.max(80),
        }),
        defineField({
          name: "title",
          title: "Heading",
          type: "text",
          rows: 2,
          description: "Use a new line where you want the heading to break.",
          validation: (rule) => rule.required().max(150),
        }),
        defineField({
          name: "description",
          title: "Introduction",
          type: "text",
          rows: 2,
          validation: (rule) => rule.max(500),
        }),
        defineField({
          name: "successTitle",
          title: "Success heading",
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: "successMessage",
          title: "Success message",
          type: "text",
          rows: 2,
          validation: (rule) => rule.required().max(400),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Homepage",
      subtitle: "Sections, copy, photos, and featured projects",
    }),
  },
});
