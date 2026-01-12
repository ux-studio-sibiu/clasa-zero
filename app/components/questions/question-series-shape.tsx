"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./question-series-shape.module.scss";
import Answer from "../answer";
import { buildArrayFromSequence, selectUniqueElementsFromArray } from "@/public/lib/utils";
import { useDataStore } from "../zustand-stores/data-store";
import { shapes_svg } from "@/public/lib/colors";

const bk_preffer = ["bk19","bk27","bk34",]
const bk_avoid = ["bk14","bk23", "bk37" ];

const combos = [["bk27", "palete-big-machine", "style-1",],
                ["bk25", "palete-happy-aging", "style-1",]];

let palletes = ["palete-grays","palete-blue-teal", "palete-grab-nyt", "palete-big-machine","palete-spring-benefit","palete-happy-aging"]

const series = [
  { sequence: [1, 2] },
  { sequence: [1, 2, 3] },
  // { sequence: [1, 2, 3, 4] },
  { sequence: [1, 2, 3, 4, 5, 6] },
  // { sequence: [1, 2, 3, 4, 5, 6, 7, 8] },
];

const seriesSize = 18;

function generateRandomQuestion() {

  const { backgrounds } = useDataStore.getState();
  let relevantBackgrounds = backgrounds.filter(bk => !bk_avoid.includes(bk));
  relevantBackgrounds = relevantBackgrounds.concat(bk_preffer).concat(bk_preffer).concat(bk_preffer);
  const randomBk = relevantBackgrounds[Math.floor(Math.random() * relevantBackgrounds.length)];
 
  const randomSeries = series[Math.floor(Math.random() * series.length)];
  const shapes = selectUniqueElementsFromArray(shapes_svg, randomSeries.sequence.length);

  let palleteUsed = palletes[Math.floor(Math.random() * palletes.length)];
  let colors = Array.from({ length: 5 }, (_, index) => `${palleteUsed}-${(index + 1) * 100}`);
  colors.sort(() => Math.random() - 0.5);
  const colorCount = shapes.length < 5 ? shapes.length : shapes.length / 2;
  colors = colors.slice(0, colorCount);

  const shapeArray = buildArrayFromSequence(shapes, seriesSize);
  const colorArray = buildArrayFromSequence(colors, seriesSize);

  const answerIndex = Math.floor(Math.random() * seriesSize);

  const answers = [
    { cssClass: shapeArray[answerIndex] + " " + colorArray[answerIndex], className: "correct-answer" },
    { cssClass: shapeArray[answerIndex + 1] + " " + colorArray[answerIndex + 1], className: "wrong-answer" },
    { cssClass: shapeArray[answerIndex + 1] + " " + colorArray[answerIndex + 2],className: "wrong-answer" },
    { cssClass: shapeArray[answerIndex + 2] + " " + colorArray[answerIndex + 1],className: "wrong-answer" },
  ].sort(() => Math.random() - 0.5);

  return { 
    background: `/images/backgrounds/${randomBk}.jpg`,
    answers,
    shapeArray,
    colorArray,
    answerIndex // used to hide the shape in the series

};
}

export default function Question_Series_Shape() {
  const [data] = useState(generateRandomQuestion);

  return (
    <div className={`${styles["namespace-container"]} question-container`}>
      <Image src={data.background} fill sizes="100vw" className="object-cover" alt="background" />
      <div className="question margin-0-auto position-relative ">

        <div className={`container series-size-${seriesSize} style-1`}>
          
            {data.shapeArray.map((shape, index) => {

              const cssClass_hideSymbol = index == data.answerIndex ? "hide-element" : "";
              return(<div key={index} className={`shape-rotate-container shape-${index + 1}`} style={{ transform: `rotate(${index * (360 / seriesSize)}deg)` }}>

                  <div className={`shape ${cssClass_hideSymbol}`}>
                      <div className={`shape-content svg-icon ${shape} ${data.colorArray[index]}` }></div>
                  </div>

              </div>)

            })}

        </div>
      </div>


      <div className="answers style-2 clearfix position-absolute">
        {data.answers.map((ans, i) => {
            return <Answer key={i} className={ans.className}> <div className={`svg-icon ${ans.cssClass}`}></div> </Answer>;
        })}
      
      </div>
    </div>
  );
}

