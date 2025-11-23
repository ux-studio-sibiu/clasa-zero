import { PortableTextBlock } from "sanity";


export type QuestionType = {
  _id: string;
  question: string;
  backgroundImage?: {image: string };
  answers: string[];
  cssClass?: string;
  textColors?: string;
};


