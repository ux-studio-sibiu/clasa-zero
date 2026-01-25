"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "./question-count-color.scss";
import Answer from "../answer";

const variants = [{
                    imageName: "balloons-1",
                    backgroundFillColor: "#fdf9f2",
                    answers: [
                      { color: "#e43331", count: 3 },{ color: "#f29339", count: 6 },
                      { color: "#3089cb", count: 7 },{ color: "#8462ad", count: 2 },
                      { color: "#f9c81b", count: 4 },{ color: "#e96489", count: 5 },
                      { color: "#51ae36", count: 6 },]
                  },
                  {
                    imageName: "balloons-2",
                    backgroundFillColor: "#fdfcf8",
                    answers: [
                      { color: "#d82e31", count: 4 },{ color: "#f7821b", count: 4 },
                      { color: "#1a7eca", count: 4 },{ color: "#7d439a", count: 3 },
                      { color: "#e3f91b", count: 5 },{ color: "#f04d8e", count: 4 },
                      { color: "#048e53", count: 4 },]
                  },
                  {
                    imageName: "balloons-3",
                    backgroundFillColor: "#fffbf5",
                    answers: [
                      { color: "#e43331", count: 3 },{ color: "#f29339", count: 5 },
                      { color: "#3089cb", count: 4 },{ color: "#8462ad", count: 3 },
                      { color: "#ffff29", count: 3 },{ color: "#e96489", count: 5 },
                      { color: "#51ae36", count: 5 },]
                  },
                  {
                    imageName: "flowers-1",
                    backgroundFillColor: "#fcfaf8",
                    answers: [
                      { color: "#e43331", count: 2 },{ color: "#f29339", count: 4 },
                      { color: "#3089cb", count: 3 },{ color: "#8462ad", count: 4 },
                      { color: "#ffff29", count: 5 },{ color: "#e96489", count: 2 },
                      { color: "#51ae36", count: 5 },]
                  },
                  {
                    imageName: "flowers-2",
                    backgroundFillColor: "#202731",
                    answers: [
                      { color: "#e43331", count: 3 },{ color: "#f29339", count: 4 },
                      { color: "#3089cb", count: 5 },{ color: "#8462ad", count: 2 },
                      { color: "#ffff29", count: 6 },{ color: "#e96489", count: 3 },
                      { color: "#51ae36", count: 5 },]
                  },
                  {
                    imageName: "cars-1",
                    backgroundFillColor: "#03353f",
                    backgroundImage: "a12",
                    answers: [
                      { color: "#cc3c1a", count: 3 },{ color: "#418820", count: 3 },
                      { color: "#005890", count: 4 },{ color: "#5c448e", count: 3 },
                      { color: "#dcae00", count: 2 },{ color: "#e96489", count: 3 },]
                      
                  },
                  {
                    imageName: "cars-2",
                    backgroundFillColor: "#3d3d3d",
                    backgroundImage: "a12",
                    answers: [
                      { color: "#d31519", count: 5 },{ color: "#e9b10e", count: 2 },
                      { color: "#175292", count: 4 },{ color: "#8462ad", count: 2 },
                      { color: "#e75e0f", count: 2 },{ color: "#db5d80", count: 2 },
                      { color: "#3aa431", count: 3 },{ color: "#028c8f", count: 3 },]
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
    background: randomVariant.backgroundImage ? `/images/backgrounds/${randomVariant.backgroundImage}.jpg` : null,
    question: randomVariant,
    answers,
};
}

export default function Question_CountColor() {
  const [data] = useState(generateRandomQuestion);
  const cssClass_flipImage = Math.random() < 0.5 ? ' flip-x' : '';
  return (
    <div className={`nsc--question-count-color question-container`} style={{ backgroundColor: data.question.backgroundFillColor }}>
      {data.background && <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" />}
      <div className="question margin-0-auto position-relative ">
        <Image src={`/images/questions/count-color/${data.question.imageName}.jpg`} fill sizes="100vw" className={`object-contain${cssClass_flipImage}`} alt="background" />
      </div>

      <div className="answers style-2 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer key={i} className={`border-radius-40 ${ans.className}`}><span className="text-outline-3" style={{ color: ans.textColor }}>{ans.text}</span></Answer>;
        })}
      
      </div>
    </div>
  );
}

