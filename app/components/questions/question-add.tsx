"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "./question-add.scss";
import { useGameStore } from "../zustand-stores/game-store";
import Answer from "../answer";
import { useDataStore } from "../zustand-stores/data-store";

let palletes = ["palete-grays","palete-blue-teal", "palete-grab-nyt", "palete-big-machine","palete-spring-benefit","palete-happy-aging"]

function generateRandomQuestion() {
  
  const { getRandomBackground } = useDataStore.getState();
    const randomBk = getRandomBackground([],[]);

  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const correct = a + b;

  let palleteUsed = palletes[Math.floor(Math.random() * palletes.length)];
  let colors = Array.from({ length: 5 }, (_, index) => `${palleteUsed}-${(index + 1) * 100}`).sort(() => Math.random() - 0.5);

  const answers = [
    { text: correct, className: "correct-answer" },
    { text: correct + Math.floor(Math.random() * 3) + 1, className: "wrong-answer" },
    { text: correct - (Math.floor(Math.random() * 3) + 1),className: "wrong-answer" },
    { text: correct + Math.floor(Math.random() * 5) + 4,className: "wrong-answer" },
  ].sort(() => Math.random() - 0.5);

  return { 
    background: `/images/backgrounds/${randomBk}.jpg`,
    colors,
    answers,
    a,
    b
};
}

export default function Question_Add() {
  const [data] = useState(generateRandomQuestion);
  const [cssClass_answered, set_cssClass_answered] = useState("not-answered")

  return (
    <div className={`nsc--question-add question-container ${cssClass_answered}`}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" priority/>
      <div className="question margin-0-auto position-relative text-shadow-5 text-outline-3">
        <>
          <span>{data.a}</span> 
          <span>+</span> 
          <span>{data.b}</span>
        </>
      </div>

      <div className="answers style-2 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer key={i} className={`border-radius-40 ${ans.className}`} >
              <span className="">{ans.text}</span>
            </Answer>;
        })}
      
      </div>
    </div>
  );
}

