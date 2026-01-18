"use client";

import { useState } from "react";
import styles from "./question-weekdays.module.scss";
import Answer from "../answer";
import { useDataStore } from "../zustand-stores/data-store";
import { allPalletes } from "@/public/lib/colors";
// import Brush from "../svg/brush.svg";
import BrushSquare from "../svg/BrushSquare.svg";



const bk_preffer = ["bk2"];
const bk_avoid = ["bk10"];

let palletes = allPalletes;
const weekdays = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

const questions = [
  {f :"Astăzi e", q : "Ce a fost ieri?", diff : -1},
  // {f :"Astăzi e", q : "Ce a fost alaltăieri?", diff : -2},
  {f :"Astăzi e", q : "Ce va fi poimâine?", diff : 2},

  {f :"Mâine e", q : "Ce a fost ieri?", diff : -2},
  {f :"Mâine e", q : "Ce este azi?", diff : -1},
  {f :"Mâine e", q : "Ce va fi poimâine ?", diff : 1},

  {f :"Ieri a fost", q : "Ce va fi maine?", diff : 2},
  {f :"Ieri a fost", q : "Ce este azi?", diff : 1},
  // {f :"Ieri a fost", q : "Ce a fost alaltăieri?", diff : -1},

  // {f :"Poimâine va fi", q : "Ce a fost ieri?", diff : -3},
  // {f :"Poimâine va fi", q : "Ce este azi?", diff : -1},
  
];


function generateRandomQuestion() {
  const { getRandomBackground } = useDataStore.getState();
  const randomBk = getRandomBackground(bk_preffer, bk_avoid);

  let palleteUsed = palletes[Math.floor(Math.random() * palletes.length)];
  let colors = Array.from({ length: 5 }, (_, index) => `${palleteUsed}-${(index + 1) * 100}`).sort(() => Math.random() - 0.5);
  

const questionData = questions[Math.floor(Math.random() * questions.length)];
const dayIndex = Math.floor(Math.random() * weekdays.length);
const dayInText = weekdays[dayIndex];

const correctIndex = (dayIndex + questionData.diff + 7) % 7;
const question = { f : questionData.f, d: dayInText + ".", q : questionData.q };

  const answers = [
    { text: weekdays[correctIndex], className: "correct-answer" },
    { text: weekdays[(correctIndex + 3 + 7) % 7], className: "wrong-answer"  },
    { text: weekdays[(correctIndex - 3 + 7) % 7], className: "wrong-answer"  },
  ].sort(() => Math.random() - 0.5);
  return { 
    background: `/images/backgrounds/${randomBk}.jpg`,
    colors,
    question,
    answers,
};
}

export default function Question_Weekdays() {
  const [data] = useState(generateRandomQuestion);

  return (
    <div className={`${styles["namespace-container"]} question-container ${data.colors[4]}`}>
      <div className="question margin-0-auto position-relative ">
        <span className={`f text-outline-2 text-shadow-3 ${data.colors[1]}`}>{data.question.f}</span><br/>
        <span className={`d text-outline-2 text-shadow-3 ${data.colors[2]}`}>{data.question.d}</span><br/>
        <span className={`q text-outline-2 text-shadow-3 ${data.colors[3]}`}>{data.question.q}</span>
      </div>

      <div className="answers style-3 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer key={i} text={ans.text} className={ans.className}> </Answer>;
        })}
      
      </div>
    </div>
  );
}

