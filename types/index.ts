import { PortableTextBlock } from "sanity";


export type QuestionType = {
  _id: string;
  question: string;
  backgroundImage?: {image: string };
  answers: string[];
  cssClass?: string;
  textColors?: string;
};

export type FigureFormType = {
  _id: string;
  image: {image: string };
  answers: string[];
  cssClass?: string;
  textColors?: string;
};


