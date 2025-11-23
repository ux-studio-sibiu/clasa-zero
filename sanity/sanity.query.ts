import { groq } from "next-sanity";
import client from "./sanity.client";
import {QuestionType } from "@/types";

const revalidateInterval = 10; // ms

export async function getQuestionList(): Promise<QuestionType[]> {
  const result = await client.fetch(
    groq`*[_type == "question"]{
      _id,
      question,
      backgroundImage,
      answers[],
      cssClass,
      textColors
    }`,
    {},
    // { next: { revalidate: revalidateInterval } }
  );

  return result as QuestionType[];
}
