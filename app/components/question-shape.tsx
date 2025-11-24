"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./question-shape.module.scss";
import { useSwiperStore } from "../(pages)/game/swiper-store";
import { useDataStore } from "./data-store";
import { DARK_COLORS, randomColor } from "@/public/lib/colors";

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

  const answers = ["vacă roz", "câine roșu", "câine roz", "vacă mov"];

  const shapes = useDataStore.getState().shapesList;
  const randomShapeUrl = shapes[Math.floor(Math.random() * shapes.length)];

  return {
     backgroundUrl: `/images/backgrounds/bk${randomBk}.jpg`,
     backgroundUrl2: `/images/backgrounds/bk${randomBk2}.jpg`, 
     randomColor: randomColor(DARK_COLORS),
     shape:randomShapeUrl, 
     shapeCssClass: `size-${Math.floor(Math.random() * 3) + 1}`,
     answers : answers  };
}

export default function Question_Shape() {

  const { addSlide, unlockNext, goToNext } = useSwiperStore();
  const {  shapesList } = useDataStore();
  

  const [data] = useState(generateData);

  return (
    <div className={styles["namespace-container"]}>
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
        {data.answers.map((ans, i) => (
          <div key={i} className="answer btn btn-primary margin-0-auto" onClick={() => { addSlide(); unlockNext(); setTimeout(goToNext, 100);}}>{ans}</div>
        ))}
      </div>
    </div>
  );
}
