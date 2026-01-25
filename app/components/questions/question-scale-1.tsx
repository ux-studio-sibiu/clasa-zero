"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "./question-scale-1.scss";
import Answer from "../answer";

const bk_preffer = ["bk1", "a10", "a4", "a12"];

let palletes = ["palete-blue-teal", "palete-grab-nyt","palete-spring-benefit","palete-happy-aging"]

function generateRandomQuestion() {
  const randomBk = bk_preffer[Math.floor(Math.random() * bk_preffer.length)];
  console.log(randomBk)
  let palleteUsed = palletes[Math.floor(Math.random() * palletes.length)];
  let colors = Array.from({ length: 5 }, (_, index) => `${palleteUsed}-${(index + 1) * 100}`).sort(() => Math.random() - 0.5);
  
  // a + b // c
  let a = Math.floor(Math.random() * 7) + 1;
  let b = Math.floor(Math.random() * 7) + 1;
  let c = Math.floor(Math.random() * 10) + 1;

  let scaleType = Math.floor(Math.random() * 3) + 1;

  let scaleIsCorrect = ((scaleType == 1) && (a + b) == c) ||
                       ((scaleType == 2) && (a + b) < c) ||
                       ((scaleType == 3) && (a + b) > c) ;

const question = [
  {
    scale_cssClass: `scale-${scaleType}`,
    left: [{ n: a, cssClass: `${colors[0]}` }, { n: b, cssClass: `${colors[1]}` }],
    right: { n: c, cssClass: `${colors[2]}` },
  }
]


  const answers = [
    { iconClass: `svg-icon-check`, className: scaleIsCorrect ? "correct-answer" : "wrong-answer" },
    { iconClass: `svg-icon-x`, className: !scaleIsCorrect ? "correct-answer" : "wrong-answer"  },

  ].sort(() => Math.random() - 0.5);

  return { 
    background: `/images/backgrounds/${randomBk}.jpg`,
    question,
    answers,
};
}

export default function Question_Scale_1() {
  const [data] = useState(generateRandomQuestion);

  return (
    <div className={`nsc--question-scale-1 question-container`}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" />
      <div className="question margin-0-auto position-relative ">

        <div className={`container`}>
          
            <div className={`scale-sprite ${data.question[0].scale_cssClass}`}>
              <div className="left-side shape-count-2">
                <div className="shape-container"><div className={`shape svg-icon svg-icon-square text-outline-3 ${data.question[0].left[0].cssClass}`}> {data.question[0].left[0].n}</div></div>
                <div className="shape-container"><div className={`shape svg-icon svg-icon-circle text-outline-3 ${data.question[0].left[1].cssClass}`}> {data.question[0].left[1].n}</div></div>
              </div>

              <div className="right-side shape-count-1">
                <div className="shape-container">
                  <div className={`shape svg-icon svg-icon-pentagon text-outline-3 ${data.question[0].right.cssClass}`}>{data.question[0].right.n}</div>
                </div>
              </div>

            </div>
        </div>
      </div>


      <div className="answers style-2 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer key={i} className={ans.className}> <div className={`svg-icon ${ans.iconClass}`}></div> </Answer>;
        })}
      
      </div>
    </div>
  );
}

