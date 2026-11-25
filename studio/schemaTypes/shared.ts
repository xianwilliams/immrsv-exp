import { defineArrayMember, defineField, defineType } from "sanity";

export const sectionOptions = [
  { title: "About — Your project. The right support.", value: "about" },
  { title: "Services — Built around your project needs", value: "services" },
  { title: "Who we’ve worked with", value: "clients" },
  { title: "Case studies", value: "work" },
  { title: "Contact form", value: "contact" },
];

export const editorialImage = defineType({
  name: "editorialImage",
  title: "Photo or logo",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Image description",
      type: "string",
      description:
        "Briefly describe what’s in the image. Used by screen readers; for logos, enter the company name.",
      validation: (rule) => rule.required().max(250),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      validation: (rule) => rule.max(350),
    }),
    defineField({
      name: "position",
      title: "Legacy focal position",
      type: "string",
      hidden: true,
      description:
        "Preserves the imported composition. New photos use the crop and hotspot controls.",
    }),
    defineField({
      name: "previewScale",
      title: "Legacy preview scale",
      type: "number",
      hidden: true,
    }),
  ],
  preview: { select: { title: "alt", subtitle: "caption", media: "asset" } },
});

export function paragraphs(name: string, title: string, max = 8) {
  return defineField({
    name,
    title,
    type: "array",
    of: [
      defineArrayMember({
        type: "text",
        rows: 4,
        validation: (rule) => rule.required().max(1800),
      }),
    ],
    validation: (rule) => rule.max(max),
    description:
      "One paragraph per item. Drag to reorder. Keep the copy short and specific.",
  });
}

export function projectReferences(
  name: string,
  title: string,
  description: string,
  max = 30,
) {
  return defineField({
    name,
    title,
    description,
    type: "array",
    of: [
      defineArrayMember({
        type: "reference",
        to: [{ type: "project" }],
        options: { filter: "enabled != false" },
      }),
    ],
    validation: (rule) => rule.max(max).unique(),
  });
}

export const httpUrl = (value: string | undefined) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) ||
      "Use an https:// web address."
    );
  } catch {
    return "Use a complete web address starting with https://.";
  }
};
