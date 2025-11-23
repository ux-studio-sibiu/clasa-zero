// game/page.tsx

"use client";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";

import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import Question_Add from "../../components/question-add";
import { useSwiperStore } from "./swiper-store";
import Question_Sanity from '@/app/components/question-sanity';
// ------------------------------------------------------------------------

export default function Game() {
  const swiperRef = useRef<SwiperType | null>(null);
  const { slides, addSlide, setSwiper, lockNext } = useSwiperStore();
 

  useEffect(() => { if (slides.length === 0) {
    const newSlide = Math.random() < 0.5 ? <Question_Add /> : <Question_Sanity />;
    addSlide(newSlide);
  }}, [slides]);
 
  return (
    <main className={`${styles["namespace-container"]}`}>
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
