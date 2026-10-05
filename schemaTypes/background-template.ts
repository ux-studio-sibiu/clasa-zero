// schemaTypes/background-template.ts
//
// A puzzle background template. Made and edited from the game with ?background-tools (Q saves);
// the Studio is for filing them - which puzzles, how often, on or off. The template itself is JSON
// text, checked by the same validator the save route uses (see pattern-background/templates.ts).

import { defineField, defineType } from "sanity";
import { PUZZLE_TYPES, validateTemplate } from "../app/components/pattern-background/templates";

const json = (validate?: (v: unknown) => string | true) => (value?: string) => {
  if (!value) return true;
  try { return validate ? validate(JSON.parse(value)) : true; } catch { return "Not valid JSON"; }
};

export default defineType({
  name: "backgroundTemplate",
  title: "Background templates",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required().max(80) }),
    defineField({
      name: "puzzleTypes", title: "Puzzles", type: "array", of: [{ type: "string" }],
      description: "The pools this template is in. None: it is never picked.",
      options: { list: PUZZLE_TYPES.map((t) => ({ title: t.label, value: t.key })), layout: "grid" },
    }),
    defineField({
      name: "weight", title: "Weight", type: "number", initialValue: 1,
      description: "How often it is picked against the others in the same pool. 1 is the default; 2 is twice as often.",
      validation: (r) => r.required().min(0).max(100),
    }),
    defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
    defineField({
      name: "template", title: "Template (JSON)", type: "text", rows: 12,
      description: "Fixed values and rules. Easier to edit from the game with ?background-tools.",
      validation: (r) => r.required().custom(json((v) => { const res = validateTemplate(v); return res.ok || res.error; })),
    }),
    defineField({
      name: "snapshot", title: "Snapshot (JSON)", type: "text", rows: 4, readOnly: true,
      description: "The look on screen when it was saved - what the panel loads.",
      validation: (r) => r.custom(json()),
    }),
  ],
  preview: {
    select: { title: "name", types: "puzzleTypes", weight: "weight", enabled: "enabled" },
    prepare: ({ title, types, weight, enabled }) => ({
      title: `${enabled === false ? "(off) " : ""}${title}`,
      subtitle: `${(types || []).join(", ") || "no puzzles"} · weight ${weight ?? 1}`,
    }),
  },
});
