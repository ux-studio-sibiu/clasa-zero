"use client";

import { useState } from "react";
import Image from "next/image";
import "./question-missing-ones.scss";
import Answer from "../answer";

const bk_preffer = ["c1[blue]", "c2[purple]","c3[blue]","c4[yellow]","c5[red]","c6[white]"];
const symbols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function generateRandomQuestion() {
  const randomBk = bk_preffer[Math.floor(Math.random() * bk_preffer.length)];

  const match = randomBk.match(/\[(.*?)\]/);
  const textColor = match ? "text-color-" + match[1] : "";

  const missingObjectsCount = Math.random() < 0.85 ? 1 : 2;
  const allObjects = symbols.sort(() => Math.random() - 0.5)
  const missingObjects = allObjects.slice(0, missingObjectsCount);
  const nonMissingObjects = allObjects.slice(missingObjectsCount);;

  let wrongAnswer1 = [nonMissingObjects[1]]; if (missingObjectsCount == 2) wrongAnswer1.push(missingObjects[0]);
  let wrongAnswer2 = [nonMissingObjects[2]]; if (missingObjectsCount == 2) wrongAnswer2.push(missingObjects[1]);
  let wrongAnswer3 = [nonMissingObjects[3]]; if (missingObjectsCount == 2) wrongAnswer3[0] = missingObjects[1];

  const answers = [
    { text: missingObjects.sort(() => Math.random() - 0.5).join("  "), className: "correct-answer" },
    { text: wrongAnswer1.sort(() => Math.random() - 0.5).join("  "), className: "wrong-answer"  },
    { text: wrongAnswer2.sort(() => Math.random() - 0.5).join("  "), className: "wrong-answer"  },
    { text: wrongAnswer3.sort(() => Math.random() - 0.5).join("  "), className: "wrong-answer"  },
  ].sort(() => Math.random() - 0.5);
  
  return { 
    background: `/images/backgrounds/${randomBk}.jpg`,
    textColor: textColor,
    missingObjects,
    nonMissingObjects,
    answers,
};
}

export default function Question_MissingOnes() {
  const [data] = useState(generateRandomQuestion);
  const cssClass_textColor = data.textColor;
  const cssClass_buttonTextSize = data.missingObjects.length > 1 ? "font-size-50" : "";
  return (
    <div className={`nsc--question-missing-ones question-container`}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" />

      <div className={`question margin-0-auto position-relative ${cssClass_textColor}`}>
        <div className="container">

            {Array.from({ length: 15 }).map((_, index) => {

              const cssClass_scale= "scale-" + (Math.floor(Math.random() * 4) * 10 + 60).toString();
              let number: string = data.nonMissingObjects[index % data.nonMissingObjects.length].toString();
              const cssClass_displayHelper = number == "6" ? "helper" : "";
              
                return (<div key={index} className={`placeholder p${index + 1} ${cssClass_scale} ${cssClass_displayHelper} neon-text`} style={{ transform: `rotate(${index * (360 / 18)}deg)` }}>
                  <span className={`${cssClass_scale}`}>{number}</span>
                </div>)
            })}

          </div>
          <div className="question-text neon-text">Care lipsește?</div>
      </div>

      <div className="answers style-2 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer key={i} className={`${ans.className } font-coiny ${cssClass_buttonTextSize}`}> {ans.text}</Answer>;
        })}
      
      </div>
    </div>
  );
}

