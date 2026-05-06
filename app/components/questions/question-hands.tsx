"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "./question-hands.scss";
import Answer from "../answer";
import { useDataStore } from "../zustand-stores/data-store";

const bk_preffer = []
const bk_avoid = []

function generateRandomQuestion() {
  const { getRandomBackground } = useDataStore.getState();
  const randomBk = getRandomBackground([],[]);

  const hand = Math.floor(Math.random() * 2) === 0 ? "hand-left" : "hand-right";

  const answers = [
    { text: "Stânga", className: hand === "hand-left" ? "correct-answer" : "wrong-answer" },
    { text: "Dreapta", className: hand === "hand-right" ? "correct-answer" : "wrong-answer" },
  ].sort(() => Math.random() - 0.5);

  return { 
    background: `/images/backgrounds/${randomBk}.jpg`,
    spriteIndex: Math.floor(Math.random() * 12) + 1,
    handCssClass: hand,
    answers,
};
}

export default function Question_Hands() {
  const [data] = useState(generateRandomQuestion);

  return (
    <div className={`nsc--question-hands question-container`}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" priority/>
      <div className="question margin-0-auto position-relative ">      
        <div  className={`sprite sprite-hands ${data.handCssClass} hand-${data.spriteIndex} margin-0-auto` } ></div>  
      </div>


      <div className="answers style-2 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer text = {ans.text }key={i} className={ans.className}> </Answer>;
        })}
      
      </div>
    </div>
  );
}

