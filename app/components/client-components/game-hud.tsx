'use client'

import { useGameTimer } from "@/app/utils/useGameTimer";
import { useGameStore } from "../zustand-stores/game-store";
import { useSwiperStore } from "../zustand-stores/swiper-store";
import styles from "./game-hud.module.scss";

export default function GameHud (){

  const remainingTime = useGameTimer(true);

  return (

        <div className={`${styles["namespace-container"]}`} >
          <div className="game-hud">
            {/* <div>Questions: {useGameStore().questionsCount}</div>
            <div>Current slide: {useSwiperStore().currentSlideIndex}</div> */}
            <div className="question-number color-1" data-question-number={useSwiperStore().currentSlideIndex}>
              <div className="svg-icon svg-icon-splash background-svg"></div>
              <div className="svg-icon svg-icon-splash background-svg-shadow"></div>
            </div>

            {/* <div className="lives color-1" data-lives-count={useGameStore().lives}>
              <div className="svg-icon svg-icon-heart heart-svg"></div>
            </div> */}

            {remainingTime !== 0 && <div className="timer">{remainingTime}</div>}

          </div>
        </div> 
 
  );
};

