'use client'
import { PropsWithChildren } from "react"
import styles from "./game-menu-content.module.scss";
import { useGameStore } from './../zustand-stores/game-store';

export default function GameMenuContent ({ children }: PropsWithChildren){


  const timer = useGameStore().settings.timer;
  const timerText = timer == 0 ? 'off' : 
                    timer % 60 == 0 ? `${timer/60}m` : `${timer}s`;

  return (

      <>
        <div className={`${styles["namespace-container"]} `}>
          {/* <div className = "question-count" >{useGameStore().answeredCount}</div> */}

            <button className="on-off-button" onClick={() => useGameStore.getState().changeSetting('timer')} >
              <span className="svg-icon svg-icon-timer"></span>
              <span className="text">{timerText}</span>
            </button>

        </div>
      </>
        
  );
};

