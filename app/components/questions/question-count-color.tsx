"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./question-count-color.module.scss";
import Answer from "../answer";
import { buildArrayFromSequence, selectUniqueElementsFromArray } from "@/public/lib/utils";

const variants = [{
                    imageName: "balloons-1",
                    backgroundFillColor: "#fdf9f2",
                    answers: [
                      { color: "#e43331", count: 3 },
                      { color: "#f29339", count: 6 },
                      { color: "#3089cb", count: 7 },
                      { color: "#8462ad", count: 2 },
                      { color: "#f9c81b", count: 4 },
                      { color: "#e96489", count: 5 },
                      { color: "#51ae36", count: 6 },]
                  },
                  {
                    imageName: "balloons-2",
                    backgroundFillColor: "#fdfcf8",
                    answers: [
                      { color: "#e43331", count: 4 },
                      { color: "#f29339", count: 4 },
                      { color: "#3089cb", count: 4 },
                      { color: "#8462ad", count: 3 },
                      { color: "#e3f91b", count: 5 },
                      { color: "#e96489", count: 4 },
                      { color: "#51ae36", count: 4 },]
                  },
                  {
                    imageName: "balloons-3",
                    backgroundFillColor: "#fffbf5",
                    answers: [
                      { color: "#e43331", count: 3 },
                      { color: "#f29339", count: 5 },
                      { color: "#3089cb", count: 4 },
                      { color: "#8462ad", count: 3 },
                      { color: "#ffff29", count: 3 },
                      { color: "#e96489", count: 5 },
                      { color: "#51ae36", count: 5 },]
                  }];


function generateRandomQuestion() {
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];
  const correctAnswer = randomVariant.answers[Math.floor(Math.random() * randomVariant.answers.length)];

  const answers = [
    { text: correctAnswer.count, textColor: correctAnswer.color ,className: "correct-answer" },
    { text: correctAnswer.count - 1, textColor: correctAnswer.color, className: "wrong-answer" },
    { text: correctAnswer.count + 1, textColor: correctAnswer.color, className: "wrong-answer" },
    { text: correctAnswer.count + 2, textColor: correctAnswer.color, className: "wrong-answer" },

  ].sort(() => Math.random() - 0.5);

  return { 
    question: randomVariant,
    answers,
};
}

export default function Question_CountColor() {
  const [data] = useState(generateRandomQuestion);

  return (
    <div className={`${styles["namespace-container"]} question-container`} style={{ backgroundColor: data.question.backgroundFillColor }}>
      
      <div className="question margin-0-auto position-relative ">
        <Image src={`/images/questions/count-color/${data.question.imageName}.jpg`} fill sizes="100vw" className="object-contain" alt="background" />
      </div>

      <div className="answers style-2 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer key={i} className={`border-radius-40 ${ans.className}`}><span className="text-outline-3" style={{ color: ans.textColor }}>{ans.text}</span></Answer>;
        })}
      
      </div>
    </div>
  );
}

