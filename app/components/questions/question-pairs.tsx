"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./question-pairs.module.scss";
import Answer from "../answer";
import { buildArrayFromSequence, selectUniqueElementsFromArray } from "@/public/lib/utils";

const bk_preffer = ["bk-28","bk-28",]
const bk_avoid = ["bk-37",]

const images = ["sprite-socks", "sprite-mittens"];

function generateRandomQuestion() {
  const randomBk = Math.floor(Math.random() * 53) + 1;

  const oneSockArray = selectUniqueElementsFromArray(Array.from({ length: 24 }, (_, i) => "sock-" + (i + 1)), 5); // select 5 unique socks from 1 to 24
  let sockArray = [...oneSockArray, ...oneSockArray]; // this aray has 2 socks of each
  const correctAnswer = sockArray[0]; // single sock
  const wrongAnswers = selectUniqueElementsFromArray(sockArray, 3, [correctAnswer]); // select 3 unique socks excluding the correct answer
  sockArray = sockArray.slice(1).sort(() => Math.random() - 0.5); // remove the first sock from the array // and randomize
  
  const answers = [
    { cssClass: correctAnswer, className: "correct-answer" },
    { cssClass: wrongAnswers[0], className: "wrong-answer" },
    { cssClass: wrongAnswers[1], className: "wrong-answer" },
    { cssClass: wrongAnswers[2], className: "wrong-answer" },
  ].sort(() => Math.random() - 0.5);

  return { 
    background: `/images/backgrounds/bk${randomBk}.jpg`,
    imageSprite: images[Math.floor(Math.random() * images.length)],
    sockArray,
    answers,
};
}

export default function Question_Pairs() {
  const [data] = useState(generateRandomQuestion);

  return (
    <div className={`${styles["namespace-container"]} question-container`}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" />
      <div className="question margin-0-auto position-relative ">

        <div className={`container series-size-9`}>
          
            {data.sockArray.map((sockName, index) => {

              const cssClass_flip = index % 2 === 1 ? "flip-x" : "";
              return(
              <div key={index} className="shape-container">
                <div  className={`shape shape-${index + 1} sprite ${data.imageSprite} ${sockName} ${cssClass_flip}` } ></div>
              </div>
              );
            })}

        </div>

        <div className="question-text">FĂRĂ PERECHE ?</div>
      </div>


      <div className="answers style-2 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer key={i} className={ans.className}> <div className={`sprite ${data.imageSprite} ${ans.cssClass} margin-0-auto`}></div> </Answer>;
        })}
      
      </div>
    </div>
  );
}

