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
  }

 
}));