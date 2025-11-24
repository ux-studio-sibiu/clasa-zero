// components/data-store.tsx

import { create } from "zustand";
import { QuestionType } from "@/types";
import { getQuestionList } from "@/sanity/sanity.query";

interface DataStoreState {
  questionsSanity: QuestionType[],
  getQuestionsFromSanity: () => Promise<void>;

  shapesList: string[],
  getShapes: () => void;
}

export const useDataStore = create<DataStoreState>((set, get) => ({

  questionsSanity: [],
  shapesList: [],
  getQuestionsFromSanity: async () => { const data = await getQuestionList(); set({ questionsSanity: data }); },

  getShapes: async () => {
    const res = await fetch("/api/getShapes");
    const data = await res.json();
    set({ shapesList: data });
  }

 
}));

