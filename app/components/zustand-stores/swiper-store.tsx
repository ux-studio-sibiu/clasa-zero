import { create } from "zustand";
import type { Swiper as SwiperType } from "swiper";
import Question_Add from "@/app/components/questions/question-add";
import Question_Sanity from "@/app/components/questions/question-sanity";
import Question_Shape from "@/app/components/questions/question-shape";
import GameEndSlide from "../game-end";
import { useGameStore } from "./game-store";
import Question_Series from "../questions/question-series";
import Question_Series_Shape from "../questions/question-series-shape";
import Question_Pairs from "../questions/question-pairs";
import Question_Scale_1 from "../questions/question-scale-1";
import Question_CountColor from "../questions/question-count-color";
import Question_Weekdays from "../questions/question-weekdays";

interface SwiperStoreState {
  swiper: SwiperType | null;
  slides: any[];
  currentSlideIndex?: number;
  onGameEndSlide: boolean;
  preloadSlide: JSX.Element | null;

  setSwiper: (s: SwiperType) => void;
  addPreloadSlide: (slide?: JSX.Element | null) => void;
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
  preloadSlide: null,

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

  addPreloadSlide: (slide = null) => { set({ preloadSlide: get().generateSlide() });},

  addSlide: (newSlide = null) => {

    // use preload slide if available
    let preloadedSlide = get().preloadSlide;
    newSlide = newSlide ?? preloadedSlide ?? get().generateSlide();

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
    set((state) => ({ slides: [...state.slides, endSlide] }));
  },

  generateSlide: () => {
    const slideType = [
    { component: <Question_Add />, weight: 15 },
    { component: <Question_Shape />, weight: 15 },
    { component: <Question_Series />, weight: 15 },
    { component: <Question_Series_Shape />, weight: 30 },
    { component: <Question_Pairs />, weight: 20 },
    { component: <Question_Scale_1 />, weight: 20 },
    { component: <Question_CountColor />, weight: 20 },
    { component: <Question_Weekdays />, weight: 20 },
    ];

    const totalWeight = slideType.reduce((sum, slide) => sum + slide.weight, 0);
    const randomWeight = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    for (const slide of slideType) {
    cumulativeWeight += slide.weight;
    if (randomWeight <= cumulativeWeight) { return slide.component; }
    }

    return slideType[0].component; // Fallback in case of an error
  },

  lockNext: () => { 
    const swiper = get().swiper;
    if (!swiper) return;
    swiper.el.querySelector(".swiper-button-next")?.classList.add("pointer-events-none");
  },

  unlockNext: () => {
    const swiper = get().swiper;
    if (!swiper) return;

    swiper.allowSlideNext = true;
    // swiper.allowTouchMove = true;

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