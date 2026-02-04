"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "./question-sanity.scss";
import { useSwiperStore } from "../zustand-stores/swiper-store";
import { useDataStore } from "../zustand-stores/data-store";

import type { QuestionType } from "@/types"

function generateRandomQuestion() {


  const { getRandomBackground } = useDataStore.getState();
  const randomBk = getRandomBackground([],[]);

  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const correct = a + b;

  const wrongs = [
    correct + Math.floor(Math.random() * 3) + 1,
    correct - (Math.floor(Math.random() * 3) + 1),
    correct + Math.floor(Math.random() * 5) + 4,
  ];

  const answers = [wrongs[0], correct, wrongs[1], wrongs[2]].sort( () => Math.random() - 0.5);

  return { background: `/images/backgrounds/${randomBk}.jpg`, a, b, answers, correctAnswer: correct };
}


export default function Question_Sanity() {
  
  const [data] = useState(generateRandomQuestion);

  const { addSlide, unlockNext, goToNext } = useSwiperStore();
  const {  questionsSanity } = useDataStore();

  const question : QuestionType = questionsSanity[Math.floor(Math.random() * questionsSanity.length)];

  return (
    <div className={`nsc--question-sanity question-container`}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" priority/>

      <div className="question margin-0-auto position-relative text-effect-shadow-dance ">{question.question}</div>

      <div className="answers style-1 clearfix position-absolute">
        {question.answers.map((ans, i) => (
          <div key={i} className="answer btn btn-primary margin-0-auto" onClick={() => { addSlide(); unlockNext(); setTimeout(goToNext, 100);}}>{ans}</div>
        ))}
      </div>
    </div>
  );
}
