"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./question-add.module.scss";
import { useSwiperStore } from "./zustand-stores/swiper-store";
import { useGameStore } from "./zustand-stores/game-store";
import Answer from "./answer";

function generateRandomQuestion() {
  const randomBk = Math.floor(Math.random() * 53) + 1;
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const correct = a + b;

  const answers = [
    { text: correct, className: "correct-answer" },
    { text: correct + Math.floor(Math.random() * 3) + 1, className: "wrong-answer" },
    { text: correct - (Math.floor(Math.random() * 3) + 1),className: "wrong-answer" },
    { text: correct + Math.floor(Math.random() * 5) + 4,className: "wrong-answer hide-on-0-520" },
  ].sort(() => Math.random() - 0.5);

  return { 
    background: `/images/backgrounds/bk${randomBk}.jpg`,
    answers,
    a,
    b
};
}

export default function Question_Add() {
  const [data] = useState(generateRandomQuestion);
  const [cssClass_answered, set_cssClass_answered] = useState("not-answered")

  const { addSlide, addEndSlide, lockNext, unlockNext, goToNext } = useSwiperStore();
  const { questionsCount, answeredCount, gameLength, gameOver } = useGameStore();

  useEffect(() => {
          if (cssClass_answered !== "not-answered") {
            useGameStore.setState((state) => ({ answeredCount: (state.answeredCount || 0) + 1, }));
          }
        }, [cssClass_answered]);

          
  function continueGame() {
    addSlide();
    unlockNext();
    setTimeout(goToNext, 100);
  }

   function endGame() {
    useGameStore.setState( { gameOver: true });
    addEndSlide();
    unlockNext();
    setTimeout(goToNext, 100);
    
  }


  return (
    <div className={`${styles["namespace-container"]} question-container ${cssClass_answered}`}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" />
      <div style={{color: '#fff', fontSize: '30px'}}> {answeredCount} </div>
      <div className="question margin-0-auto position-relative text-effect-shadow-dance ">{data.a} + {data.b}</div>

      <div className="answers clearfix position-absolute">
        {data.answers.map((ans, i) => {

            return <Answer key={i} text={ans.text.toString()} className={ans.className} 
            onClick={() => {

              if(questionsCount < gameLength && gameLength > 0) {      
                continueGame();
              } else { 
                endGame();
              }

            }}
                  
            />;
          
        })}
      
      </div>
    </div>
  );
}

