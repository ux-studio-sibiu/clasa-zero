// game/page.tsx

"use client";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useCallback, useEffect, useRef, useState } from "react";
import "./page.scss";

import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import GameMenu from '@/app/components/client-components/game-menu';
import { useSwiperStore } from "../../components/zustand-stores/swiper-store";
import { useDataStore } from "../../components/zustand-stores/data-store";
import GameMenuContent from '@/app/components/client-components/game-menu-content';
import GameHud from '@/app/components/client-components/game-hud';
import { useGameStore } from '@/app/components/zustand-stores/game-store';
import { startGame } from '@/app/utils/game-controller';
// ------------------------------------------------------------------------

export default function Game() {
  const { slides, currentSlideIndex, setSwiper } = useSwiperStore();
  const { settings:{showCorrectAnswer} } = useGameStore();
  const [isLastUnlocked, setIsLastUnlocked] = useState(true);
  const [isMoving, setMoving] = useState(false);

  // lock last slide - which is used only for preloading
  useEffect(() => { setIsLastUnlocked((currentSlideIndex ?? 0) < slides.length - 1); }, [currentSlideIndex, slides]);

  // start of the game
  useEffect(() => { if (slides.length === 0) {
    (async () => {
      await useDataStore.getState().getQuestionsFromSanity(); 
      await useDataStore.getState().getShapes();
      await useDataStore.getState().getBackgrounds();
      startGame();

    })(); // iife
  }}, [slides]);
 
  
  const cssClass_isMoving = isMoving ? 'swiper-is-moving' : '';
  const cssClass_showCorrect = showCorrectAnswer ? ' show-correct-answer' : '';

  return (
    <main className={`nsc--game-page ${cssClass_showCorrect}`}>
      <GameMenu> <GameMenuContent/></GameMenu>
      <GameHud />
        
      <Swiper className={`swiper-questions ${cssClass_isMoving}`}
        modules={[Pagination]} 
        pagination={false} 
        slidesPerView={1} 
        onSwiper={(swiper) => { setSwiper(swiper);}}
        onSlideChangeTransitionStart={() => setMoving(true)}
        onSlideChangeTransitionEnd={() => setMoving(false)}


        resistance={true}
        resistanceRatio={0.85} // keeps elastic feel
        allowSlideNext={isLastUnlocked}
        allowSlidePrev={true}
        preventInteractionOnTransition={true}
        watchOverflow={false}

        // onReachEnd={(swiper) => {
        //   // Safety: prevent programmatic advance
        //   if (!isLastUnlocked) {
        //     swiper.slideTo(swiper.slides.length - 2)
        //   }
        // }}

        >

        {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-100">
              {slide}
            </SwiperSlide>
        ))}

      </Swiper>

    </main>
  );
}
