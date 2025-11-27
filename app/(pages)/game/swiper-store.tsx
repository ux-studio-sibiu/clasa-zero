// game/swiper-store.tsx

import { create } from "zustand";
import type { Swiper as SwiperType } from "swiper";
import Question_Add from "@/app/components/question-add";
import Question_Sanity from "@/app/components/question-sanity";
import Question_Shape from "@/app/components/question-shape";

interface SwiperStoreState {
  swiper: SwiperType | null;
  slides: any[];
  setSwiper: (s: SwiperType) => void;
  addSlide: (newSlide?: JSX.Element | null) => void;
  generateSlide: () => JSX.Element;
  lockNext: () => void;
  unlockNext: () => void;
  goToNext: () => void;
  goToPrev: () => void;
}

export const useSwiperStore = create<SwiperStoreState>((set, get) => ({
  swiper: null,
  slides: [],

  setSwiper: (swiper) => set({ swiper }),

  addSlide: (newSlide = null) => {
    // If no slide is provided, generate one randomly
    newSlide = newSlide ?? get().generateSlide();
    set((state) => ({ slides: [...state.slides, newSlide],}))
  },

  generateSlide: () => {return Math.random() < 0.5 ? <Question_Add /> : <Question_Shape />;},

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