"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./question-add.module.scss";
import { useSwiperStore } from "../(pages)/game/swiper-store";

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

  const { addSlide, lockNext, unlockNext, goToNext } = useSwiperStore();

  return (
    <div className={styles["namespace-container"]}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" />

      <div className="question margin-0-auto position-relative text-effect-shadow-dance ">{data.a} + {data.b}</div>

      <div className="answers clearfix position-absolute">
        {data.answers.map((ans, i) => {
          return (
            <div key={i} className={`answer button style-2 margin-0-auto ${ans.className}`} onClick={() => { addSlide(); unlockNext(); setTimeout(goToNext, 100); }}>
                {ans.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
