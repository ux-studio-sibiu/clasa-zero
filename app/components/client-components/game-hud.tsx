'use client'

import { useGameStore } from "../zustand-stores/game-store";
import { useSwiperStore } from "../zustand-stores/swiper-store";
import styles from "./game-hud.module.scss";

export default function GameHud (){



  return (

        <div className={`${styles["namespace-container"]}`} >
          <div className="game-hud">
            {/* <div>Questions: {useGameStore().questionsCount}</div>
            <div>Current slide: {useSwiperStore().currentSlideIndex}</div> */}
            <div className="question-number color-1" data-question-number={useSwiperStore().currentSlideIndex}>
              <div className="svg-icon svg-icon-splash background-svg"></div>
            </div>

            <div className="lives color-1" data-lives-count={useGameStore().lives}>
              <div className="svg-icon svg-icon-heart heart-svg"></div>
            </div>

          </div>
        </div> 
 
  );
};

