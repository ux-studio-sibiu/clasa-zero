import { create } from "zustand";
import { QuestionType } from "@/types";
import { getQuestionList } from "@/sanity/sanity.query";

interface DataStoreState {
  backgrounds: string[],

  questionsSanity: QuestionType[],
  getQuestionsFromSanity: () => Promise<void>;

  shapesList: string[],
  getShapes: () => void;
  getBackgrounds: () => void;
  getRandomBackground: (bk_preffer?: string[], bk_avoid?: string[]) => string;
}

export const useDataStore = create<DataStoreState>((set, get) => ({

  backgrounds: [],
  questionsSanity: [],
  shapesList: [],
  getQuestionsFromSanity: async () => { const data = await getQuestionList(); set({ questionsSanity: data }); },

  getShapes: async () => {
    const res = await fetch("/api/getShapes");
    const data = await res.json();
    set({ shapesList: data });
  },

  getBackgrounds: async () => {
    const res = await fetch("/api/getBackgrounds");
    const data = await res.json();
    set({ backgrounds: data });
    },

  getRandomBackground: (bk_preffer?: string[], bk_avoid?: string[]) => {
      bk_preffer = bk_preffer || [];
      bk_avoid = bk_avoid || [];

      let relevantBackgrounds = (get().backgrounds).filter((bk: string) => !bk_avoid.includes(bk));
      relevantBackgrounds = relevantBackgrounds.concat(bk_preffer).concat(bk_preffer).concat(bk_preffer);
      return relevantBackgrounds[Math.floor(Math.random() * relevantBackgrounds.length)];
  }

 
}));