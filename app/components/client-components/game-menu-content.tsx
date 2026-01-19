'use client'
import { PropsWithChildren } from "react"
import styles from "./game-menu-content.module.scss";
import { useGameStore } from './../zustand-stores/game-store';

export default function GameMenuContent ({ children }: PropsWithChildren){

  const settings = useGameStore().settings;
  const text_timer = settings.timer == 0 ? 'off' : 
                    settings.timer % 60 == 0 ? `${settings.timer/60}m` : `${settings.timer}s`;
  const text_showCorrectAnswer = settings.showCorrectAnswer ? 'on' : "off";

  return (

      <>
        <div className={`${styles["namespace-container"]} `}>

            <button className="on-off-button" onClick={() => useGameStore.getState().changeSetting('timer')} >
              <span className="svg-icon svg-icon-timer"></span>
              <span className="text">{text_timer}</span>
            </button>

            <button className="on-off-button" onClick={() => useGameStore.getState().changeSetting('showCorrectAnswer')} >
              <span className="">show correct</span>
              <span className="text">{text_showCorrectAnswer}</span>
            </button>


            <button className="on-off-button clear-both" onClick={() => useGameStore.getState().changeSetting('questionWeight_Add')} >
              <span className="">Add</span>
              <span className="text">{settings.questionWeight_Add}</span>
            </button>

              <button className="on-off-button" onClick={() => useGameStore.getState().changeSetting('questionWeight_CountColor')} >
              <span className="">Count Color</span>
              <span className="text">{settings.questionWeight_CountColor}</span>
            </button>
    
            <button className="on-off-button" onClick={() => useGameStore.getState().changeSetting('questionWeight_Pairs')} >
              <span className="">Pairs</span>
              <span className="text">{settings.questionWeight_Pairs}</span>
            </button>



             <button className="on-off-button clear-both" onClick={() => useGameStore.getState().changeSetting('questionWeight_Question_Sanity')} >
              <span className="">Sanity</span>
              <span className="text">{settings.questionWeight_Question_Sanity}</span>
            </button>

              <button className="on-off-button" onClick={() => useGameStore.getState().changeSetting('questionWeight_Question_Scale_1')} >
              <span className="">Scale 1</span>
              <span className="text">{settings.questionWeight_Question_Scale_1}</span>
            </button>

            <button className="on-off-button" onClick={() => useGameStore.getState().changeSetting('questionWeight_Question_Series_Shape')} >
              <span className="">Series Shape</span>
              <span className="text">{settings.questionWeight_Question_Series_Shape}</span>
            </button>



            <button className="on-off-button clear-both" onClick={() => useGameStore.getState().changeSetting('questionWeight_Question_Series')} >
              <span className="">Series</span>
              <span className="text">{settings.questionWeight_Question_Series}</span>
            </button>

              <button className="on-off-button" onClick={() => useGameStore.getState().changeSetting('questionWeight_Question_Shape')} >
              <span className="">Shape</span>
              <span className="text">{settings.questionWeight_Question_Shape}</span>
            </button>

            <button className="on-off-button" onClick={() => useGameStore.getState().changeSetting('questionWeight_Question_Weekdays')} >
              <span className="">Weekdays</span>
              <span className="text">{settings.questionWeight_Question_Weekdays}</span>
            </button>
            
            

        </div>
      </>
        
  );
};

