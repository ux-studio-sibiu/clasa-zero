"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./question-series.module.scss";
import { useGameStore } from "../zustand-stores/game-store";
import Answer from "../answer";

const series = [
  { sequence: [1, 1, 1, 1, 1, 1], maxSeriesLength: 3, maxStartNumber: 3 },
  { sequence: [2, 2, 2, 2, 2, 2], maxSeriesLength: 3, maxStartNumber: 3 },
  { sequence: [1, 2, 3, 4, 5, 6], maxSeriesLength: 3, maxStartNumber: 3 },
  { sequence: [8, 7, 6, 5, 4, 3], maxSeriesLength: 3, maxStartNumber: 3 },
  { sequence: [0, 2, 4, 6, 8, 10], maxSeriesLength: 3, maxStartNumber: 3 },
  { sequence: [10, 8, 6, 4, 2, 0], maxSeriesLength: 3, maxStartNumber: 3 },
  { sequence: [4, 5, 4, 5, 4, 5], maxSeriesLength: 4, maxStartNumber: 5 },
  { sequence: [4, 7, 4, 7, 4, 7], maxSeriesLength: 4, maxStartNumber: 4 },
];


function generateRandomQuestion() {
  const randomBk = Math.floor(Math.random() * 53) + 1;

  const randomSeries = series[Math.floor(Math.random() * series.length)];
  const randomStartNumber = randomSeries.maxStartNumber ? (Math.floor(Math.random() * randomSeries.maxStartNumber) + 1) : 0; // 0-3

  const seriesText = randomSeries.sequence
    .map((num: number) => randomStartNumber + num)
    .slice(0, randomSeries.maxSeriesLength)
    .join(" ") + " ...";
  const correctAnswer = randomStartNumber + randomSeries.sequence[randomSeries.maxSeriesLength];


  const answers = [
    { text: correctAnswer, className: "correct-answer" },
    { text: correctAnswer + Math.floor(Math.random() * 3) + 1, className: "wrong-answer" },
    { text: correctAnswer - (Math.floor(Math.random() * 3) + 1),className: "wrong-answer" },
    { text: correctAnswer + Math.floor(Math.random() * 5) + 4,className: "wrong-answer hide-on-0-520" },
  ].sort(() => Math.random() - 0.5);

  return { 
    background: `/images/backgrounds/bk${randomBk}.jpg`,
    answers,
    seriesText
};
}

export default function Question_Series() {
  const [data] = useState(generateRandomQuestion);

  return (
    <div className={`${styles["namespace-container"]} question-container`}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" />
      <div className="question margin-0-auto position-relative text-effect-shadow-dance-1 ">{data.seriesText}</div>

      <div className="answers style-1 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer key={i} text={ans.text.toString()} className={ans.className}  />;
        })}
      
      </div>
    </div>
  );
}

