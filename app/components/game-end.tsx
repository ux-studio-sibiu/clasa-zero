"use client";

import Image from "next/image";
import styles from "./game-end.module.scss";
import { useSwiperStore } from "./zustand-stores/swiper-store";
import { useGameStore } from "./zustand-stores/game-store";


export default function GameEndSlide() {

  const { answeredCount, gameLength } = useGameStore();

  return (
    <div className={`${styles["namespace-container"]} `}>

      <div style={{color: '#fff', fontSize: '30px'}}> GAME OVER: {answeredCount} </div>
 
    </div>

  );
}
