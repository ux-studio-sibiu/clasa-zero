// schemaTypes/question.ts

import { defineField } from "sanity";

const question = {
  name: "question",
  title: "Questions",
  type: "document",

  fields:[

  defineField({
      name: "question",
      title: "",
      type: "string",
    }),

    defineField({
        name: 'backgroundImage',
        title: 'Background Image',
        type: 'image',
        options: { hotspot: true },
    }),

    defineField({
        name: 'answers',
        title: 'Lista FAQs',
         type: 'array',
          of: [{ type: 'string' }],
    }),

    defineField({
      name: "cssClass",
      title: "",
      type: "string",
    }),

    defineField({
      name: "textColors",
      title: "",
      type: "string",
    }),

  ]
};

export default question;
