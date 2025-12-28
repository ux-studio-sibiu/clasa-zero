"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./question-shape.module.scss";
import { useSwiperStore } from "./zustand-stores/swiper-store";
import { useDataStore } from "./zustand-stores/data-store";
import { randomColor, randomShape, randomColorName, randomShapeName } from "@/public/lib/colors";
import { RandomizeArray} from "@/public/lib/utils";
import Answer from "./answer";

function generateData() {
  
  // Make background 13 - 20x more likely to be picked
  const weights = Array(53).fill(1);
  weights[1-1] = 30; 
  weights[2-1] = 30;
  weights[13-1] = 20; // index 12 corresponds to bk 13
  weights[15-1] = 30; 

  // Create a weighted array of background indices
  const weightedIndices = weights.flatMap((weight, idx) => Array(weight).fill(idx + 1));

  const randomBk = weightedIndices[Math.floor(Math.random() * weightedIndices.length)];
  const randomBk2 = Math.floor(Math.random() * 53) + 1;

  const shapes = useDataStore.getState().shapesList;
  const randomShapeUrl = shapes[Math.floor(Math.random() * shapes.length)];

  const color = randomColor();
  const darkShade = color.value.darkShades[Math.floor(Math.random() * color.value.darkShades.length)];
  const lightShade = color.value.lightShades[Math.floor(Math.random() * color.value.lightShades.length)];
  const shape = randomShape();

  const correctShapeName = shape.value.string;
  const correctColorName = shape.value.gender == "f" ? color.value.stringF : color.value.stringM;

  const answers = [
    { text: correctShapeName + " " + correctColorName, className: "correct-answer" },
    { text: correctShapeName + " " + randomColorName(shape.value.gender, [color.key]), className: "wrong-answer " },
    { text: randomShapeName([shape.key]) + " " + correctColorName, className: "wrong-answer" },
    { text: randomShapeName([shape.key]) + " " + randomColorName(shape.value.gender, [color.key]), className: "wrong-answer hide-on-0-520" },
  ];  

  return {
     backgroundUrl: `/images/backgrounds/bk${randomBk}.jpg`,
     backgroundUrl2: `/images/backgrounds/bk${randomBk2}.jpg`, 
     randomColor: darkShade,
     shape: `/images/shapes/${shape.value.file}`,
     shapeCssClass: `size-${Math.floor(Math.random() * 3) + 1}`,
     answers : answers,
  };
}

export default function Question_Shape() {

  const { addSlide, unlockNext, goToNext } = useSwiperStore();
  const {  shapesList } = useDataStore();
  

  const [data] = useState(generateData);

  return (
    <div className={styles["namespace-container"] + ` question-container`}>
      <Image src={data.backgroundUrl} fill sizes="100vw" className="object-cover" alt="background" />

      <div
        className={`shape ${data.shapeCssClass}`}
        style={{
          WebkitMaskImage: `url(${data.shape})`, maskImage: `url(${data.shape})`,
          // background: `url(${data.backgroundUrl2}) center/cover no-repeat`,
          background: data.randomColor,

        }}
      />

      <div className="question margin-0-auto position-relative text-effect-shadow-dance "></div>

      <div className="answers clearfix position-absolute">
        {data.answers.map((ans, i) => 
          <Answer key={i} text={ans.text} className={ans.className} 
          onClick={() => { addSlide(); unlockNext(); setTimeout(goToNext, 100); }} />)
        }
      </div>
    </div>
  );
}
