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
  const { slides, setSwiper } = useSwiperStore();
  const preloadSlide = useSwiperStore((state) => state.preloadSlide);
  const { settings:{showCorrectAnswer} } = useGameStore();

  const cssClass_showCorrect = showCorrectAnswer ? ' show-correct-answer' : '';

  useEffect(() => { if (slides.length === 0) {
    (async () => {
      await useDataStore.getState().getQuestionsFromSanity(); 
      await useDataStore.getState().getShapes();
      await useDataStore.getState().getBackgrounds();
      startGame();
    })(); // iife
  }}, [slides]);
 
  return (
    <main className={`nsc--game-page ${cssClass_showCorrect}`}>
      <GameMenu> <GameMenuContent/></GameMenu>
      <GameHud />
        
      <Swiper className="swiper-questions " 
        modules={[Pagination]} 
        pagination={false} 
        // pagination={{ clickable: true }} 
        // navigation={true} 
        slidesPerView={1} 
        onSwiper={(swiper) => { setSwiper(swiper);}}
        >

        {slides.slice(0, -1).map((slide, index) => (
            <SwiperSlide key={index} className="h-100">
              {slide}
            </SwiperSlide>
        ))}

      </Swiper>

      <SwiperSlide  className="h-100 preloaded-slide" >
              {slides[slides.length - 1]}
      </SwiperSlide>
    </main>
  );
}
