'use client'
import { PropsWithChildren } from "react"
import styles from "./game-menu-content.module.scss";
import { useGameStore } from './../zustand-stores/game-store';

export default function GameMenuContent ({ children }: PropsWithChildren){

  return (

      <>
        <div className={`${styles["namespace-container"]} `}>
          <div className = "question-count" >{useGameStore().answeredCount}</div>
        </div>
      </>
        
  );
};

