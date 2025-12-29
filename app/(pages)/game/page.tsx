// game/page.tsx

"use client";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";

import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import GameMenu from '@/app/components/client-components/game-menu';
import { useSwiperStore } from "../../components/zustand-stores/swiper-store";
import { useDataStore } from "../../components/zustand-stores/data-store";
import GameMenuContent from '@/app/components/client-components/game-menu-content';
import GameHud from '@/app/components/client-components/game-hud';
import { useGameStore } from '@/app/components/zustand-stores/game-store';
// ------------------------------------------------------------------------

export default function Game() {
  const { slides, addSlide, setSwiper, lockNext } = useSwiperStore();
  const { gameOver } = useGameStore();

  useEffect(() => { if (slides.length === 0) {
    (async () => {
      await useDataStore.getState().getQuestionsFromSanity(); 
      await useDataStore.getState().getShapes(); 
      addSlide();
    })(); // iife
  }}, [slides]);
 
  return (
    <main className={`${styles["namespace-container"]}`}>
      <GameMenu> <GameMenuContent/></GameMenu>
      <GameHud />
        
      <Swiper className="swiper-questions " 
        modules={[Pagination, Navigation]} 
        pagination={{ clickable: true }} 
        navigation={true} 
        slidesPerView={1} 
        onSwiper={(swiper) => { setSwiper(swiper); lockNext();}}
        >

        {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-100">
              {slide}
            </SwiperSlide>))}

      </Swiper>
    </main>
  );
}
