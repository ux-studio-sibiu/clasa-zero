import { create } from "zustand";
import type { Swiper as SwiperType } from "swiper";
import Question_Add from "@/app/components/question-add";
import Question_Sanity from "@/app/components/question-sanity";
import Question_Shape from "@/app/components/question-shape";
import GameEndSlide from "../game-end";
import { useGameStore } from "./game-store";

interface SwiperStoreState {
  swiper: SwiperType | null;
  slides: any[];
  currentSlideIndex?: number;
  onGameEndSlide: boolean;

  setSwiper: (s: SwiperType) => void;
  addSlide: (newSlide?: JSX.Element | null) => void;
  generateSlide: () => JSX.Element;
  addEndSlide: () => void;
  lockNext: () => void;
  unlockNext: () => void;
  goToNext: () => void;
  goToPrev: () => void;
}

export const useSwiperStore = create<SwiperStoreState>((set, get) => ({

  swiper: null,
  slides: [],
  currentSlideIndex:1,
  onGameEndSlide: false,

  setSwiper: (swiper) => {
    set({ swiper });
    swiper.on('slideChange', () => { 
      set({ currentSlideIndex: swiper.activeIndex + 1 });

      // Check the data-end-game-slide attribute on the active slide
      const activeSlide = swiper.slides[swiper.activeIndex];
      
      const cssAttributeOnMain = activeSlide?.querySelector("[data-add-this-attribute-on-main]")?.getAttribute("data-add-this-attribute-on-main");
      const mainElement = document.querySelector("main");
      
      mainElement?.removeAttribute("data-attribute-from-current-slide");
      if (mainElement && cssAttributeOnMain) {mainElement.setAttribute("data-attribute-from-current-slide", cssAttributeOnMain);}

    });
  },

  addSlide: (newSlide = null) => {
    newSlide = newSlide ?? get().generateSlide();
    set((state) => {
      // adds new slide to array
      const updatedSlides = [...state.slides, newSlide];
      
      // Update slides and questionsCount in gameStore
      useGameStore.setState({ questionsCount: updatedSlides.length });
      
      return { slides: updatedSlides };
    });
  },

  addEndSlide: () => {
    var endSlide = <GameEndSlide />;
    set((state) => ({ slides: [...state.slides, endSlide],}));
  },

  generateSlide: () => {return Math.random() < 0.5 ? <Question_Add /> : <Question_Shape />;},
  //generateSlide: () => {return <Question_Shape />},
  //generateSlide: () => {return <Question_Add />},

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