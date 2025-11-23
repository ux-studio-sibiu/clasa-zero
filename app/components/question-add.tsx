"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./question-add.module.scss";
import { useSwiperStore } from "../(pages)/game/swiper-store";
import Question_Sanity from "./question-sanity";

function generateRandomQuestion() {
  const randomBk = Math.floor(Math.random() * 53) + 1;
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const correct = a + b;

  const wrongs = [
    correct + Math.floor(Math.random() * 3) + 1,
    correct - (Math.floor(Math.random() * 3) + 1),
    correct + Math.floor(Math.random() * 5) + 4,
  ];

  const answers = [wrongs[0], correct, wrongs[1], wrongs[2]].sort( () => Math.random() - 0.5);

  return { background: `/images/backgrounds/bk${randomBk}.jpg`, a, b, answers, correctAnswer: correct };
}


export default function Question_Add() {
  
  const [data] = useState(generateRandomQuestion);

  const { addSlide, lockNext, unlockNext, goToNext } = useSwiperStore();

  return (
    <div className={styles["namespace-container"]}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" />

      <div className="question margin-0-auto position-relative text-effect-shadow-dance ">{data.a} + {data.b}</div>

      <div className="answers clearfix position-absolute">
        {data.answers.map((ans, i) => (
          <div key={i} className="answer btn btn-primary margin-0-auto" onClick={() => { const newSlide = Math.random() < 0.5 ? <Question_Add /> : <Question_Sanity />; addSlide(newSlide); unlockNext(); setTimeout(goToNext, 100);}}>{ans}</div>
        ))}
      </div>
    </div>
  );
}
