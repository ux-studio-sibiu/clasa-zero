import React, { useState } from "react";
import useFitText from "use-fit-text";
// import { useSwiperStore } from "./zustand-stores/swiper-store";
// import { useGameStore } from "./zustand-stores/game-store";


  // const { addSlide, addEndSlide, unlockNext, goToNext } = useSwiperStore();
  // const { questionsCount, answeredCount, gameLength, gameOver } = useGameStore();

  // function continueGame() {
  //   addSlide();
  //   unlockNext();
  //   setTimeout(goToNext, 100);
  // }

  //  function endGame() {
  //   useGameStore.setState( { gameOver: true });
  //   addEndSlide();
  //   unlockNext();
  //   setTimeout(goToNext, 100);
    
  // }


export default function Answer({ text, className, isDisabled = false, onClick = () => {} }: { text: string; className: string; isDisabled?: boolean; onClick?: () => void }) {
  
  const { fontSize, ref: innerTextRef } = useFitText({ minFontSize: 100, maxFontSize: 200, });

  const [disabled, setDisabled] = useState(isDisabled);
  const isCorrectAnswer = className.toLowerCase().includes("correct-answer");

  var cssClass_disabled :string = disabled ? "disabled " : "";

  return (
    <div className={`answer button style-2 margin-0-auto ${className} ${cssClass_disabled}`} 
      onClick={(e) => {
        onClick(); 
        setDisabled(true);

        // if(questionsCount < gameLength && gameLength > 0) {      
        //   continueGame();
        // } else { 
        //   endGame();
        // }

      }}
      ref={innerTextRef} 
      style={{ fontSize }}>
      {text}

      <div className="answer-icon answer-icon-correct svg-icon-ok"></div>
      <div className="answer-icon answer-icon-wrong svg-icon-cancel"></div>
    </div>
  );
}
