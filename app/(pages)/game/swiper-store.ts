// game/swiper-store.tsx

import { create } from "zustand";
import type { Swiper as SwiperType } from "swiper";
import { QuestionType } from "@/types";
import { getQuestionList } from "@/sanity/sanity.query";

interface SwiperStoreState {
  swiper: SwiperType | null;
  slides: any[];
  setSwiper: (s: SwiperType) => void;
  addSlide: (newSlide: JSX.Element) => void;
  lockNext: () => void;
  unlockNext: () => void;
  goToNext: () => void;
  goToPrev: () => void;
  questionsSanity: QuestionType[],
  getQuestionsFromSanity: () => Promise<void>;
}

export const useSwiperStore = create<SwiperStoreState>((set, get) => ({
  swiper: null,
  slides: [],

  questionsSanity: [],
  getQuestionsFromSanity: async () => { const data = await getQuestionList(); set({ questionsSanity: data }); },


  setSwiper: (swiper) => set({ swiper }),

  addSlide: (newSlide) => set((state) => ({ slides: [...state.slides, newSlide],})),

  lockNext: () => {
    const swiper = get().swiper;
    if (!swiper) return;

    swiper.allowSlideNext = false;
    swiper.allowTouchMove = false;

    swiper.el.querySelector(".swiper-button-next")?.classList.add("pointer-events-none");
  },

  unlockNext: () => {
    const swiper = get().swiper;
    if (!swiper) return;

    swiper.allowSlideNext = true;
    swiper.allowTouchMove = true;

    swiper.el.querySelector(".swiper-button-next")?.classList.remove("pointer-events-none");
  },
  goToNext: () => {
    const swiper = get().swiper;
    if (!swiper) return;
    swiper.slideNext();
  },

  goToPrev: () => {
    const swiper = get().swiper;
    if (!swiper) return;
    swiper.slidePrev();
  },

}));

// Immediately call getQuestionsFromSanity during store initialization
useSwiperStore.getState().getQuestionsFromSanity();