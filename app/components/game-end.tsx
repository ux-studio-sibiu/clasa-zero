"use client";

import Image from "next/image";
import "./game-end.scss";
import { useGameStore } from "./zustand-stores/game-store";
import { useState } from "react";

function generateRandomGif() {
  const randomGif = Math.floor(Math.random() * 7) + 1;

  return { 
    randomGif: `/images/gif/game-end-${randomGif}.gif`,
};
}


export default function GameEndSlide() {

  const { answeredCount, gameLength } = useGameStore();
  const [data] = useState(generateRandomGif);

  return (
    <div className={`nsc--game-end`} data-add-this-attribute-on-main="on-game-over-slide">
      <div className="animated-gif"><Image src={data.randomGif} fill sizes="100vw" className="object-cover" alt="background" /></div>
      
      <div className="actions">
        <div 
          className="button style-2 margin-0-auto" 
          onClick={() => window.location.reload()}
        >
          RESTART
        </div>
      </div>
      
      {/* <div style={{color: '#fff', fontSize: '30px'}}> GAME OVER: {answeredCount} </div> */}
 
    </div>

  );
}
